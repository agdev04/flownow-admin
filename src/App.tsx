import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { MeditationsTable } from './MeditationsTable'

export function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
        <MeditationsTable />
      </SignedIn>
      <SignedOut>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </>
  )
}
