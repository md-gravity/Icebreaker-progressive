'use client'

import {FC, FormEvent, useEffect, useReducer, useState} from 'react'

interface Props {
  url: string
  token: string

  messagesHistory: any[]
}

export const RoomView: FC<Props> = ({url, messagesHistory}) => {
  const [text, setText] = useState('')
  const [messages, addMessage] = useReducer(
    (cache, newMessage) => [...cache, newMessage],
    messagesHistory
  )

  const send = async (e: FormEvent) => {
    e.preventDefault()

    await fetch('/api/chat', {
      body: JSON.stringify({roomUrl: url, text}),
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
      addMessage(JSON.parse(e.data).message)
    })

    return () => {
      see.close()
    }
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
