"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconWallet,
  IconHexagonLetterS,
  IconPlus,
  IconPencil,
  IconTrash,
  IconX
} from "@tabler/icons-react"

export default function SettingsPage() {

  const [wallets, setWallets] = useState([])
  const [staking, setStaking] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ===== MODALS =====
  const [walletModal, setWalletModal] = useState(false)
  const [stakingModal, setStakingModal] = useState(false)

  const [editingWallet, setEditingWallet] = useState(null)
  const [editingStaking, setEditingStaking] = useState(null)

  const [form, setForm] = useState({})

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

      const walletsData = await wRes.json()
      const stakingData = await sRes.json()

      setWallets(walletsData)
      setStaking(stakingData)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ================= WALLET ================= */

  function openWalletModal(wallet = null) {
    setEditingWallet(wallet)
    setForm(wallet || { address: "", label: "" })
    setWalletModal(true)
  }

  async function saveWallet() {
    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    const method = editingWallet ? "PUT" : "POST"
    const url = editingWallet
      ? `/api/wallets/${editingWallet.id}`
      : `/api/wallets`

    await fetch(`https://apertum-dashboard-production.up.railway.app${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    })

    setWalletModal(false)
    load()
  }

  async function deleteWallet(id) {
    if (!confirm("Delete wallet?")) return

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    await fetch(`https://apertum-dashboard-production.up.railway.app/api/wallets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    })

    load()
  }

  /* ================= STAKING ================= */

  function openStakingModal(nft = null) {
    setEditingStaking(nft)
    setForm(nft || { token_id: "", tier: "", lock_years: "", label: "" })
    setStakingModal(true)
  }

  async function saveStaking() {
    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    const method = editingStaking ? "PUT" : "POST"
    const url = editingStaking
      ? `/api/nft-staking/${editingStaking.id}`
      : `/api/nft-staking`

    await fetch(`https://apertum-dashboard-production.up.railway.app${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    })

    setStakingModal(false)
    load()
  }

  async function deleteStaking(id) {
    if (!confirm("Delete NFT?")) return

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    await fetch(`https://apertum-dashboard-production.up.railway.app/api/nft-staking/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    })

    load()
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>

      <h1>Settings</h1>

      {/* ================= WALLET ================= */}
      <div className="card">
        <div className="card-header">
          <h3>Wallets</h3>
          <button className="btn-icon" onClick={() => openWalletModal()}>
            <IconPlus size={18} />
          </button>
        </div>

        <table className="table">
          <tbody>
            {wallets.map(w => (
              <tr key={w.id}>
                <td><div className="asset-icon"><IconWallet size={16} /></div></td>
                <td>{w.label}</td>
                <td>{formatAddress(w.address)}</td>
                <td className="actions">
                  <IconPencil onClick={() => openWalletModal(w)} />
                  <IconTrash onClick={() => deleteWallet(w.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= STAKING ================= */}
      <div className="card">
        <div className="card-header">
          <h3>Staking Memberships</h3>
          <button className="btn-icon" onClick={() => openStakingModal()}>
            <IconPlus size={18} />
          </button>
        </div>

        <table className="table">
          <tbody>
            {staking.map(n => (
              <tr key={n.id}>
                <td><div className="asset-icon"><IconHexagonLetterS size={16} /></div></td>
                <td>{n.label}</td>
                <td>#{n.token_id}</td>
                <td>Tier {n.tier}</td>
                <td>{n.lock_years} Years</td>
                <td className="actions">
                  <IconPencil onClick={() => openStakingModal(n)} />
                  <IconTrash onClick={() => deleteStaking(n.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= WALLET MODAL ================= */}
      {walletModal && (
        <div className="modal">
          <div className="modal-content">

            <div className="modal-header">
              <h3>{editingWallet ? "Edit Wallet" : "Add Wallet"}</h3>
              <IconX onClick={() => setWalletModal(false)} />
            </div>

            <input
              placeholder="Address"
              value={form.address || ""}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <input
              placeholder="Label"
              value={form.label || ""}
              onChange={e => setForm({ ...form, label: e.target.value })}
            />

            <button onClick={saveWallet}>Save</button>

          </div>
        </div>
      )}

      {/* ================= STAKING MODAL ================= */}
      {stakingModal && (
        <div className="modal">
          <div className="modal-content">

            <div className="modal-header">
              <h3>{editingStaking ? "Edit NFT" : "Add NFT"}</h3>
              <IconX onClick={() => setStakingModal(false)} />
            </div>

            <input
              placeholder="Token ID"
              value={form.token_id || ""}
              onChange={e => setForm({ ...form, token_id: e.target.value })}
            />

            <input
              placeholder="Label"
              value={form.label || ""}
              onChange={e => setForm({ ...form, label: e.target.value })}
            />

            <input
              placeholder="Tier"
              value={form.tier || ""}
              onChange={e => setForm({ ...form, tier: e.target.value })}
            />

            <input
              placeholder="Lock Years"
              value={form.lock_years || ""}
              onChange={e => setForm({ ...form, lock_years: e.target.value })}
            />

            <button onClick={saveStaking}>Save</button>

          </div>
        </div>
      )}

    </div>
  )
}

function formatAddress(addr) {
  return addr?.slice(0, 4) + "...." + addr?.slice(-4)
}
