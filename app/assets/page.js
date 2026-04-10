"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconWallet,
  IconCoins,
  IconPigMoney
} from "@tabler/icons-react"

/* ICON */

function getTokenIcon(cmc_id) {
  if (!cmc_id) return null
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmc_id}.png`
}

export default function AssetsPage() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openWallet, setOpenWallet] = useState(null)

  async function load() {
    try {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/dashboard",
        {
          headers: { Authorization: "Bearer " + token }
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

  useEffect(() => { load() }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return null

  const totalValue = data.totalValue || 0
  const tokens = data.tokens || []
  const sorted = [...tokens].sort((a, b) => b.value_usd - a.value_usd)

  return (
    <div>

      <h1>My Assets</h1>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="card kpi-card">

  <div className="kpi-header">
    <div className="kpi-label">Total Assets Value</div>
    <IconPigMoney size={18} className="kpi-icon" />
  </div>

  <div className="kpi-value">{formatUSD(totalValue)}</div>
  <div className="kpi-sub">Across all wallets</div>

</div>

        <div className="card kpi-card">

  <div className="kpi-header">
    <div className="kpi-label">Tracked Assets</div>
    <IconCoins size={18} className="kpi-icon" />
  </div>

  <div className="kpi-value">{tokens.length}</div>
  <div className="kpi-sub">Tokens in portfolio</div>

</div>
      </div>

      {/* TABLE */}
      <div className="card">
        <h3 className="mb-16">Assets Breakdown</h3>

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

              const icon = getTokenIcon(t.cmc_id)

              return (
                <tr key={t.symbol}>
                  <td>
                    <div className="token">
                      <div className="token-icon">
                        {icon
                          ? <img src={icon} />
                          : <div className="token-fallback">{t.symbol[0]}</div>}
                      </div>
                      <span>{t.symbol}</span>
                    </div>
                  </td>

                  <td>{formatAmount(t.amount)}</td>
                  <td>{formatPrice(t.price)}</td>
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
<div className="card mt-24">

  <h3 className="mb-16">Wallet Breakdown</h3>

  {[...data.wallets]
    .sort((a, b) => b.totalValue - a.totalValue) // ✅ Wallet Sort
    .map((w, i) => {

      const isOpen = openWallet === i

      // ✅ Token Sort innerhalb Wallet
      const sortedTokens = [...(w.tokens || [])]
        .sort((a, b) => b.value_usd - a.value_usd)

      return (
        <div key={w.id} className="wallet-card">

          {/* HEADER */}
          <div
            className="wallet-header clickable"
            onClick={() => setOpenWallet(isOpen ? null : i)}
          >

            <div className="wallet-left">

  <div className="wallet-icon">
    <IconWallet size={18} />
  </div>

  <div>
    <div className="wallet-label">
      {w.label || "Wallet"}
    </div>

    <div className="wallet-address">
      {formatAddress(w.address)}
    </div>
  </div>

</div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="wallet-value">
                {formatUSD(w.totalValue)}
              </div>

              <div className={`wallet-chevron ${isOpen ? "open" : ""}`}>
                ▾
              </div>
            </div>

          </div>

          {/* ACCORDION */}
          <div className={`wallet-body ${isOpen ? "open" : ""}`}>

            {/* HEADER */}
            <div className="wallet-token-header">
              <div>Asset</div>
              <div>Balance</div>
              <div>Price</div>
              <div>Value</div>
            </div>

            {/* ROWS */}
            {sortedTokens.map(t => {

              const icon = getTokenIcon(t.cmc_id)

              return (
                <div key={t.symbol} className="wallet-token-row">

                  <div className="token">
                    <div className="token-icon">
                      {icon
                        ? <img src={icon} />
                        : <div className="token-fallback">{t.symbol[0]}</div>}
                    </div>

                    {/* vorbereitet für späteren Namen */}
                    <div className="token-meta">
                      <div>{t.symbol}</div>
                    </div>

                  </div>

                  <div>{formatAmount(t.amount)}</div>
                  <div>{formatPrice(t.price)}</div>
                  <div>{formatUSD(t.value_usd)}</div>

                </div>
              )
            })}

          </div>

        </div>
      )
    })}

</div>

    </div>
  )
}

/* FORMAT */

function formatUSD(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(v || 0)
}

function formatPrice(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }).format(v || 0)
}

function formatAmount(v) {
  if (!v) return "0"
  if (v < 0.0001) return v.toFixed(8)
  if (v < 1) return v.toFixed(6)

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4
  }).format(v)
}

function formatAddress(addr) {
  return addr.slice(0, 4) + "...." + addr.slice(-4)
}
