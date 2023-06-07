import Link from 'next/link'

export default function HelloLayout({
  children,
  authModal,
  modal,
}: {
  children: React.ReactNode
  authModal: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div>
      <h1>HelloLayout</h1>
      <nav>
        <ul>
          <li>
            <Link href="/hello/login">Login</Link>
            <Link href="/hello/main">Main</Link>
            <Link href="/hello">Hello</Link>
            <Link href="/hello/hey">Hey</Link>
          </li>
        </ul>
      </nav>
      {children}
      {authModal}
      {modal}
    </div>
  )
}
