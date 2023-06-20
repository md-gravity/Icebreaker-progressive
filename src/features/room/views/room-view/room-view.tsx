'use client'

import {FC, FormEvent, useEffect, useReducer, useState} from 'react'

import {createWebRTCConnection} from '@modules/webrtc/create-connection'

interface Props {
  url: string
  user: any

  messagesHistory: any[]
}

enum MessageType {
  Offer = 'offer',
  Answer = 'answer',
  Message = 'message',
  Init = 'init',
  Join = 'join',
  Leave = 'leave',
}
interface Message {
  text: string
}

interface Payload {
  message: Message
  type: MessageType
  roomUrl: string
}

/**
 * TODO: create different types for different messages
 * 1) Join message don't need text
 */
interface SSEMessage {
  type: MessageType
  message: {
    text: string
    sender: any
    room: any
  }
}

/**
 * TODO: create different types for different messages
 */
function createPayload({
  type = MessageType.Message,
  text,
  roomUrl,
}: {
  roomUrl: string
  type: MessageType
  text: string
}): Payload {
  return {
    message: {
      text,
    },
    roomUrl,
    type,
  }
}

type UserId = string
const usersMap = new Map<UserId, ReturnType<typeof createWebRTCConnection>>()

export const RoomView: FC<Props> = ({url, messagesHistory, user}) => {
  const [text, setText] = useState('')
  const [messages, addMessage] = useReducer(
    (cache, newMessage) => [...cache, newMessage],
    messagesHistory
  )

  useEffect(() => {
    const see = new EventSource(`/api/chat?roomUrl=${url}`, {
      withCredentials: true,
    })

    see.onmessage = async (e) => {
      const sseMessage: SSEMessage = JSON.parse(e.data)
      const messageType = sseMessage.type

      if (sseMessage.type === MessageType.Init) {
        await fetch('/api/chat', {
          body: JSON.stringify({
            roomUrl: url,
            type: 'join',
          }),
          credentials: 'include',
          method: 'POST',
        })
        return
      }

      const message = sseMessage.message
      const sender = message.sender

      const sameUser = sender.id === user.id
      if (sameUser) {
        return
      }

      // TODO: make with sender
      const connection =
        usersMap.get(user.id) ??
        usersMap.set(user.id, createWebRTCConnection()).get(user.id)

      if (!connection) {
        throw new Error('connection not found')
      }

      const isJoin = messageType === MessageType.Join
      if (isJoin) {
        await connection.createOffer('chat')

        await fetch('/api/chat', {
          body: JSON.stringify({
            message: {
              text: JSON.stringify(connection.localDescription),
            },
            roomUrl: url,
            type: 'offer',
          }),
          credentials: 'include',
          method: 'POST',
        })
      }

      const isLeave = messageType === MessageType.Leave
      if (isLeave) {
        // TODO: make with sender
        connection.close()
        usersMap.delete(user.id)
      }

      const isAnswer = messageType === MessageType.Answer
      if (isAnswer) {
        const answer = JSON.parse(message.text)
        await connection.setRemoteDescription(answer)

        // TODO: clean up
        connection.onData((e) => {
          addMessage(JSON.parse(e.data).message)
        })

        connection.onOpen((e) => {
          console.log('open', e.data)
        })
      }

      const isOffer = messageType === MessageType.Offer
      if (isOffer) {
        const offer = JSON.parse(message.text)
        await connection.createAnswer(offer)

        await fetch('/api/chat', {
          body: JSON.stringify({
            message: {
              text: JSON.stringify(connection.localDescription),
            },
            roomUrl: url,
            type: 'answer',
          }),
          credentials: 'include',
          method: 'POST',
        })

        // TODO: clean up
        connection.onData((e) => {
          addMessage(JSON.parse(e.data).message)
        })

        connection.onOpen((e) => {
          console.log('open', e.data)
        })
      }
    }
  }, [url, user.id])

  /*
  useEffect(() => {
    ;(async () => {
      const see = new EventSource(`/api/chat?roomUrl=${url}`, {
        withCredentials: true,
      })

      see.onopen = (e) => {
        setSseReady(true)
      }

      type UserId = string
      const usersMap = new Map<UserId, RTCPeerConnection>()

      see.onmessage = async (e) => {
        const sseMessage: SSEMessage = JSON.parse(e.data)
        const messageType = sseMessage.type

        // TODO: need to trigger onopen event on client side
        if (messageType === MessageType.Init) {
          return
        }

        const message = sseMessage.message
        const sender = message.sender

        const sameUser = sender.id === user.id

        const webRTCConnection = createWebRTCConnection()

        webRTCConnection.onData((e) => {
          console.log(e.data)
          addMessage(JSON.parse(e.data).message)
        })

        webRTCConnection.onOpen((e) => {
          console.log('init open', e.data)
        })

        const isJoin = messageType === MessageType.Join
        if (isJoin) {
          global.connection = webRTCConnection
          await webRTCConnection.createOffer('chat')

          await fetch('/api/chat', {
            body: JSON.stringify({
              message: {
                text: JSON.stringify(webRTCConnection.localDescription),
              },
              roomUrl: url,
              type: 'offer',
            }),
            credentials: 'include',
            method: 'POST',
          })
        }

        if (sameUser) {
          return
        }

        const isLeave = messageType === MessageType.Leave
        if (isLeave) {
          webRTCConnection.setLocalDescription(null)
          webRTCConnection.setRemoteDescription(null)
        }

        const description = JSON.parse(message.text)

        const isOffer = messageType === MessageType.Offer
        if (isOffer) {
          await webRTCConnection.createAnswer(description)
          console.log('create answer')

          await fetch('/api/chat', {
            body: JSON.stringify({
              message: {
                text: JSON.stringify(webRTCConnection.localDescription),
              },
              roomUrl: url,
              type: 'answer',
            }),
            credentials: 'include',
            method: 'POST',
          })
        }

        const isAnswer = messageType === MessageType.Answer
        if (isAnswer) {
          console.log('set answer', description)
          await webRTCConnection.setRemoteDescription(description)
        }
      }
    })()

    window.onbeforeunload = () => {
      fetch('/api/chat', {
        body: JSON.stringify({
          roomUrl: url,
          type: 'leave',
        }),
        credentials: 'include',
        method: 'POST',
      })
    }

    return () => {
      fetch('/api/chat', {
        body: JSON.stringify({
          roomUrl: url,
          type: 'leave',
        }),
        credentials: 'include',
        method: 'POST',
      })
    }
  }, [url, user.id])
*/

  const send = async (e: FormEvent) => {
    e.preventDefault()

    const data = await fetch('/api/messages', {
      body: JSON.stringify({message: {text}, roomUrl: url}),
      credentials: 'include',
      method: 'POST',
    }).then((res) => res.json())
    addMessage(data.message)

    const connection = usersMap.get(user.id)
    if (!connection) {
      throw new Error('connection not found')
    }

    connection.sendData(JSON.stringify(data))

    setText('')
  }

  return (
    <div
      className={`
      flex flex-col
      h-full
    `}
    >
      <div
        className={`
          flex
          justify-center
          items-center
          cursor-pointer
          mb-10
          hover:shadow-md
          transition-shadow duration-300
        `}
        onClick={() =>
          navigator.clipboard.writeText(`${location.origin}/room/${url}`)
        }
      >
        <span className={`grow bg-gray-300 py-4 text-center text-gray-700`}>
          {url}
        </span>
        <span
          className={`
            py-4 
            text-center  
            bg-emerald-100
            basis-1/5
         `}
        >
          Copy
        </span>
      </div>
      <div className={`grow flex h-full flex-col`}>
        <div
          className={`
            mb-5 
            h-auto 
            border 
            border-stone-700
            py-4 px-5
            grow
          `}
        >
          <ul className={`flex flex-col justify-end h-full`}>
            {messages.map((message) => (
              <li key={message.id}>
                <span>
                  <b>{message.sender.username}:</b>
                </span>
                {message.text}
              </li>
            ))}
          </ul>
        </div>
        <form
          className={`
          flex
          mb-10
        `}
          onSubmit={send}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            type="text"
            className={`py-2 px-4 border grow border-zinc-400`}
          />
          <button
            className={`
              py-2 px-4 
              border border-l-0 border-zinc-400
              cursor-pointer 
              basis-1/4 
              hover:bg-emerald-100
              transition-colors duration-300
            `}
            type={'submit'}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
