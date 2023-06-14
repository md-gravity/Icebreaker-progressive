import {FC, ReactNode} from 'react'

interface Props {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
}

export const Button: FC<Props> = ({type = 'button', children}) => {
  return (
    <button
      type={type}
      className={`
      py-2
      px-3
      border border-gray-300
      rounded-md
    `}
    >
      {children}
    </button>
  )
}
