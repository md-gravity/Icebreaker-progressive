import {startSession} from '@modules/database'

import {AUTH_SCOPE_NAME} from '../constants'
;(async () => {
  await startSession(async (dbProvider) => {
    await dbProvider.query(`
    -- Create user table
    DEFINE TABLE user SCHEMALESS
      PERMISSIONS
        FOR create, delete
          WHERE $auth.admin = true
        FOR select, update
          WHERE id = $auth.id
          OR $auth.admin = true;

    DEFINE FIELD email ON TABLE user TYPE string
    ASSERT $value != NONE
    AND is::email($value);

    DEFINE FIELD password ON TABLE user TYPE string
    ASSERT $value != NONE;

    DEFINE INDEX userEmailIndex ON TABLE user COLUMNS email UNIQUE;
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
