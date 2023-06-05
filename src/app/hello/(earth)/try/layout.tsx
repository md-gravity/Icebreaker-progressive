export default function EarthLayout({children}: {children: React.ReactNode}) {
  console.log('EarthLayout render')
  return (
    <div>
      <h1>EarthLayout</h1>
      <nav>
        <ul>
          <li>nav 1</li>
        </ul>
      </nav>
      {children}
    </div>
  )
}
