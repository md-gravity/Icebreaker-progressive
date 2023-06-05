import {Metadata} from 'next'

export const metadata: Metadata = {
  description: 'hello description',
  title: 'Hello title',
}

export default function WorldLayout({children}: {children: React.ReactNode}) {
  console.log('WorldLayout render')
  return (
    <div>
      <h1>WorldLayout</h1>
      <nav>
        <ul>
          <li>nav 1</li>
        </ul>
      </nav>
      {children}
    </div>
  )
}
