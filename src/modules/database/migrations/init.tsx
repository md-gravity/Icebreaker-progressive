import {startSession} from '@modules/database'

import {AUTH_SCOPE_NAME} from '../constants'
;(async () => {
  await startSession(async (dbProvider) => {
    await dbProvider.query(`
    -- Create user table
    DEFINE TABLE user SCHEMALESS
      PERMISSIONS FOR select, create, update, delete
       WHERE true;

    DEFINE FIELD email ON TABLE user TYPE string
    ASSERT $value != NONE
    AND is::email($value);

    DEFINE FIELD password ON TABLE user TYPE string
    ASSERT $value != NONE;

    DEFINE INDEX userEmailIndex ON TABLE user COLUMNS email UNIQUE;
  `)

    await dbProvider.query(`
    -- Create room table
    DEFINE TABLE room SCHEMALESS;

    DEFINE FIELD url ON TABLE room TYPE string;

    DEFINE INDEX roomUrlIndex ON TABLE user COLUMNS url UNIQUE;
  `)

    await dbProvider.query(`
    -- Create message table
    DEFINE TABLE message SCHEMALESS;
  `)

    await dbProvider.query(`
    DEFINE SCOPE ${AUTH_SCOPE_NAME} SESSION 24h
    SIGNUP (
      CREATE user CONTENT {
        email: $email,
        username: $username,
        password: crypto::argon2::generate($password),
      }
    )
    SIGNIN (
      SELECT * FROM user
      WHERE email = $email AND crypto::argon2::compare(password, $password)
    );
  `)
  })
})()
