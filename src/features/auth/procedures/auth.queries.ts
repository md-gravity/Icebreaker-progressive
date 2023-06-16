import {cookies} from 'next/headers'

import {startSession, createAuthProvider} from '@modules/database'

/**
 * TODO: Find a way to cache this query
 * over the server render round-trip
 * Components: - AuthLayout, - Navigation
 */
export const currentUserQuery = async () => {
  const token = cookies().get('token')?.value
  if (!token) {
    return {user: null}
  }

  return await startSession(async (dbProvider) => {
    const authProvider = await createAuthProvider(dbProvider)
    await authProvider.authenticate(token)
    return await authProvider.currentUser()
  })
}
