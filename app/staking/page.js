"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function StakingPage() {

  const [data, setData] = useState([])

  async function load() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/staking",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )

    const json = await res.json()
    setData(json || [])
  }

  useEffect(() => {
    load()
  }, [])

  const totalStake = data.reduce((sum, n) => sum + n.stake, 0)

  return (
    <div>

      <h1>My Staking</h1>

      {/* KPI */}
      <div className="card mb-24">
        <div>Total Staked</div>
        <h2>{totalStake.toFixed(2)} APTM</h2>
      </div>

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Tier</th>
            <th>Stake</th>
            <th>Progress</th>
          </tr>
        </thead>

        <tbody>
          {data.map(n => (
            <tr key={n.token_id}>
              <td>{n.token_id}</td>
              <td>{n.tier}</td>
              <td>{n.stake}</td>

              <td>
                {(n.progress * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
