export default function HelloLayout({children}: {children: React.ReactNode}) {
  console.log('HelloLayout render')
  return (
    <div>
      <h1>HelloLayout</h1>
      <nav>
        <ul>
          <li>nav 1</li>
        </ul>
      </nav>
      {children}
    </div>
  )
}
