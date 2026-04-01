"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {

  const [data, setData] = useState(null)

  useEffect(() => {

  const token = localStorage.getItem("token")

  console.log("TOKEN:", token)

  fetch("https://apertum-dashboard-production.up.railway.app/api/dashboard?wallet=0xAdE4b6B348B133452d3a36B803F6c963eae332A9", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => {
      console.log("STATUS:", res.status)

      if (!res.ok) {
        throw new Error("API error: " + res.status)
      }

      return res.json()
    })
    .then(data => {
      console.log("API DATA:", data)
      setData(data)
    })
    .catch(err => {
      console.error("FETCH ERROR:", err)
    })

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
