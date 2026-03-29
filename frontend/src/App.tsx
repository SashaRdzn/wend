import { OpenRsvpForm } from './OpenRsvpForm'
import { WeddingLanding } from './WeddingLanding'

function App() {
  return <WeddingLanding rsvpSlot={<OpenRsvpForm />} />
}

export default App
