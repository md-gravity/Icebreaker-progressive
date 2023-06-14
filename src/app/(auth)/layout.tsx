import {redirect} from 'next/navigation'

import {currentUserQuery} from '@features/auth'

export default async function AuthLayout({children}) {
  const {user} = await currentUserQuery()
  if (user) {
    return redirect('/')
  }

  return <>{children}</>
}
