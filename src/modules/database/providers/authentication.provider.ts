import {DatabaseProvider} from '@modules/database/providers/database.provider'

import {
  AUTH_SCOPE_NAME,
  DEFAULT_DATABASE,
  DEFAULT_NAMESPACE,
} from '../constants'
import {Database} from '../library/database'

export type SignUpCredentials = {
  email: string
  password: string
  username?: string
}

export type SignInCredentials = {
  email: string
  password: string
}

export type UserRecord = {
  id: string
  email: string
  username?: string
}

const defaultAuthOptions = {
  DB: DEFAULT_DATABASE,
  NS: DEFAULT_NAMESPACE,
  SC: AUTH_SCOPE_NAME,
}

type SignPayload = {
  token: string
  user: UserRecord
}

export type AuthProvider = ReturnType<typeof createAuthProvider>

export const createAuthProvider = async (dbProvider: DatabaseProvider) => {
  return {
    currentUser: async (token: string): Promise<{user: UserRecord}> => {
      await dbProvider.authenticate(token)
      const [{result}] = await dbProvider.query<[UserRecord[]]>(
        `SELECT id, username, email FROM $auth;`
      )

      if (!result) {
        throw new Error('Auth query failed')
      }

      const [user] = result
      return {user}
    },
    signIn: async (credentials: SignInCredentials): Promise<SignPayload> => {
      const token = await dbProvider.signin({
        ...defaultAuthOptions,
        email: credentials.email,
        password: credentials.password,
      })

      if (!token) {
        throw new Error('User not found')
      }

      const [{result}] = await dbProvider.query<[UserRecord[]]>(
        `SELECT id, username, email FROM $auth;`
      )

      if (!result) {
        throw new Error('Auth query failed')
      }

      const [user] = result
      return {token, user}
    },
    signUp: async (credentials: SignUpCredentials): Promise<SignPayload> => {
      const token = await dbProvider.signup({
        ...defaultAuthOptions,
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      })

      const [{result}] = await dbProvider.query<[UserRecord[]]>(
        `SELECT id, username, email FROM $auth;`
      )

      if (!result) {
        throw new Error('Auth query failed')
      }

      const [user] = result
      return {token, user}
    },
  }
}
