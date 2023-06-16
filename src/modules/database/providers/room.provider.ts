import {UserRecord} from '@modules/database/providers/authentication.provider'
import {DatabaseProvider} from '@modules/database/providers/database.provider'

type RoomRecord = {
  id: string
  url: string
}

type CreatedMessageRecord = {
  id: string
  text: string
  sender: string
}

type FindMessageRecord = {
  id: string
  text: string
  sender: UserRecord
}

export const createRoomProvider = async (dbProvider: DatabaseProvider) => {
  return {
    async createMessage(
      text: string,
      roomId: string
    ): Promise<{message: CreatedMessageRecord}> {
      const [{result, status, detail}] = await dbProvider.query<
        [CreatedMessageRecord[]]
      >(
        `
        CREATE message CONTENT {
          text: $text,
          sender: $auth.id,
          room: $roomId,
        };
      `,
        {roomId, text}
      )

      if (status === 'ERR') {
        throw new Error(detail)
      }

      if (!result) {
        throw new Error('Room query failed')
      }

      const [message] = result
      return {message}
    },
    async createRoom(): Promise<{room: RoomRecord}> {
      const [{result, status, detail}] = await dbProvider.query<
        [RoomRecord[]]
      >(`
        CREATE room CONTENT {
          url: rand::uuid(),
        };
      `)

      if (status === 'ERR') {
        throw new Error(detail)
      }

      if (!result) {
        throw new Error('Room query failed')
      }

      const [room] = result
      return {room}
    },
    async findMessage(id: string): Promise<{message: FindMessageRecord}> {
      /**
       * TODO: remove password from sender
       */
      const [{result, status, detail}] = await dbProvider.query<
        [FindMessageRecord[]]
      >(
        `
        SELECT * FROM message WHERE id = $id FETCH sender;
      `,
        {id}
      )

      if (status === 'ERR') {
        throw new Error(detail)
      }

      if (!result) {
        throw new Error('Room query failed')
      }

      const [message] = result
      return {message}
    },
    async findMessages(
      roomId: string
    ): Promise<{messages: FindMessageRecord[]}> {
      /**
       * TODO: remove password from sender
       */
      const [{result, status, detail}] = await dbProvider.query<
        [FindMessageRecord[]]
      >(
        `
        SELECT * FROM message WHERE room = $roomId FETCH sender;
      `,
        {roomId}
      )

      if (status === 'ERR') {
        throw new Error(detail)
      }

      if (!result) {
        throw new Error('Room query failed')
      }

      const messages = result
      return {messages}
    },
    async findRoom(url: string): Promise<{room: RoomRecord}> {
      const [{result, status, detail}] = await dbProvider.query<[RoomRecord[]]>(
        `
        SELECT * FROM room WHERE url = $url;
      `,
        /**
         * TODO: Add ability to search by id OR url
         */
        {url}
      )

      if (status === 'ERR') {
        throw new Error(detail)
      }

      if (!result) {
        throw new Error('Room query failed')
      }

      const [room] = result
      return {room}
    },
  }
}
