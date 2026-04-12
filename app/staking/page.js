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
  const totalNFTs = data.length
  const avgProgress = data.length
  ? data.reduce((sum, n) => sum + n.progress, 0) / data.length
  : 0

  return (
    <div>

      <h1>My Staking</h1>

      {/* KPI */}
     <div className="wallet-grid mb-24">

  <div className="card">
    <div className="text-secondary">Total Staked</div>
    <h2>{totalStake.toFixed(2)} APTM</h2>
  </div>

  <div className="card">
    <div className="text-secondary">Active NFTs</div>
    <h2>{totalNFTs}</h2>
  </div>

  <div className="card">
    <div className="text-secondary">Avg Progress</div>
    <h2>{(avgProgress * 100).toFixed(1)}%</h2>
  </div>

</div>

      {/* TABLE */}
     <table className="table">
  <thead>
    <tr>
      <th>Token</th>
      <th>Tier</th>
      <th>Stake</th>
      <th>Utilization</th>
      <th>Time Progress</th>
    </tr>
  </thead>

  <tbody>
    {data.map(n => {

      const utilization = n.maxStake > 0
        ? n.stake / n.maxStake
        : 0

      return (
        <tr key={n.token_id}>

          <td>{n.token_id}</td>

          <td>Tier {n.tier}</td>

          <td>{n.stake.toFixed(2)}</td>

          {/* STAKE UTILIZATION */}
          <td>
            {(utilization * 100).toFixed(1)}%
          </td>

          {/* TIME PROGRESS */}
          <td>
            {(n.progress * 100).toFixed(1)}%
          </td>

        </tr>
      )
    })}
  </tbody>
</table>

    </div>
  )
}
