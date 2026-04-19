"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { IconReportMoney, IconStack2 } from "@tabler/icons-react"

export default function StakingPage() {

  const [data, setData] = useState([])
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    try {

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/staking",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      const json = await res.json()

      setData(Array.isArray(json.positions) ? json.positions : [])
      setPrice(json.aptm_price || 0)

    } catch (err) {

      console.error("STAKING FETCH ERROR:", err)
      setData([])
      setPrice(0)
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div>Loading...</div>

  /* ================= KPI ================= */

  const totalAPT = data.reduce((sum, n) => sum + (n.stake || 0), 0)
  const totalUSD = totalAPT * price
  const totalMemberships = data.length

  return (
    <div>

      <h1>My Staking</h1>

      <div className="kpi-grid">

        {/* KPI 1 */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Value</div>
            <IconReportMoney size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            ${formatUSD(totalUSD)}
          </div>

          <div className="kpi-sub">
            Across all Membership Tiers
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Staked Tokens</div>
            <IconReportMoney size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {formatNumber(totalAPT)} APTM
          </div>

          <div className="kpi-sub">
            Across all Membership Tiers
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Tracked Memberships</div>
            <IconStack2 size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {totalMemberships}
          </div>

          <div className="kpi-sub">
            Across Portfolio
          </div>
        </div>

      </div>

      {/* ================= TABLE ================= */}
      <div className="card">

        <div className="card-header">
          <h3 className="mb-16">Staking Breakdown</h3>
        </div>

        <table className="table">

          <thead>
            <tr>
              <th>ASSET</th>
              <th>ID</th>
              <th>LABEL</th> {/* 🔥 NEU */}
              <th>TIER</th>
              <th>DURATION</th>
              <th>STAKED</th>
              <th>MAX STAKING</th>
              <th>UTILIZATION</th>
              <th>ELAPSED</th>
            </tr>
          </thead>

          <tbody>

            {data.map(n => {

              const utilization = n.maxStake > 0
                ? n.stake / n.maxStake
                : 0

              return (
                <tr key={n.token_id}>

                  <td>
                    <div className="asset-icon">
                      <IconStack2 size={16} />
                    </div>
                  </td>

                  <td>#{n.token_id}</td>

                  {/* 🔥 LABEL */}
                  <td>{n.label || "-"}</td>

                  <td>Tier {n.tier}</td>

                  <td>{formatNumber(n.stake)}</td>

                  <td>{formatNumber(n.maxStake)}</td>

                  <td>
                    <ProgressBar
                      value={utilization}
                      color={getUtilColor(utilization)}
                    />
                  </td>

                  <td>{n.lock_years}Y</td>

                  <td>
                    <ProgressBar
                      value={n.progress}
                      color="var(--blue)"
                    />
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

/* ================= COMPONENTS ================= */

function ProgressBar({ value, color }) {

  const percent = Math.max(0, Math.min(100, value * 100))

  return (
    <div className="allocation">

      <div className="allocation-bar">
        <div
          className="allocation-fill"
          style={{
            width: `${percent}%`,
            background: color
          }}
        />
      </div>

      <div className="allocation-text">
        {percent.toFixed(1)}%
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

function getUtilColor(u) {
  if (u <= 0.25) return "#ef4444"
  if (u <= 0.5) return "#f97316"
  if (u <= 0.75) return "#eab308"
  return "#22c55e"
}
