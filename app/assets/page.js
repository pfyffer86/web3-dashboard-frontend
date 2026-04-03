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
      console.error("ASSETS ERROR:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ===== STATES =====
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (error) return <div style={{ padding: 40 }}>Error: {error}</div>
  if (!data) return null

  // ===== DERIVED =====
  const totalValue = data.totalValue || 0
  const tokens = data.tokens || []

  // Sort by value desc
  const sorted = [...tokens].sort((a, b) => b.value_usd - a.value_usd)

  // ===== RENDER =====
  return (
    <div style={{ padding: 40 }}>

      {/* ===== HEADER ===== */}
      <h1>Assets</h1>

      {/* ===== KPI ROW ===== */}
      <div style={{
        display: "flex",
        gap: 20,
        marginTop: 20,
        marginBottom: 30
      }}>

        {/* Total Value */}
        <div style={cardStyle}>
          <div>Total Assets Value</div>
          <h2>${totalValue.toFixed(2)}</h2>
        </div>

        {/* Asset Count */}
        <div style={cardStyle}>
          <div>Tracked Assets</div>
          <h2>{tokens.length}</h2>
        </div>

      </div>

      {/* ===== ASSETS BREAKDOWN ===== */}
      <div style={cardStyle}>

        <h3 style={{ marginBottom: 20 }}>Assets Breakdown</h3>

        <table style={{ width: "100%" }}>
          <thead>
            <tr style={thRow}>
              <th style={th}>Asset</th>
              <th style={th}>Balance</th>
              <th style={th}>Price</th>
              <th style={th}>Value</th>
              <th style={th}>Allocation</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map(t => {

              const allocation = totalValue > 0
                ? (t.value_usd / totalValue) * 100
                : 0

              return (
                <tr key={t.symbol} style={tr}>
                  <td style={td}>{t.symbol}</td>
                  <td style={td}>{t.amount.toFixed(6)}</td>
                  <td style={td}>${t.price?.toFixed(2) || "0.00"}</td>
                  <td style={td}>${t.value_usd.toFixed(2)}</td>
                  <td style={td}>
                    {allocation.toFixed(1)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

      </div>

      {/* ===== WALLET BREAKDOWN (placeholder) ===== */}
      <div style={{ ...cardStyle, marginTop: 30 }}>
        <h3>Wallet Breakdown</h3>
        <p style={{ opacity: 0.6 }}>
          kommt im nächsten Schritt (API Erweiterung)
        </p>
      </div>

    </div>
  )
}

// ===== STYLES =====
const cardStyle = {
  background: "#111",
  padding: 20,
  borderRadius: 10,
  flex: 1,
  color: "#fff",
  border: "1px solid #222"
}

const thRow = {
  textAlign: "left",
  borderBottom: "1px solid #333"
}

const th = {
  padding: 10,
  opacity: 0.7
}

const tr = {
  borderBottom: "1px solid #222"
}

const td = {
  padding: 10
}
