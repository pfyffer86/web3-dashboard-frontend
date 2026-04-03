"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function SettingsPage() {

  const [wallets, setWallets] = useState([])
  const [address, setAddress] = useState("")
  const [label, setLabel] = useState("")
  const [loading, setLoading] = useState(false)

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

  async function addWallet() {

    if (!address) return

    if (!address.startsWith("0x") || address.length !== 42) {
      alert("Invalid wallet")
      return
    }

    setLoading(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/wallets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          address,
          label
        })
      }
    )

    const json = await res.json()

    if (json.error) {
      alert(json.error)
    }

    setAddress("")
    setLabel("")
    setLoading(false)

    loadWallets()
  }

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

  useEffect(() => {
    loadWallets()
  }, [])

  return (
    <div style={{ padding: 40 }}>

      <h1>Settings</h1>

      {/* ===== ADD WALLET ===== */}
      <div style={{ marginTop: 20, marginBottom: 30 }}>

        <h3>Add Wallet</h3>

        <input
          placeholder="Wallet address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ marginRight: 10, width: 300 }}
        />

        <input
          placeholder="Label (optional)"
          value={label}
          onChange={e => setLabel(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <button onClick={addWallet} disabled={loading}>
          Add
        </button>

      </div>

      {/* ===== WALLET LIST ===== */}
      <div>

        <h3>Wallets</h3>

        {wallets.map(w => (
          <div key={w.id} style={{ marginBottom: 10 }}>
            {w.address} ({w.label || "no label"})

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
