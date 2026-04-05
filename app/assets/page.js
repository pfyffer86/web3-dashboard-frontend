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

      if (!res.ok) throw new Error("API error: " + res.status)

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

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (error) return <div style={{ padding: 40 }}>Error: {error}</div>
  if (!data) return null

  const totalValue = data.totalValue || 0
  const tokens = data.tokens || []

  const sorted = [...tokens].sort((a, b) => b.value_usd - a.value_usd)

  return (
    <div style={styles.page}>

      <h1 style={styles.title}>Assets</h1>

      <KPISection totalValue={totalValue} count={tokens.length} />

      <AssetsTable tokens={sorted} totalValue={totalValue} />

      <WalletPlaceholder />

    </div>
  )
}

/* ================= KPI ================= */

function KPISection({ totalValue, count }) {
  return (
    <div style={styles.kpiRow}>

      <Card>
        <div style={styles.kpiLabel}>Total Assets Value</div>
        <div style={styles.kpiValue}>
          ${totalValue.toFixed(2)}
        </div>
      </Card>

      <Card>
        <div style={styles.kpiLabel}>Tracked Assets</div>
        <div style={styles.kpiValue}>
          {count}
        </div>
      </Card>

    </div>
  )
}

/* ================= TABLE ================= */

function AssetsTable({ tokens, totalValue }) {

  return (
    <div style={styles.card}>

      <h3 style={styles.sectionTitle}>Assets Breakdown</h3>

      <table style={styles.table}>

        <thead>
          <tr>
            <th style={styles.th}>Asset</th>
            <th style={styles.th}>Balance</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Value</th>
            <th style={styles.th}>Allocation</th>
          </tr>
        </thead>

        <tbody>
          {tokens.map(t => {

            const allocation = totalValue > 0
              ? (t.value_usd / totalValue) * 100
              : 0

            const price =
              t.price && t.price > 0
                ? t.price
                : (t.amount > 0 ? t.value_usd / t.amount : 0)

            return (
              <tr key={t.symbol} style={styles.tr}>

                <td style={styles.td}>{t.symbol}</td>

                <td style={styles.td}>
                  {t.amount.toFixed(6)}
                </td>

                <td style={styles.td}>
                  ${price.toFixed(2)}
                </td>

                <td style={styles.td}>
                  ${t.value_usd.toFixed(2)}
                </td>

               <td style={styles.td}>
                 <AllocationBar value={allocation} />
               </td>

              </tr>
            )
          })}
        </tbody>

      </table>

    </div>
  )
}

/* ================= REUSABLE CARD ================= */

function Card({ children }) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  )
}

/* ================= PLACEHOLDER ================= */

function WalletPlaceholder() {
  return (
    <div style={{ ...styles.card, marginTop: 30 }}>
      <h3>Wallet Breakdown</h3>
      <p style={{ opacity: 0.6 }}>
        kommt im nächsten Schritt (API Erweiterung)
      </p>
    </div>
  )
}

/* ================= Allocation Bar ================= */

function AllocationBar({ value }) {

  return (
    <div style={{ minWidth: 120 }}>

      <div style={{
        height: 6,
        background: "#222",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 4
      }}>
        <div style={{
          width: `${value}%`,
          background: "#4ade80",
          height: "100%"
        }} />
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        {value.toFixed(1)}%
      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const styles = {

  page: {
    padding: 40,
    color: "#fff"
  },

  title: {
    fontSize: 28,
    marginBottom: 20
  },

  kpiRow: {
    display: "flex",
    gap: 20,
    marginBottom: 30
  },

  card: {
    background: "#111",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #222",
    flex: 1
  },

  kpiLabel: {
    opacity: 0.6,
    marginBottom: 8
  },

  kpiValue: {
    fontSize: 24,
    fontWeight: 600
  },

  sectionTitle: {
    marginBottom: 20
  },

  table: {
    width: "100%"
  },

  th: {
    textAlign: "left",
    padding: 10,
    opacity: 0.7,
    borderBottom: "1px solid #333"
  },

  tr: {
    borderBottom: "1px solid #222"
  },

  td: {
    padding: 10
  }

}
