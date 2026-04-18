"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { IconPigMoney, IconRobot } from "@tabler/icons-react"

export default function TradingPage() {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    try {

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/trading",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      const json = await res.json()

      setData(Array.isArray(json.positions) ? json.positions : [])

    } catch (err) {

      console.error("TRADING FETCH ERROR:", err)
      setData([])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div>Loading...</div>

  /* ================= KPI ================= */

  const totalValue = data.reduce((sum, n) => sum + (n.value_usd || 0), 0)
  const totalBots = data.length

  return (
    <div>

      <h1>My Trading</h1>

      <div className="kpi-grid">

        <div className="card kpi-card">

          <div className="kpi-header">
            <div className="kpi-label">Total Value in Bots</div>
            <IconPigMoney size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            ${formatUSD(totalValue)}
          </div>

          <div className="kpi-sub">
            Across all Tradebots
          </div>

        </div>

        <div className="card kpi-card">

          <div className="kpi-header">
            <div className="kpi-label">Active Bots</div>
            <IconRobot size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {totalBots}
          </div>

          <div className="kpi-sub">
            Total configured bots
          </div>

        </div>

      </div>

      {/* ================= TABLE ================= */}
      <div className="card">

        <div className="card-header">
          <h3 className="mb-16">Trading Bots</h3>
        </div>

        <table className="table">

          <thead>
            <tr>
              <th>ASSET</th>
              <th>ID</th>
              <th>LABEL</th>
              <th>VAULT</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>

            {data.map(n => {

              const isLoaded = (n.value || 0) > 0

              return (
                <tr key={n.token_id}>

                  <td>
                    <div className="asset-icon">
                      {n.token?.symbol || <IconRobot size={16} />}
                    </div>
                  </td>

                  <td>#{n.token_id}</td>

                  <td>{n.label}</td>

                  <td>
                    {formatNumber(n.value)} {n.token?.symbol || ""}
                  </td>

                  <td>
                    <div
                      className="vault-status"
                      style={{
                        background: isLoaded ? "var(--green)" : "var(--red)"
                      }}
                    >
                      {isLoaded ? "Vault Loaded" : "Vault Unloaded"}
                    </div>
                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

    </div>
  )
}

/* ================= HELPERS ================= */

function formatNumber(v) {
  if (!v || isNaN(v)) return "0"

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  }).format(v)
}

function formatUSD(v) {
  if (!v || isNaN(v)) return "0.00"

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v)
}
