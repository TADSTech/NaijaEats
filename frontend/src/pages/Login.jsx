import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useToast } from '../components/Toast.jsx'

export default function Login() {
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { show } = useToast()
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Check local storage for realistic simulation
    const users = JSON.parse(localStorage.getItem('naijaeats_users') || '[]')
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      localStorage.setItem('naijaeats_user', JSON.stringify({ name: user.name, email: user.email }))
      
      setTimeout(() => {
        show('Welcome back!', 'success')
        navigate('/dashboard')
      }, 800)
    } else {
      setTimeout(() => {
        setSubmitting(false)
        show('Invalid credentials. Please create an account first.', 'error')
      }, 600)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex min-h-screen flex-col bg-navy"
    >
      <div className="absolute inset-0 grid-bg opacity-50" />

      <header className="container-x relative z-10 flex h-20 items-center justify-between">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-white">
          <ArrowLeft size={16} /> Back home
        </Link>
      </header>

      <main className="container-x relative z-10 flex flex-1 items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-soft/80 p-8 shadow-card backdrop-blur"
        >
          <div className="mb-7 text-center">
            <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted">Log in to continue with NaijaEats.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bayo@example.com"
                required
                className="auth-input"
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="auth-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <div className="text-right">
              <a href="#" className="text-xs font-medium text-gold transition hover:text-gold-soft">
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-70">
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Logging in…
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don’t have an account?{' '}
            <Link to="/signup" className="font-semibold text-gold transition hover:text-gold-soft">
              Sign up
            </Link>
          </p>
        </motion.div>
      </main>

      <style>{`
        .auth-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(14,27,46,0.55);
          padding: 12px 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .auth-input::placeholder { color: rgba(169,182,201,0.55); }
        .auth-input:focus {
          border-color: #F2B137;
          box-shadow: 0 0 0 4px rgba(242,177,55,0.16);
        }
      `}</style>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      {children}
    </label>
  )
}
