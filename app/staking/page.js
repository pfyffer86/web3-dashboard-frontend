"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconPigMoney,
  IconStack2,
  IconHexagonLetterS
} from "@tabler/icons-react"

export default function StakingPage() {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    try {

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/staking",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      )

      const json = await res.json()

      if (!Array.isArray(json)) {
        console.error("INVALID RESPONSE:", json)
        setData([])
      } else {
        setData(json)
      }

    } catch (err) {

      console.error("FETCH ERROR:", err)
      setData([])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div>Loading...</div>

  const safeData = Array.isArray(data) ? data : []

  /* ================= KPI ================= */

  const totalStake = safeData.reduce((sum, n) => sum + (n.stake || 0), 0)
  const totalNFTs = safeData.length

  return (
    <div>

      <h1>My Staking</h1>

      {/* ================= KPI GRID (IDENTISCH ZU ASSETS) ================= */}
      <div className="kpi-grid">

        {/* LEFT BIG CARD */}
        <div className="card kpi-card">

          <div className="kpi-header">
            <div className="kpi-label">Total Value Staked</div>
            <IconPigMoney size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {formatAmount(totalStake)} APTM
          </div>

          <div className="kpi-sub">
            Across all staking positions
          </div>

        </div>

        {/* RIGHT STACK */}
        <div className="kpi-side">

          <div className="card kpi-card">

            <div className="kpi-header">
              <div className="kpi-label">Total Staked</div>
              <IconStack2 size={18} className="kpi-icon" />
            </div>

            <div className="kpi-value">
              {formatAmount(totalStake)}
            </div>

            <div className="kpi-sub">
              APTM locked
            </div>

          </div>

          <div className="card kpi-card">

            <div className="kpi-header">
              <div className="kpi-label">Tracked NFTs</div>
              <IconHexagonLetterS size={18} className="kpi-icon" />
            </div>

            <div className="kpi-value">
              {totalNFTs}
            </div>

            <div className="kpi-sub">
              Membership positions
            </div>

          </div>

        </div>

      </div>

      {/* ================= TABLE CARD (IDENTISCH ZU ASSETS) ================= */}
      <div className="card">

        <div className="card-header">
          <h3>Staking Breakdown</h3>
        </div>

        <table className="table">

          <thead>
            <tr>
              <th>ASSET</th>
              <th>STAKE</th>
              <th>UTILIZATION</th>
              <th>TIME PROGRESS</th>
            </tr>
          </thead>

          <tbody>

            {safeData.map(n => {

              const stake = n.stake || 0
              const maxStake = n.maxStake || 0
              const progress = n.progress || 0

              const utilization = maxStake > 0
                ? stake / maxStake
                : 0

              return (
                <tr key={n.token_id}>

                  {/* ICON + LABEL */}
                  <td>
                    <div className="asset-cell">

                      <div className="asset-icon">
                        <IconHexagonLetterS size={16} />
                      </div>

                      <div className="asset-info">
                        <div className="asset-name">
                          Tier {n.tier}
                        </div>
                        <div className="asset-sub">
                          #{n.token_id}
                        </div>
                      </div>

                    </div>
                  </td>

                  {/* STAKE */}
                  <td>
                    {formatAmount(stake)} / {formatAmount(maxStake)}
                  </td>

                  {/* UTILIZATION */}
                  <td>
                    <div className="allocation">

                      <div className="allocation-bar">
                        <div
                          className="allocation-fill"
                          style={{
                            width: `${utilization * 100}%`,
                            background: getUtilizationColor(utilization)
                          }}
                        />
                      </div>

                      <div className="allocation-text">
                        {(utilization * 100).toFixed(1)}%
                      </div>

                    </div>
                  </td>

                  {/* TIME */}
                  <td>
                    <div className="allocation">

                      <div className="allocation-bar">
                        <div
                          className="allocation-fill"
                          style={{
                            width: `${progress * 100}%`,
                            background: "var(--blue)"
                          }}
                        />
                      </div>

                      <div className="allocation-text">
                        {(progress * 100).toFixed(1)}%
                      </div>

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

function formatAmount(v) {
  if (!v) return "0"

  if (v < 0.0001) return v.toFixed(8)
  if (v < 1) return v.toFixed(6)

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(v)
}

function getUtilizationColor(u) {
  if (u <= 0.25) return "#ef4444"
  if (u <= 0.5) return "#f97316"
  if (u <= 0.75) return "#eab308"
  return "#22c55e"
}
