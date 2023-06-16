import {FC, ReactNode} from 'react'

interface Props {
  children: ReactNode
}

export const SectionContainer: FC<Props> = ({children}) => {
  return (
    <div
      className={`
        w-3/5 mx-auto
        grow
        pt-20
      `}
    >
      {children}
    </div>
  )
}
