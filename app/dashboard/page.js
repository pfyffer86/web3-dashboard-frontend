"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconReportMoney,
  IconWallet,
  IconCoins,
  IconRobot
} from "@tabler/icons-react"

/* ================= ICON ================= */

function getTokenIcon(cmc_id) {
  if (!cmc_id) return null
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmc_id}.png`
}

/* ================= PAGE ================= */

export default function DashboardPage() {

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
          headers: { Authorization: "Bearer " + token }
        }
      )

      if (!res.ok) throw new Error("API error: " + res.status)

      const json = await res.json()

      console.log("DASHBOARD DATA:", json)

      setData(json)

    } catch (err) {
      console.error("DASHBOARD ERROR:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return null

  /* ================= DATA ================= */

  const totalValue = data.totalValue || 0

  const wallets = data.wallets || []
  const tokens = data.tokens || []

  const walletValue = wallets.reduce((sum, w) => sum + (w.totalValue || 0), 0)
  const stakingValue = data.stakingValue || 0
  const tradingValue = data.tradingValue || 0

  const totalBots = data.trading?.length || 0
  const walletCount = wallets.length
  const tokenCount = tokens.length

  /* ================= TOP TOKENS ================= */

  const topTokens = [...tokens]
    .sort((a, b) => b.value_usd - a.value_usd)
    .slice(0, 5)

  /* ================= ALLOCATION ================= */

  const totalAlloc = walletValue + stakingValue + tradingValue

  const walletPct = totalAlloc > 0 ? (walletValue / totalAlloc) * 100 : 0
  const stakingPct = totalAlloc > 0 ? (stakingValue / totalAlloc) * 100 : 0
  const tradingPct = totalAlloc > 0 ? (tradingValue / totalAlloc) * 100 : 0

  return (
    <div>

      <h1>Dashboard</h1>

      {/* ================= KPI ================= */}

      <div className="kpi-grid">

        {/* TOTAL */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Total Portfolio Value</div>
            <IconReportMoney size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {formatUSD(totalValue)}
          </div>

          <div className="kpi-sub">
            Across all assets
          </div>
        </div>

        {/* WALLET */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Wallet Value</div>
            <IconWallet size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {formatUSD(walletValue)}
          </div>

          <div className="kpi-sub">
            Liquid assets
          </div>
        </div>

        {/* STAKING */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Staking Value</div>
            <IconCoins size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {formatUSD(stakingValue)}
          </div>

          <div className="kpi-sub">
            Locked capital
          </div>
        </div>

        {/* TRADING */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Trading Value</div>
            <IconRobot size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">
            {formatUSD(tradingValue)}
          </div>

          <div className="kpi-sub">
            Active in bots
          </div>
        </div>

        {/* COUNTS */}
        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Tracked Wallets</div>
            <IconWallet size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">{walletCount}</div>

          <div className="kpi-sub">Across portfolio</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <div className="kpi-label">Tracked Tokens</div>
            <IconCoins size={18} className="kpi-icon" />
          </div>

          <div className="kpi-value">{tokenCount}</div>

          <div className="kpi-sub">Unique assets</div>
        </div>

      </div>

      {/* ================= ALLOCATION ================= */}

      <div className="card mt-24">

        <h3 className="mb-16">Portfolio Allocation</h3>

        <div className="allocation-bar" style={{ height: "10px" }}>

          <div
            className="allocation-fill"
            style={{
              width: `${walletPct}%`,
              background: "var(--blue)"
            }}
          />

          <div
            className="allocation-fill"
            style={{
              width: `${stakingPct}%`,
              background: "var(--green)"
            }}
          />

          <div
            className="allocation-fill"
            style={{
              width: `${tradingPct}%`,
              background: "var(--purple)"
            }}
          />

        </div>

        <div className="allocation-text mt-8">
          Wallet {walletPct.toFixed(1)}% · Staking {stakingPct.toFixed(1)}% · Trading {tradingPct.toFixed(1)}%
        </div>

      </div>

      {/* ================= TOP TOKENS ================= */}

      <div className="card mt-24">

        <h3 className="mb-16">Top Holdings</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Value</th>
              <th>Allocation</th>
            </tr>
          </thead>

          <tbody>

            {topTokens.map(t => {

              const icon = getTokenIcon(t.cmc_id)
              const allocation = totalValue > 0
                ? (t.value_usd / totalValue) * 100
                : 0

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

                  <td>{formatUSD(t.value_usd)}</td>

                  <td>{allocation.toFixed(1)}%</td>

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

function formatUSD(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(v || 0)
}
