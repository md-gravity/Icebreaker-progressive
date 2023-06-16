import {createDatabase, Database} from '../library/database'

export type DatabaseProvider = ReturnType<typeof createDatabaseProvider>

export const createDatabaseProvider = (database: Database) => {
  return {
    authenticate: database.authenticate.bind(database),
    close: database.close.bind(database),
    invalidate: database.invalidate.bind(database),
    query: database.query.bind(database),
    select: database.select.bind(database),
    signin: database.signin.bind(database),
    signup: database.signup.bind(database),
    get status() {
      return database.status
    },
    wait: database.wait.bind(database),
  }
}

interface SessionFunction<Payload> {
  (database: DatabaseProvider): Promise<Payload>
}

export const startSession = async <Payload>(
  sessionFunction: SessionFunction<Payload>
) => {
  const provider = createDatabaseProvider(createDatabase())

  try {
    /**
     * TODO: Do wee need it?
     */
    await provider.wait()
    return await sessionFunction(provider)
    // eslint-disable-next-line no-useless-catch
  } catch (e) {
    throw e
  } finally {
    const connectionIsOpen = provider.status === 0
    if (connectionIsOpen) {
      /**
       * TODO: Check when time will be reduced
       */
      provider.close() // takes ~5s on await
    }
  }
}
