import EventEmitter from 'events'

import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

import {createAuthProvider, startSession} from '@modules/database'
import {createRoomProvider} from '@modules/database/providers/room.provider'

declare global {
  // eslint-disable-next-line no-var
  var roomEmitterMap: Map<string, EventEmitter>
}
const roomEmitterMap =
  globalThis.roomEmitterMap ?? new Map<string, EventEmitter>()
// Fix live reload in dev mode
if (process.env.NODE_ENV !== 'production')
  globalThis.roomEmitterMap = roomEmitterMap

const getRoomEmitter = (url: string): EventEmitter => {
  return (
    roomEmitterMap.get(url) ??
    roomEmitterMap.set(url, new EventEmitter()).get(url)!
  )
}

enum MessageType {
  Offer = 'offer',
  Answer = 'answer',
  Message = 'message',
  Init = 'init',
  Join = 'join',
  Leave = 'leave',
}

interface Payload {
  message: Message
  type: MessageType
  roomUrl: string
}

interface Message {
  text: string
}

/**
 * TODO: create different types for different messages
 */
interface SSEMessage {
  type: MessageType
  message: {
    text: string
    sender: any
    room: any
  }
}

declare global {
  // eslint-disable-next-line no-var
  var roomEmitterMap: Map<string, EventEmitter>
}
const usersByRoomIdMap =
  globalThis.usersByRoomIdMap ?? new Map<string, Set<string>>()
// Fix live reload in dev mode
if (process.env.NODE_ENV !== 'production')
  globalThis.usersByRoomIdMap = usersByRoomIdMap

const getRoomUsers = (roomId: string) => {
  return (
    usersByRoomIdMap.get(roomId) ??
    usersByRoomIdMap.set(roomId, new Set()).get(roomId)!
  )
}

export const POST = async (request: Request) => {
  const token = cookies().get('token')?.value
  if (!token) {
    throw new Error('No token provided')
  }

  const payload: Payload = await request.json()
  const roomUrl = payload.roomUrl
  if (!roomUrl) {
    throw new Error('No room url provided')
  }

  /**
   * TODO: Check if room exists
   */

  const originMessage = payload.message

  const roomEmitter = getRoomEmitter(roomUrl)

  if (payload.type === MessageType.Leave) {
    const {user, room} = await startSession(async (dbProvider) => {
      const authProvider = await createAuthProvider(dbProvider)
      await authProvider.authenticate(token)

      const roomProvider = await createRoomProvider(dbProvider)

      return {
        room: (await roomProvider.findRoom(roomUrl)).room,
        user: (await authProvider.currentUser()).user,
      }
    })

    const usersSet = getRoomUsers(room.id)
    usersSet.delete(user.id)

    const sseMessage: SSEMessage = {
      message: {
        room,
        sender: user,
        text: [...usersSet],
      },
      type: MessageType.Leave,
    }
    roomEmitter.emit('message', sseMessage)

    return NextResponse.json({status: 'ok'})
  }

  if (payload.type === MessageType.Join) {
    const {user, room} = await startSession(async (dbProvider) => {
      const authProvider = await createAuthProvider(dbProvider)
      await authProvider.authenticate(token)

      const roomProvider = await createRoomProvider(dbProvider)

      return {
        room: (await roomProvider.findRoom(roomUrl)).room,
        user: (await authProvider.currentUser()).user,
      }
    })

    const usersSet = getRoomUsers(room.id)
    usersSet.add(user.id)

    const sseMessage: SSEMessage = {
      message: {
        room,
        sender: user,
        text: `${user.username} joined the room`,
      },
      type: MessageType.Join,
    }
    roomEmitter.emit('message', sseMessage)

    return NextResponse.json({status: 'ok'})
  }

  if (!originMessage.text) {
    throw new Error('No text provided')
  }

  if (payload.type === MessageType.Message) {
    const {message} = await startSession(async (dbProvider) => {
      const authProvider = await createAuthProvider(dbProvider)
      await authProvider.authenticate(token)

      const roomProvider = await createRoomProvider(dbProvider)
      const {room} = await roomProvider.findRoom(roomUrl)
      const {message: createdMessage} = await roomProvider.createMessage(
        originMessage.text,
        room.id
      )
      return await roomProvider.findMessage(createdMessage.id)
    })

    const sseMessage: SSEMessage = {
      message,
      type: MessageType.Message,
    }
    roomEmitter.emit('message', sseMessage)

    return NextResponse.json({status: 'ok'})
  }

  if ([MessageType.Offer, MessageType.Answer].includes(payload.type)) {
    const {user, room} = await startSession(async (dbProvider) => {
      const authProvider = await createAuthProvider(dbProvider)
      await authProvider.authenticate(token)

      const roomProvider = await createRoomProvider(dbProvider)

      return {
        room: (await roomProvider.findRoom(roomUrl)).room,
        user: (await authProvider.currentUser()).user,
      }
    })

    const sseMessage: SSEMessage = {
      message: {
        ...originMessage,
        room,
        sender: user,
      },
      type: payload.type,
    }
    roomEmitter.emit('message', sseMessage)

    return NextResponse.json({status: 'ok'})
  }

  return NextResponse.json({message: 'Unknown message type', status: 'failure'})
}

export const GET = async (request: Request) => {
  const token = cookies().get('token')?.value
  if (!token) {
    throw new Error('No token provided')
  }

  const {searchParams} = new URL(request.url)
  const roomUrl = searchParams.get('roomUrl')
  if (!roomUrl) {
    throw new Error('No room url provided')
  }

  /**
   * TODO: Check if room exists
   */

  const roomEmitter = getRoomEmitter(roomUrl)
  const eventStream = new ReadableStream({
    async start(controller) {
      const initMessage: SSEMessage = {
        type: MessageType.Init,
      }

      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(initMessage)}\n\n`)
      )

      roomEmitter.on('message', (message: SSEMessage) => {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`)
        )
      })
    },
  })

  return new Response(eventStream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}
