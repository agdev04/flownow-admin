import './app.css'
import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { MeditationsTable } from './MeditationsTable'

export function App() {
  // const [count, setCount] = useState(0)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'start',
      height: '100vh',
      width: '100%',
      backgrooundColor: 'red'
    }}>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
        <MeditationsTable />
      </SignedIn>
      <SignedOut>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </div>
  )
}
