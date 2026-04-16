"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconPlus,
  IconWallet,
  IconStack2,
  IconRobot,
  IconShovel,
  IconPencil,
  IconTrash
} from "@tabler/icons-react"

const API_BASE = "https://apertum-dashboard-production.up.railway.app"

export default function SettingsPage() {

  const [wallets, setWallets] = useState([])
  const [staking, setStaking] = useState([])
  const [tradebots, setTradebots] = useState([])

  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [context, setContext] = useState(null)

  const [form, setForm] = useState({})

  /* ================= LOAD ================= */

  async function loadData() {

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) return

      const headers = {
        Authorization: "Bearer " + token
      }

      const [wRes, sRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/api/wallets`, { headers }),
        fetch(`${API_BASE}/api/nft-staking`, { headers }),
        fetch(`${API_BASE}/api/nft-tradebots`, { headers })
      ])

      const walletsData = await wRes.json()
      const stakingData = await sRes.json()
      const tradebotsData = await tRes.json()

      setWallets(walletsData || [])
      setStaking(stakingData || [])
      setTradebots(tradebotsData || [])

    } catch (err) {
      console.error("LOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  /* ================= ACTIONS ================= */

  function openAdd(type) {

    setContext(type)
    setSelected(null)

    if (type === "wallet") {
      setForm({ label: "", address: "" })
    }

    if (type === "staking") {
      setForm({
        label: "",
        token_id: "",
        tier: 1,
        lock_years: 1
      })
    }

    if (type === "tradebot") {
      setForm({
        label: "",
        token_id: ""
      })
    }

    setModal("add")
  }

  function openEdit(type, data) {

    setContext(type)
    setSelected(data)

    if (type === "wallet") {
      setForm({
        label: data.label || "",
        address: data.address
      })
    }

    if (type === "staking") {
      setForm({
        label: data.label || "",
        token_id: data.token_id,
        tier: data.tier,
        lock_years: data.lock_years
      })
    }

    if (type === "tradebot") {
      setForm({
        label: data.label || "",
        token_id: data.token_id
      })
    }

    setModal("edit")
  }

  function openDelete(type, data) {
    setContext(type)
    setSelected(data)
    setModal("delete")
  }

  /* ================= SAVE ================= */

  async function handleAdd() {

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    if (context === "wallet") {
      await fetch(`${API_BASE}/api/wallets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      })
    }

    if (context === "staking") {
      await fetch(`${API_BASE}/api/nft-staking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          label: form.label,
          token_id: Number(form.token_id),
          tier: Number(form.tier),
          lock_years: Number(form.lock_years)
        })
      })
    }

    if (context === "tradebot") {
      await fetch(`${API_BASE}/api/nft-tradebots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          label: form.label,
          token_id: Number(form.token_id)
        })
      })
    }

    setModal(null)
    loadData()
  }

  async function handleEdit() {

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    if (context === "wallet") {
      await fetch(`${API_BASE}/api/wallets/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      })
    }

    if (context === "staking") {
      await fetch(`${API_BASE}/api/nft-staking/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          label: form.label,
          tier: Number(form.tier),
          lock_years: Number(form.lock_years)
        })
      })
    }

    if (context === "tradebot") {
      await fetch(`${API_BASE}/api/nft-tradebots/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          label: form.label
        })
      })
    }

    setModal(null)
    loadData()
  }

  async function handleDelete() {

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    if (context === "wallet") {
      await fetch(`${API_BASE}/api/wallets/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      })
    }

    if (context === "staking") {
      await fetch(`${API_BASE}/api/nft-staking/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      })
    }

    if (context === "tradebot") {
      await fetch(`${API_BASE}/api/nft-tradebots/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      })
    }

    setModal(null)
    loadData()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>

      <h1>Settings</h1>

      <div className="section-stack">

        {/* WALLET TABLE */}
        <div className="card">
          <h3 className="mb-16">Wallets</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Label</th>
                <th>Address</th>
                <th>Settings</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map(w => (
                <tr key={w.id}>
                  <td><div className="asset-icon"><IconWallet size={16} /></div></td>
                  <td>{w.label || "-"}</td>
                  <td>{formatAddress(w.address)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 10 }}>
                      <IconPencil className="action-icon" onClick={() => openEdit("wallet", w)} />
                      <IconTrash className="action-icon delete" onClick={() => openDelete("wallet", w)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="button-primary mt-16" onClick={() => openAdd("wallet")}>
            <IconPlus size={16} /> Add Wallet
          </button>
        </div>

        {/* STAKING TABLE */}
        <div className="card">
          <h3 className="mb-16">Staking Memberships</h3>
          <table className="table">
            <thead>
              <tr>
                <th>NFT</th>
                <th>Label</th>
                <th>Token ID</th>
                <th>Tier</th>
                <th>Lock</th>
                <th>Settings</th>
              </tr>
            </thead>
            <tbody>
              {staking.map(n => (
                <tr key={n.id}>
                  <td><div className="asset-icon"><IconStack2 size={16} /></div></td>
                  <td>{n.label}</td>
                  <td>#{n.token_id}</td>
                  <td>Tier {n.tier}</td>
                  <td>{n.lock_years} Years</td>
                  <td>
                    <div style={{ display: "flex", gap: 10 }}>
                      <IconPencil className="action-icon" onClick={() => openEdit("staking", n)} />
                      <IconTrash className="action-icon delete" onClick={() => openDelete("staking", n)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="button-primary mt-16" onClick={() => openAdd("staking")}>
            <IconPlus size={16} /> Add Membership
          </button>
        </div>

        {/* TRADEBOT TABLE */}
        <div className="card">
          <h3 className="mb-16">Tradebots</h3>

          <table className="table">
            <thead>
              <tr>
                <th>NFT</th>
                <th>Label</th>
                <th>Token ID</th>
                <th>Settings</th>
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

              {tradebots.map(t => (
                <tr key={t.id}>
                  <td><div className="asset-icon"><IconRobot size={16} /></div></td>
                  <td>{t.label}</td>
                  <td>#{t.token_id}</td>
                  <td>
                    <div style={{ display: "flex", gap: 10 }}>
                      <IconPencil className="action-icon" onClick={() => openEdit("tradebot", t)} />
                      <IconTrash className="action-icon delete" onClick={() => openDelete("tradebot", t)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="button-primary mt-16" onClick={() => openAdd("tradebot")}>
            <IconPlus size={16} /> Add Tradebot
          </button>
        </div>

      </div>

{/* ================= MODAL ================= */}
{modal && (
  <div className="modal-overlay">
    <div className="modal">

      {/* ADD / EDIT */}
      {modal !== "delete" && (
        <>
          <h3>{modal === "add" ? "Add" : "Edit"}</h3>

          {/* WALLET */}
          {context === "wallet" && (
            <>
              <input
                placeholder="Label"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
              />

              <input
                placeholder="Address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </>
          )}

          {/* STAKING */}
          {context === "staking" && (
            <>
              <input
                placeholder="Label"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
              />

              <input
                placeholder="Token ID"
                value={form.token_id}
                disabled={modal === "edit"}
                onChange={e => setForm({ ...form, token_id: e.target.value })}
              />

              <select
                value={form.tier}
                onChange={e => setForm({ ...form, tier: Number(e.target.value) })}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Tier {i + 1}
                  </option>
                ))}
              </select>

              <select
                value={form.lock_years}
                onChange={e => setForm({ ...form, lock_years: Number(e.target.value) })}
              >
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={4}>4 Years</option>
              </select>
            </>
          )}

          {/* TRADEBOT */}
          {context === "tradebot" && (
            <>
              <input
                placeholder="Label"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
              />

              <input
                placeholder="Token ID"
                value={form.token_id}
                disabled={modal === "edit"}
                onChange={e => setForm({ ...form, token_id: e.target.value })}
              />
            </>
          )}

          <div className="modal-actions">
            <button className="button-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>

            <button
              className="button-primary"
              onClick={modal === "add" ? handleAdd : handleEdit}
            >
              Save
            </button>
          </div>
        </>
      )}

      {/* DELETE */}
      {modal === "delete" && (
        <>
          <h3>Delete</h3>

          <p className="text-secondary">
            Are you sure you want to delete this entry?
          </p>

          <div className="modal-actions">
            <button className="button-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>

            <button className="button-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </>
      )}

    </div>
  </div>
)}    </div>
  )
}

function formatAddress(addr) {
  if (!addr) return "-"
  return addr.slice(0, 4) + "...." + addr.slice(-4)
}
