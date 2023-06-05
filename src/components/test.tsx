'use client'

import {useState} from 'react'

const Docs = ({children}: {children: React.ReactNode}) => {
  const [title, setState] = useState('')

  return <div>{children}</div>
}

export {Docs}
