"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconWallet,
  IconHexagonLetterS,
  IconRobot,
  IconPlus,
  IconPencil,
  IconTrash
} from "@tabler/icons-react"

export default function SettingsPage() {

  const [wallets, setWallets] = useState([])
  const [staking, setStaking] = useState([])
  const [tradebots, setTradebots] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const headers = {
        Authorization: "Bearer " + token
      }

      const [wRes, sRes] = await Promise.all([
        fetch("https://apertum-dashboard-production.up.railway.app/api/wallets", { headers }),
        fetch("https://apertum-dashboard-production.up.railway.app/api/nft-staking", { headers })
      ])

      if (!wRes.ok) throw new Error("Wallet API error")
      if (!sRes.ok) throw new Error("Staking API error")

      const walletsData = await wRes.json()
      const stakingData = await sRes.json()

      setWallets(walletsData)
      setStaking(stakingData)
      setTradebots([])

    } catch (err) {
      console.error("SETTINGS ERROR:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>

      <h1>Settings</h1>

      <div className="section-stack">

        {/* ================= WALLET TABLE ================= */}
        <div className="card">

          <div className="card-header">
            <h3>Wallets</h3>
            <button className="btn-icon">
              <IconPlus size={18} />
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Label</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {wallets.map(w => (
                <tr key={w.id}>

                  <td>
                    <div className="token">
                      <div className="asset-icon">
                        <IconWallet size={16} />
                      </div>
                    </div>
                  </td>

                  <td>{w.label || "-"}</td>
                  <td>{formatAddress(w.address)}</td>

                  <td className="actions">
                    <IconPencil size={16} />
                    <IconTrash size={16} />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= STAKING TABLE ================= */}
        <div className="card">

          <div className="card-header">
            <h3>Staking Memberships</h3>
            <button className="btn-icon">
              <IconPlus size={18} />
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>NFT</th>
                <th>Label</th>
                <th>Token ID</th>
                <th>Tier</th>
                <th>Lock</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {staking.map(n => (
                <tr key={n.id}>

                  <td>
                    <div className="token">
                      <div className="asset-icon">
                        <IconHexagonLetterS size={16} />
                      </div>
                    </div>
                  </td>

                  <td>{n.label}</td>
                  <td>#{n.token_id}</td>
                  <td>Tier {n.tier}</td>
                  <td>{n.lock_years} Years</td>

                  <td className="actions">
                    <IconPencil size={16} />
                    <IconTrash size={16} />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= TRADEBOT TABLE ================= */}
        <div className="card">

          <div className="card-header">
            <h3>Tradebots</h3>
            <button className="btn-icon">
              <IconPlus size={18} />
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>NFT</th>
                <th>Label</th>
                <th>Token ID</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {tradebots.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ opacity: 0.6 }}>
                    No tradebots yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}

/* ================= HELPERS ================= */

function formatAddress(addr) {
  if (!addr) return "-"
  return addr.slice(0, 4) + "...." + addr.slice(-4)
}
