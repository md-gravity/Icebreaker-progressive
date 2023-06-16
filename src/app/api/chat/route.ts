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

export const POST = async (request: Request) => {
  const token = cookies().get('token')?.value
  if (!token) {
    throw new Error('No token provided')
  }

  const body = await request.json()
  const roomUrl = body.roomUrl
  if (!roomUrl) {
    throw new Error('No room url provided')
  }

  /**
   * TODO: Check if room exists
   */

  const text = body.text
  if (!text) {
    throw new Error('No text provided')
  }

  const {message} = await startSession(async (dbProvider) => {
    const authProvider = await createAuthProvider(dbProvider)
    await authProvider.authenticate(token)

    const roomProvider = await createRoomProvider(dbProvider)
    const {room} = await roomProvider.findRoom(roomUrl)
    const {message: createdMessage} = await roomProvider.createMessage(
      text,
      room.id
    )
    return await roomProvider.findMessage(createdMessage.id)
  })

  const roomEmitter = getRoomEmitter(roomUrl)
  roomEmitter.emit('message', {message})

  return NextResponse.json({status: 'ok'})
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
      roomEmitter.on('message', (message) => {
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
