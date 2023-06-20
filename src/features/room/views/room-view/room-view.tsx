'use client'

import {FC, FormEvent, useEffect, useReducer, useState} from 'react'

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

  const send = async (e: FormEvent) => {
    e.preventDefault()

    await fetch('/api/chat', {
      body: JSON.stringify(
        createPayload({roomUrl: url, text, type: MessageType.Message})
      ),
      credentials: 'include',
      method: 'POST',
    })
    setText('')
  }

  useEffect(() => {
    const see = new EventSource(`/api/chat?roomUrl=${url}`, {
      withCredentials: true,
    })

    see.addEventListener('message', (e) => {
      const sseMessage: SSEMessage = JSON.parse(e.data)
      const messageType = sseMessage.type
      const message = sseMessage.message
      const sender = message.sender

      if (messageType === MessageType.Message) {
        console.log(message)
        addMessage(message)
      }

      console.log(messageType)
      const isOffer = messageType === MessageType.Offer
      const sameUser = sender.id === user.id
      if (isOffer && !sameUser) {
        const offer = JSON.parse(message.text)
        const remoteConnection = new RTCPeerConnection()

        remoteConnection.onicecandidate = () => {
          console.log(
            'candidate',
            JSON.stringify(remoteConnection.localDescription)
          )

          fetch('/api/chat', {
            body: JSON.stringify(
              createPayload({
                roomUrl: url,
                text: JSON.stringify(remoteConnection.localDescription),
                type: MessageType.Answer,
              })
            ),
            credentials: 'include',
            method: 'POST',
          })
        }

        remoteConnection.ondatachannel = (e) => {
          const dataChannel = e.channel

          dataChannel.onmessage = (e) => {
            console.log('message', JSON.parse(e.data))
          }

          dataChannel.onopen = (e) => {
            console.log('remote open')

            dataChannel.send(JSON.stringify({text: 'hello'}))
          }
        }

        remoteConnection.setRemoteDescription(offer).then((e) => {
          console.log('remote offer set')
        })

        remoteConnection.createAnswer().then((answer) => {
          remoteConnection.setLocalDescription(answer).then((e) => {
            console.log('answer set')
          })
        })
      }

      const isAnswer = messageType === MessageType.Answer
      if (isAnswer && !sameUser) {
        const answer = JSON.parse(message.text)
        if (global.setted) return

        global.setted = global.setted ?? false
        global.localConnection.setRemoteDescription(answer).then((e) => {
          global.setted = true
          console.log('answer set')
        })
      }
    })

    return () => {
      see.close()
    }
  }, [url, user.id])

  useEffect(() => {
    /**
     * TODO: p2p
     * 1) You should decide who will be offerer and who will be answerer
     * One peer can not be both offerer and answerer for the same connection
     *
     * 2) You should send only one ice candidate to remote peer
     */
    const localConnection = new RTCPeerConnection()
    global.localConnection = global.localConnection ?? localConnection
    const dataChannel = localConnection.createDataChannel('chat')

    dataChannel.onopen = () => {
      console.log('local open')
    }

    dataChannel.onmessage = (e) => {
      console.log('message', JSON.parse(e.data))
    }

    global.getted = global.getted ?? false
    // 2) after setup local description, we get ice candidates
    localConnection.onicecandidate = () => {
      console.log('candidate', JSON.stringify(localConnection.localDescription))

      if (global.getted) return

      global.getted = true
      // 3) send ice candidates to remote peer
      fetch('/api/chat', {
        body: JSON.stringify(
          createPayload({
            roomUrl: url,
            text: JSON.stringify(localConnection.localDescription),
            type: MessageType.Offer,
          })
        ),
        credentials: 'include',
        method: 'POST',
      })
    }

    // 1) create offer and set it as local description
    localConnection
      .createOffer()
      .then((offer) => {
        return localConnection.setLocalDescription(offer)
      })
      .then(() => {
        console.log('setup successfully')
      })
  }, [url])

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
