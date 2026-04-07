"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function AssetsPage() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/dashboard",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      )

      if (!res.ok) {
        throw new Error("API error: " + res.status)
      }

      const json = await res.json()
      setData(json)

    } catch (err) {
      console.error("LOAD ERROR:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (error) return <div style={{ padding: 40 }}>Error: {error}</div>
  if (!data) return null

  const totalValue = data.totalValue || 0
  const tokens = data.tokens || []

  const sorted = [...tokens].sort((a, b) => b.value_usd - a.value_usd)

  return (
    <div style={{ padding: 40 }}>

      <h1>Assets</h1>

      <div style={{ display: "flex", gap: 20, marginTop: 20, marginBottom: 30 }}>
        <div style={cardStyle}>
          <div>Total Value</div>
          <h2>${totalValue.toFixed(2)}</h2>
        </div>

        <div style={cardStyle}>
          <div>Assets</div>
          <h2>{tokens.length}</h2>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginBottom: 20 }}>Assets</h3>

        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={th}>Asset</th>
              <th style={th}>Balance</th>
              <th style={th}>Price</th>
              <th style={th}>Value</th>
              <th style={th}>Allocation</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map(t => {

              const allocation =
                totalValue > 0 ? (t.value_usd / totalValue) * 100 : 0

              const price =
                t.price && t.price > 0
                  ? t.price
                  : (t.amount > 0 ? t.value_usd / t.amount : 0)

              return (
                <tr key={t.symbol}>
                  <td style={td}>{t.symbol}</td>
                  <td style={td}>{t.amount.toFixed(6)}</td>
                  <td style={td}>${price.toFixed(2)}</td>
                  <td style={td}>${t.value_usd.toFixed(2)}</td>
                  <td style={td}>{allocation.toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const cardStyle = {
  background: "#111",
  padding: 20,
  borderRadius: 10,
  flex: 1,
  color: "#fff",
  border: "1px solid #222"
}

const th = {
  padding: 10,
  opacity: 0.7,
  textAlign: "left"
}

const td = {
  padding: 10
}
