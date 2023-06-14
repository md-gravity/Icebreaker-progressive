import {currentUserQuery} from '@features/auth'
import {SectionContainer} from '@src/app/_components/section-container'

export default async function HomePage() {
  const {user} = await currentUserQuery()

  return (
    <main>
      <SectionContainer>
        <div className={`flex justify-center mt-20`}>
          <h1 className={`font-light`}>Welcome to the home page!</h1>
        </div>
        {user ? <div>{user.username}</div> : 'non user'}
      </SectionContainer>
    </main>
  )
}
