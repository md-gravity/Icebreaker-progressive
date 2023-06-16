import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'

import {getMessagesByRoomUrl} from '@features/room/procedures/room.queries'
import {RoomView} from '@features/room/views/room-view'
import {SectionContainer} from '@src/app/_components/section-container'

export default async function RoomPage({params: {url}}) {
  const token = cookies().get('token')?.value
  if (!token) {
    redirect('/sign-up')
  }

  const {messages} = await getMessagesByRoomUrl(url)

  return (
    <SectionContainer>
      <RoomView
        url={url}
        token={token}
        messagesHistory={messages}
      />
    </SectionContainer>
  )
}
