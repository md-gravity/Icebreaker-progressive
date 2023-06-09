'use client'

import {useRouter} from 'next/navigation'
import {FormEvent} from 'react'

import {signUpAction} from '@features/auth/procedures/auth.actions'
import {SignUpCredentials} from '@modules/database/providers/authentication.provider'
import {Button} from '@src/app/_components/button'

export const SignUpForm = () => {
  const router = useRouter()
  const handleSubmit = async (e: FormEvent<any>) => {
    e.preventDefault()

    const credentials: SignUpCredentials = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
      username: e.currentTarget.username.value,
    }

    await signUpAction(credentials)

    /**
     * TODO: Find way to refresh "currentUserQuery"
     * without refreshing all server components
     * Components: - Navigation
     *
     * Fix frontend pre-fetch and one time forever caching
     * Invalidation of cache on demand
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
          Username:
        </span>
        <input
          type="text"
          name="username"
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
        <Button type={`submit`}>Sign Up</Button>
      </div>
    </form>
  )
}
