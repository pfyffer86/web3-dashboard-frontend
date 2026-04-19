"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconWallet,
  IconCoins,
  IconReportMoney
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

  const totalValue = (data.wallets || [])
  .reduce((sum, w) => sum + (w.totalValue || 0), 0)
  const wallets = data.wallets || []

  /* 🔥 UNIQUE TOKEN COUNT */
  const uniqueTokens = new Set()
  wallets.forEach(w => {
    (w.tokens || []).forEach(t => {
      uniqueTokens.add(t.symbol)
    })
  })

  return (
    <div>

      <h1>My Wallets</h1>

      {/* KPI */}
      <div className="kpi-grid">

        {/* KPI 1 */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Value</div>
            <IconReportMoney size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">{formatUSD(totalValue)}</div>
          <div className="kpi-sub">Across all Wallets</div>
        </div>

        {/* KPI 2 */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Tracked Wallets</div>
            <IconWallet size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">{wallets.length}</div>
          <div className="kpi-sub">Across Portfolio</div>
        </div>

        {/* KPI 3 */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Tracked Tokens</div>
            <IconCoins size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">{uniqueTokens.size}</div>
          <div className="kpi-sub">Across all Wallets</div>
        </div>

      </div>

      {/* WALLET BREAKDOWN */}
      <div className="card mt-24">

        <h3 className="mb-16">Wallet Breakdown</h3>

        {[...wallets]
          .sort((a, b) => b.totalValue - a.totalValue)
          .map((w, i) => {

            const isOpen = openWallet === i

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

                  <div className="wallet-value">
                    {formatUSD(w.totalValue)}
                  </div>

                </div>

                {/* 🔥 CHEVRON PROMINENT */}
                <div
                  className="wallet-toggle"
                  onClick={() => setOpenWallet(isOpen ? null : i)}
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    color: "var(--blue)",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  {isOpen ? "Hide Tokens ▲" : "Show Tokens ▼"}
                </div>

                {/* ACCORDION */}
                <div className={`wallet-body ${isOpen ? "open" : ""}`}>

                  <div className="wallet-token-header">
                    <div>Asset</div>
                    <div>Balance</div>
                    <div>Price</div>
                    <div>Value</div>
                  </div>

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
