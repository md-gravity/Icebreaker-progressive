'use server'

import {revalidatePath} from 'next/cache'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'

import {startSession, createAuthProvider} from '@modules/database'
import {SignUpCredentials} from '@modules/database/providers/authentication.provider'

export const signUpAction = async (credentials: SignUpCredentials) => {
  await startSession(async (dbProvider) => {
    const authProvider = await createAuthProvider(dbProvider)

    const {token} = await authProvider.signUp(credentials)
    cookies().set('token', token)
  })
}

export const signInAction = async (credentials: SignUpCredentials) => {
  await startSession(async (dbProvider) => {
    const authProvider = await createAuthProvider(dbProvider)

    const {token} = await authProvider.signIn(credentials)
    cookies().set('token', token)
  })
}

export const signOut = async () => {
  cookies().delete('token')
}
