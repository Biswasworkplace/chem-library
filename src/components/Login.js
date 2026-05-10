import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [message, setMessage] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f9fb', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: 380, background: '#fff', borderRadius: 16,
        border: '1px solid #e8eaed', padding: '40px 36px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧪</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
            Chem Library
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '6px 0 0' }}>
            Your personal chemistry study vault
          </p>
        </div>

        <div style={{ display: 'flex', marginBottom: 24, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 14, fontWeight: 500, transition: 'all .15s',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#1a1a2e' : '#6b7280',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handle}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
              Email
            </span>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit', transition: 'border .15s'
              }}
              onFocus={e => e.target.style.borderColor = '#4A90D9'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
              Password
            </span>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit', transition: 'border .15s'
              }}
              onFocus={e => e.target.style.borderColor = '#4A90D9'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </label>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16
            }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#16a34a', marginBottom: 16
            }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px 0', background: '#4A90D9', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit', transition: 'background .15s'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#357ABD' }}
            onMouseLeave={e => e.target.style.background = '#4A90D9'}
          >
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  )
}
