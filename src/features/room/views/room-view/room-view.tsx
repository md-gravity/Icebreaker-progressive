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
}
interface Message {
  text: string
}

interface Payload {
  message: Message
  type: MessageType
  roomUrl: string
}

interface SSEMessage {
  type: MessageType
  message: {
    text: string
    sender: any
    room: any
  }
}

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

export const RoomView: FC<Props> = ({url, messagesHistory, user}) => {
  const [text, setText] = useState('')
  const [messages, addMessage] = useReducer(
    (cache, newMessage) => [...cache, newMessage],
    messagesHistory
  )

  useEffect(() => {
    ;(async () => {
      const see = new EventSource(`/api/chat?roomUrl=${url}`, {
        withCredentials: true,
      })

      see.addEventListener('message', async (e) => {
        const sseMessage: SSEMessage = JSON.parse(e.data)
        const messageType = sseMessage.type
        const message = sseMessage.message
        const sender = message.sender

        const sameUser = sender.id === user.id
        if (sameUser) {
          return
        }

        const description = JSON.parse(message.text)

        const isOffer = messageType === MessageType.Offer
        if (isOffer) {
          const connection = createWebRTCConnection()
          global.connection = connection
          await connection.createAnswer(description)

          connection.onOpen((e) => {
            console.log('on Open remote', e.data)
          })

          connection.onData((e) => {
            addMessage(JSON.parse(e.data).message)
          })

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
        }

        const isAnswer = messageType === MessageType.Answer
        if (isAnswer) {
          await connectionInitiator.setRemoteDescription(description)
        }
      })

      const connectionInitiator = createWebRTCConnection()
      global.connection = connectionInitiator
      await connectionInitiator.createOffer('chat')

      connectionInitiator.onData((e) => {
        addMessage(JSON.parse(e.data).message)
      })

      connectionInitiator.onOpen((e) => {
        console.log('init open', e.data)
      })

      await fetch('/api/chat', {
        body: JSON.stringify({
          message: {
            text: JSON.stringify(connectionInitiator.localDescription),
          },
          roomUrl: url,
          type: 'offer',
        }),
        credentials: 'include',
        method: 'POST',
      })
    })()
  }, [url, user.id])

  const send = async (e: FormEvent) => {
    e.preventDefault()

    const api: 'webrtc' | 'rest' = 'webrtc'
    if (api === 'rest') {
      await fetch('/api/chat', {
        body: JSON.stringify(
          createPayload({roomUrl: url, text, type: MessageType.Message})
        ),
        credentials: 'include',
        method: 'POST',
      })
    }

    if (api === 'webrtc') {
      const data = await fetch('/api/messages', {
        body: JSON.stringify({message: {text}, roomUrl: url}),
        credentials: 'include',
        method: 'POST',
      }).then((res) => res.json())
      addMessage(data.message)
      global.connection.sendData(JSON.stringify(data))
    }
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
