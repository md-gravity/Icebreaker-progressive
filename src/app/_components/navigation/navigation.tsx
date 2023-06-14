import Link from 'next/link'

import {currentUserQuery} from '@features/auth/procedures/auth.queries'

import {AuthNavigation} from './auth-navigation'
import {NotAuthNavigation} from './not-auth-navigation'

export async function Navigation() {
  const {user} = await currentUserQuery()

  return (
    <div className={`border-[1px] py-6 px-4 shadow-sm`}>
      <ul className={`flex gap-3`}>
        <li>
          <Link href={`/`}>Home</Link>
        </li>
        {user ? <AuthNavigation user={user} /> : <NotAuthNavigation />}
      </ul>
    </div>
  )
}
