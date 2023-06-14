import Surreal from 'surrealdb.js'

import {
  DB_API_URL,
  DEFAULT_DATABASE,
  DEFAULT_NAMESPACE,
  ROOT_PASSWORD,
  ROOT_USER,
} from '@modules/database/constants'

export type Database = ReturnType<typeof createDatabase>

export const createDatabase = () => {
  return new Surreal(DB_API_URL, {
    auth: {
      pass: ROOT_PASSWORD,
      user: ROOT_USER,
    },
    db: DEFAULT_DATABASE,
    ns: DEFAULT_NAMESPACE,
  })
}
