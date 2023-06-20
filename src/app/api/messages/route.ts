import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'

import {createAuthProvider, startSession} from '@modules/database'
import {createRoomProvider} from '@modules/database/providers/room.provider'

interface Message {
  text: string
}

interface Payload {
  message: Message
  roomUrl: string
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
  if (!originMessage.text) {
    throw new Error('No text provided')
  }

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

  return NextResponse.json({message})
}
