"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function WalletsPage() {

  const [wallets, setWallets] = useState([])
  const [newWallet, setNewWallet] = useState("")

  // ===== LOAD =====
  async function loadWallets() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/wallets",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )

    const json = await res.json()
    setWallets(json)
  }

  // ===== ADD =====
  async function addWallet() {

    if (!newWallet) return

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/wallets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          address: newWallet
        })
      }
    )

    setNewWallet("")
    loadWallets()
  }

  // ===== DELETE =====
  async function deleteWallet(id) {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      `https://apertum-dashboard-production.up.railway.app/api/wallets/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )

    loadWallets()
  }

  // ===== INIT =====
  useEffect(() => {
    loadWallets()
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>Wallets</h1>

      {/* ADD */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="0x..."
          value={newWallet}
          onChange={e => setNewWallet(e.target.value)}
          style={{ marginRight: 10, width: 300 }}
        />
        <button onClick={addWallet}>Add</button>
      </div>

      {/* LIST */}
      <div>
        {wallets.map(w => (
          <div key={w.id} style={{ marginBottom: 10 }}>
            {w.address}
            <button
              onClick={() => deleteWallet(w.id)}
              style={{ marginLeft: 10 }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
