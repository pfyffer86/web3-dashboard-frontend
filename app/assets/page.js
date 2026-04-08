"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

/* ================= ICON ================= */

function getTokenIcon(token) {

  const map = {
    BTC: 1,
    ETH: 1027,
    USDT: 825,
    USDC: 3408,
    SOL: 5426,
    AVAX: 5805,
    APTM: 21794
  }

  const key =
    token.price_symbol ||
    token.symbol.replace("w", "")

  const id = map[key]

  if (!id) return null

  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`
}

/* ================= PAGE ================= */

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

  if (loading) return <div className="page">Loading...</div>
  if (error) return <div className="page">Error: {error}</div>
  if (!data) return null

  const totalValue = data.totalValue || 0
  const tokens = data.tokens || []

  const sorted = [...tokens].sort((a, b) => b.value_usd - a.value_usd)

  return (
    <div className="page">

      <h1>Assets</h1>

      <div className="row mb-30">

        <div className="card kpi">
          <div className="kpi-label">Total Assets Value</div>
          <div className="kpi-value">{formatUSD(totalValue)}</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Tracked Assets</div>
          <div className="kpi-value">{tokens.length}</div>
        </div>

      </div>

      <div className="card">

        <h3 className="mb-20">Assets Breakdown</h3>

        <table className="table">

          <thead>
            <tr>
              <th>Asset</th>
              <th>Balance</th>
              <th>Price</th>
              <th>Value</th>
              <th>Allocation</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map(t => {

              const allocation = totalValue > 0
                ? (t.value_usd / totalValue) * 100
                : 0

              const price =
                t.price && t.price > 0
                  ? t.price
                  : (t.amount > 0 ? t.value_usd / t.amount : 0)

              const icon = getTokenIcon(t)

              return (
                <tr key={t.symbol}>

                  {/* TOKEN */}
                  <td>
                    <div className="token">

                      {icon && (
                        <img
                          src={icon}
                          alt={t.symbol}
                          onError={(e) => {
                            e.target.style.display = "none"
                          }}
                        />
                      )}

                      <span>{t.symbol}</span>
                    </div>
                  </td>

                  <td>{formatAmount(t.amount)}</td>

                  <td>{formatUSD(price)}</td>

                  <td>{formatUSD(t.value_usd)}</td>

                  <td>
                    <div className="allocation">

                      <div className="allocation-bar">
                        <div
                          className="allocation-fill"
                          style={{ width: `${allocation}%` }}
                        />
                      </div>

                      <div className="allocation-text">
                        {allocation.toFixed(1)}%
                      </div>

                    </div>
                  </td>

                </tr>
              )
            })}
          </tbody>

        </table>

      </div>

      {/* WALLET BREAKDOWN */}

      <div className="card mt-30">

        <h3 className="mb-20">Wallet Breakdown</h3>

        {data.wallets.map(w => (
          <div key={w.id} style={{
            padding: "12px 0",
            borderBottom: "1px solid #1a1a1a"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <div className="text-secondary">
                {w.label || w.address.slice(0, 6)}
              </div>
              <div>{formatUSD(w.totalValue)}</div>
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}

/* ================= FORMAT ================= */

function formatUSD(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value || 0)
}

function formatAmount(value) {
  if (!value) return "0"

  if (value < 0.0001) return value.toExponential(2)
  if (value < 1) return value.toFixed(6)

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4
  }).format(value)
}
