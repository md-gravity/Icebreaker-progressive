import {useEffect} from 'react'

export default function RootTemplate({children}: {children: React.ReactNode}) {
  // why does it not re-render twice?
  console.log('RootTemplate render')
  return (
    <div>
      <h2>Template</h2>
      {children}
    </div>
  )
}
