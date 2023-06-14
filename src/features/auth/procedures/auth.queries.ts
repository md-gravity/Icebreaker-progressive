import {cookies} from 'next/headers'

import {startSession, createAuthProvider} from '@modules/database'

/**
 * TODO: fix unnecessary calls in components
 * Components: - AuthLayout, - Navigation
 */
export const currentUserQuery = async () => {
  const token = cookies().get('token')?.value
  if (!token) {
    return {user: null}
  }

  return await startSession(async (dbProvider) => {
    const authProvider = await createAuthProvider(dbProvider)
    return await authProvider.currentUser(token)
  })
}
