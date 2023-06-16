'use client'

import {useRouter} from 'next/navigation'

import {createRoomAction} from '@features/room/procedures/room.actions'

export const CreateRoomButton = () => {
  const router = useRouter()
  const createRoom = async () => {
    const {room} = await createRoomAction()
    router.push(`/room/${room.url}`)
  }

  return (
    <button
      className={`
        py-2
        px-4
        bg-blue-500
        rounded-md
        text-teal-50
    `}
      onClick={createRoom}
    >
      Create Meeting
    </button>
  )
}
