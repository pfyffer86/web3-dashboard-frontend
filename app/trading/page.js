"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { IconPigMoney, IconRobot } from "@tabler/icons-react"

/* ICON */
function getTokenIcon(cmc_id) {
  if (!cmc_id) return null
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmc_id}.png`
}

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

      console.log("TRADING DATA:", json)

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

  const totalValue = data.reduce((sum, n) => sum + (n.value_usd || 0), 0)
  const totalBots = data.length

  /* 🔥 FIXED APTM ICON */
  const APTM_CMC_ID = 36838 // aus deiner tokens table

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
              <th>TRADING PAIR</th> {/* 🔥 geändert */}
              <th>VAULT</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>

            {data.map(n => {

              const isLoaded = (n.value || 0) > 0

              const baseIcon = getTokenIcon(APTM_CMC_ID)
              const quoteIcon = getTokenIcon(n.token?.cmc_id)

              return (
                <tr key={n.token_id}>

                  <td>
                    <div className="asset-icon">
                      <IconRobot size={16} />
                    </div>
                  </td>

                  <td>#{n.token_id}</td>

                  <td>{n.label}</td>

                  {/* 🔥 TRADING PAIR */}
                  <td style={{ width: "120px" }}>
                    <div className="token" style={{ display: "flex", gap: "6px", alignItems: "center" }}>

                      {/* APTM */}
                      <div className="token-icon">
                        {baseIcon ? (
                          <img src={baseIcon} />
                        ) : (
                          <div className="token-fallback">A</div>
                        )}
                      </div>

                      {/* Separator optional */}
                      <span style={{ fontSize: "10px", opacity: 0.5 }}>/</span>

                      {/* Bot Token */}
                      <div className="token-icon">
                        {quoteIcon ? (
                          <img src={quoteIcon} />
                        ) : (
                          <div className="token-fallback">
                            {n.token?.symbol?.[0] || "?"}
                          </div>
                        )}
                      </div>

                    </div>
                  </td>

                  <td>{formatNumber(n.value)}</td>

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
