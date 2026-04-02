"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {

  const [data, setData] = useState(null)

  useEffect(() => {

    async function load() {

      const { data: sessionData } = await supabase.auth.getSession()

      const token = sessionData?.session?.access_token

      if (!token) {
        console.error("NO TOKEN")
        return
      }

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/dashboard?wallet=0xAdE4b6B348B133452d3a36B803F6c963eae332A9",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      )

      const json = await res.json()

      setData(json)
    }

    load()

  }, [])

  if (!data) return <div>Loading...</div>

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <p>Wallet: {data.wallet}</p>
      <p>Balance: {data.nativeBalance}</p>

      <h2>Tokens</h2>

      {data.tokens.map(t => (
        <div key={t.symbol}>
          {t.symbol} — {t.amount} — ${t.value_usd.toFixed(2)}
        </div>
      ))}
    </div>
  )
}
