import Link from 'next/link'

export const NotAuthNavigation = () => {
  return (
    <>
      <li>
        <Link href="/sign-up">Sign Up</Link>
      </li>
      <li>
        <Link href="/sign-in">Login</Link>
      </li>
    </>
  )
}
