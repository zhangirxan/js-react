import { isFirebaseConfigured } from '../services/firebase.js'

export default function FirebaseWarning() {
  if (isFirebaseConfigured) return null

  return (
    <p className="auth-warning">
      Firebase keys are missing. Copy <code>.env.example</code> to <code>.env.local</code> and fill it in.
    </p>
  )
}
