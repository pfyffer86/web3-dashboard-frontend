"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {

  const [mode, setMode] = useState("login") // login | register | reset

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const router = useRouter()

  /* ================= LOGIN ================= */

  async function handleLogin(e) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  /* ================= REGISTER ================= */

  async function handleRegister(e) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setMessage("")

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage("Account created. Awaiting approval.")
    setLoading(false)
  }

  /* ================= RESET PASSWORD ================= */

  async function handleReset(e) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage("Password reset email sent.")
    setLoading(false)
  }

  /* ================= UI ================= */

  function renderForm() {

    if (mode === "login") {
      return (
        <form className="login-form" onSubmit={handleLogin}>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-message">{message}</div>}

          <button className="button-primary login-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="login-links">
            <span onClick={() => setMode("reset")}>Forgot password?</span>
            <span onClick={() => setMode("register")}>Create account</span>
          </div>

        </form>
      )
    }

    if (mode === "register") {
      return (
        <form className="login-form" onSubmit={handleRegister}>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-message">{message}</div>}

          <button className="button-primary login-button" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="login-links">
            <span onClick={() => setMode("login")}>Back to login</span>
          </div>

        </form>
      )
    }

    if (mode === "reset") {
      return (
        <form className="login-form" onSubmit={handleReset}>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-message">{message}</div>}

          <button className="button-primary login-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="login-links">
            <span onClick={() => setMode("login")}>Back to login</span>
          </div>

        </form>
      )
    }
  }

  return (
    <div className="login-page">

      <div className="card login-card">

        <div className="login-logo">
          APERTUM DASHBOARD
        </div>

        <h1 className="login-title">
          {mode === "login" && "Login"}
          {mode === "register" && "Register"}
          {mode === "reset" && "Reset Password"}
        </h1>

        {renderForm()}

      </div>

    </div>
  )
}
