'use client'

import {useRouter} from 'next/navigation'
import {FormEvent} from 'react'

import {signInAction} from '@features/auth/procedures/auth.actions'
import {SignInCredentials} from '@modules/database/providers/authentication.provider'
import {Button} from '@src/app/_components/button'

export const SignInForm = () => {
  const router = useRouter()
  const handleSubmit = async (e: FormEvent<any>) => {
    e.preventDefault()

    const credentials: SignInCredentials = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    }

    await signInAction(credentials)

    /**
     * TODO: why components re-renders couple times
     * Components: - AuthLayout, - Navigation
     */
    router.refresh()
    router.push('/')
  }

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete={`off`}
      className={`flex flex-col gap-5`}
    >
      <label className={`flex flex-col`}>
        <span
          className={`
            mb-2
          `}
        >
          *Email:
        </span>
        <input
          type="text"
          name="email"
          className={`
            w-full py-2 px-4 
            border border-gray-300 
            rounded-md
          `}
        />
      </label>
      <label className={`flex flex-col`}>
        <span
          className={`
            mb-2
          `}
        >
          *Password:
        </span>
        <input
          type="text"
          name="password"
          className={`
            w-full py-2 px-4 
            border border-gray-300 
            rounded-md
          `}
        />
      </label>
      <div>
        <Button type={`submit`}>Login</Button>
      </div>
    </form>
  )
}
