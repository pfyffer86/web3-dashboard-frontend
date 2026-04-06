"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

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

      <AllocationChart tokens={sorted} totalValue={totalValue} />

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
          {formatUSD(totalValue)}
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

/* ================= CHART ================= */

function AllocationChart({ tokens, totalValue }) {

  const threshold = 3.5

  const prepared = tokens.map(t => {
    const value = t.value_usd || 0
    const allocation = totalValue > 0
      ? (value / totalValue) * 100
      : 0

    return {
      name: t.symbol,
      value,
      allocation
    }
  })

  let others = 0

  const filtered = prepared.filter(t => {
    if (t.allocation < threshold) {
      others += t.value
      return false
    }
    return true
  })

  if (others > 0) {
    filtered.push({
      name: "Others",
      value: others
    })
  }

  return (
    <div style={styles.card}>

      <h3 style={styles.sectionTitle}>Allocation</h3>

      <div style={{ width: "100%", height: 300 }}>

        <ResponsiveContainer>
          <PieChart>

            <Pie
              data={filtered}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              label={({ percent }) =>
                percent > 0.04
                  ? `${(percent * 100).toFixed(0)}%`
                  : ""
              }
            >
              {filtered.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(index, entry.name)}
                />
              ))}
            </Pie>

            <Tooltip formatter={(v) => formatUSD(v)} />

            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => value}
            />

          </PieChart>
        </ResponsiveContainer>

      </div>

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
            <th style={styles.thRight}>Balance</th>
            <th style={styles.thRight}>Price</th>
            <th style={styles.thRight}>Value</th>
            <th style={styles.thRight}>Allocation</th>
          </tr>
        </thead>

        <tbody>
          {tokens.map((t, index) => {

            const isTop = index === 0

            const allocation = totalValue > 0
              ? (t.value_usd / totalValue) * 100
              : 0

            const price =
              t.price && t.price > 0
                ? t.price
                : (t.amount > 0 ? t.value_usd / t.amount : 0)

            const rowStyle = {
              ...styles.tr,
              background: isTop ? "#161616" : "transparent"
            }

            return (
              <tr
                key={t.symbol}
                style={rowStyle}
                onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                onMouseLeave={e => e.currentTarget.style.background = isTop ? "#161616" : "transparent"}
              >

                <td style={styles.assetCell}>
                  {t.symbol}
                </td>

                <td style={styles.tdRight}>
                  {formatAmount(t.amount)}
                </td>

                <td style={styles.tdRight}>
                  {formatUSD(price)}
                </td>

                <td style={styles.tdRight}>
                  {formatUSD(t.value_usd)}
                </td>

                <td style={styles.tdRight}>
                  <AllocationBar value={allocation} isTop={isTop} />
                </td>

              </tr>
            )
          })}
        </tbody>

      </table>

    </div>
  )
}

/* ================= COMPONENTS ================= */

function Card({ children }) {
  return <div style={styles.card}>{children}</div>
}

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

function AllocationBar({ value, isTop }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={styles.barBg}>
        <div style={{
          width: `${value}%`,
          background: isTop ? "#22c55e" : "#4ade80",
          height: "100%"
        }} />
      </div>
      <div style={styles.barLabel}>
        {value.toFixed(1)}%
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */

function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value || 0)
}

function formatAmount(value) {
  if (!value) return "0"

  if (value < 1) {
    return value.toFixed(6).replace(/\.?0+$/, "")
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4
  }).format(value)
}

function getColor(index, name) {

  if (name === "Others") return "#2a2a2a"

  const palette = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#ec4899", // pink
    "#14b8a6"  // teal
  ]

  return palette[index % palette.length]
}

/* ================= STYLES ================= */

const styles = {
  page: { padding: 40, color: "#fff" },
  title: { fontSize: 28, marginBottom: 20 },

  kpiRow: { display: "flex", gap: 20, marginBottom: 30 },

  card: {
    background: "#111",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #222",
    flex: 1
  },

  kpiLabel: { opacity: 0.6, marginBottom: 8 },
  kpiValue: { fontSize: 24, fontWeight: 600 },

  sectionTitle: { marginBottom: 20 },

  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    textAlign: "left",
    padding: 10,
    opacity: 0.7,
    borderBottom: "1px solid #333"
  },

  thRight: {
    textAlign: "right",
    padding: 10,
    opacity: 0.7,
    borderBottom: "1px solid #333"
  },

  tr: {
    borderBottom: "1px solid #222",
    transition: "background 0.2s"
  },

  tdRight: { padding: 10, textAlign: "right" },

  assetCell: { padding: 10, fontWeight: 500 },

  barBg: {
    height: 8,
    background: "#222",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4
  },

  barLabel: { fontSize: 12, opacity: 0.7
},

  legend: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.8
  }
