'use server'

import {cookies} from 'next/headers'

import {createAuthProvider, startSession} from '@modules/database'
import {createRoomProvider} from '@modules/database/providers/room.provider'

export const getMessagesByRoomUrl = async (url: string) => {
  return await startSession(async (dbProvider) => {
    const token = cookies().get('token')?.value
    if (!token) {
      throw new Error('No token provided')
    }

    const authProvider = await createAuthProvider(dbProvider)
    await authProvider.authenticate(token)

    const roomProvider = await createRoomProvider(dbProvider)
    const {room} = await roomProvider.findRoom(url)
    return await roomProvider.findMessages(room.id)
  })
}
