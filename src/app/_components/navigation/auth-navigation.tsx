import {FC} from 'react'

import {signOut} from '@features/auth'
import {UserRecord} from '@modules/database/providers/authentication.provider'
import {SignOutButton} from '@src/app/_components/navigation/sign-out-button'

interface Props {
  user: UserRecord
}

export const AuthNavigation: FC<Props> = ({user}) => {
  return (
    <>
      <li>
        <h1 className={`font-semibold`}>
          Welcome {user.username ?? user.username}
        </h1>
      </li>
      <SignOutButton signOut={signOut} />
    </>
  )
}
