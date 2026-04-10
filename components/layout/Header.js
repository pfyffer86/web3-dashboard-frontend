"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { IconUser, IconLogout, IconLogin } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export default function Header() {

  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)

  const router = useRouter()

  // ===== LOAD USER =====
  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data?.user || null)
  }

  // ===== LOGOUT =====
  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setOpen(false)
    router.push("/login")
  }

  useEffect(() => {
    loadUser()

    // 🔥 wichtig: session listener
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="header">

      <div className="header-right">

        <div
          className="user-button"
          onClick={() => setOpen(!open)}
        >
          <IconUser size={18} />
        </div>

        {open && (
          <div className="user-dropdown">

            {user ? (
              <>
                <div className="user-info">
                  Logged in:
                  <br />
                  <span>{user.email}</span>
                </div>

                <button
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  <IconLogout size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                className="dropdown-item"
                onClick={() => router.push("/login")}
              >
                <IconLogin size={16} />
                Login
              </button>
            )}

          </div>
        )}

      </div>

    </div>
  )
}
