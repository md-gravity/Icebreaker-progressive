import Link from 'next/link'

export default function HelloLayout({
  children,
  authModal,
}: {
  children: React.ReactNode
  authModal: React.ReactNode
}) {
  return (
    <div>
      <h1>HelloLayout</h1>
      <nav>
        <ul>
          <li>
            <Link href="/hello/login">Login</Link>
          </li>
        </ul>
      </nav>
      {children}
      {authModal}
    </div>
  )
}
