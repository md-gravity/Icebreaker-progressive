import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'

import {currentUserQuery} from '@features/auth'
import {getMessagesByRoomUrl} from '@features/room/procedures/room.queries'
import {RoomView} from '@features/room/views/room-view'
import {SectionContainer} from '@src/app/_components/section-container'

export default async function RoomPage({params: {url}}) {
  const token = cookies().get('token')?.value
  if (!token) {
    redirect('/sign-up')
  }

  const {user} = await currentUserQuery()
  const {messages} = await getMessagesByRoomUrl(url)

  return (
    <SectionContainer>
      <RoomView
        url={url}
        user={user}
        messagesHistory={messages}
      />
    </SectionContainer>
  )
}
