import './globals.css'
import {Inter} from 'next/font/google'

import {Navigation} from '@src/app/_components/navigation'

const inter = Inter({subsets: ['latin']})

export const metadata = {
  description: 'Generated by create next app',
  title: 'Create Next App',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
