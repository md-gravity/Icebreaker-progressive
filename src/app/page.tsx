import {CreateRoomButton} from '@src/app/_components/create-room-button'
import {SectionContainer} from '@src/app/_components/section-container'

export default async function HomePage() {
  return (
    <main>
      <SectionContainer>
        <div className={`flex justify-center mt-20 mb-20`}>
          <h1 className={`font-light`}>Welcome to the home page!</h1>
        </div>
        <hr />
        <div className={`mt-10 text-center`}>
          <CreateRoomButton />
        </div>
      </SectionContainer>
    </main>
  )
}
