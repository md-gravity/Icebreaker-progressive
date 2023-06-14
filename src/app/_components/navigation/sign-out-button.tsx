'use client'

import {useRouter} from 'next/navigation'
import {FC} from 'react'

interface Props {
  signOut: () => Promise<void>
}

export const SignOutButton: FC<Props> = ({signOut}) => {
  const router = useRouter()
  const logout = async () => {
    await signOut()

    router.refresh()
    router.push('/')
  }

  return (
    <li className={`cursor-pointer`}>
      <span onClick={() => logout()}>Sign Out</span>
    </li>
  )
}
