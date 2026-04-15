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

  // ✅ EXISTING MODAL SYSTEM (IDENTISCH)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [context, setContext] = useState(null) // wallet | staking

  const [form, setForm] = useState({})

  /* ================= LOAD ================= */

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

  /* ================= ACTIONS ================= */

  function openAdd(type) {

    setContext(type)
    setSelected(null)

    if (type === "wallet") {
      setForm({ label: "", address: "" })
    }

    if (type === "staking") {
      setForm({ token_id: "", tier: 1, lock_years: 1, label: "" })
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
        token_id: data.token_id,
        tier: data.tier,
        lock_years: data.lock_years,
        label: data.label || ""
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

      await fetch(`/api/wallets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      })
    }

    if (context === "staking") {

      await fetch(`/api/nft-staking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          ...form,
          tier: Number(form.tier),
          lock_years: Number(form.lock_years)
        })
      })
    }

    setModal(null)
    load()
  }

  async function handleEdit() {

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    if (context === "wallet") {

      await fetch(`/api/wallets/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      })
    }

    if (context === "staking") {

      await fetch(`/api/nft-staking/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          tier: Number(form.tier),
          lock_years: Number(form.lock_years),
          label: form.label
        })
      })
    }

    setModal(null)
    load()
  }

  async function handleDelete() {

    const { data } = await supabase.auth.getSession()
    const token = data.session.access_token

    if (context === "wallet") {
      await fetch(`/api/wallets/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      })
    }

    if (context === "staking") {
      await fetch(`/api/nft-staking/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      })
    }

    setModal(null)
    load()
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>

      <h1>Settings</h1>

      <div className="section-stack">

        {/* WALLET */}
        <div className="card">
          <div className="card-header">
            <h3>Wallets</h3>
            <button className="btn-icon" onClick={() => openAdd("wallet")}>
              <IconPlus size={18} />
            </button>
          </div>

          <table className="table">
            <tbody>
              {wallets.map(w => (
                <tr key={w.id}>
                  <td>
                    <div className="asset-icon">
                      <IconWallet size={16} />
                    </div>
                  </td>
                  <td>{w.label}</td>
                  <td>{formatAddress(w.address)}</td>
                  <td className="actions">
                    <IconPencil onClick={() => openEdit("wallet", w)} />
                    <IconTrash onClick={() => openDelete("wallet", w)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* STAKING */}
        <div className="card">
          <div className="card-header">
            <h3>Staking Memberships</h3>
            <button className="btn-icon" onClick={() => openAdd("staking")}>
              <IconPlus size={18} />
            </button>
          </div>

          <table className="table">
            <tbody>
              {staking.map(n => (
                <tr key={n.id}>
                  <td>
                    <div className="asset-icon">
                      <IconHexagonLetterS size={16} />
                    </div>
                  </td>
                  <td>{n.label}</td>
                  <td>#{n.token_id}</td>
                  <td>Tier {n.tier}</td>
                  <td>{n.lock_years} Years</td>
                  <td className="actions">
                    <IconPencil onClick={() => openEdit("staking", n)} />
                    <IconTrash onClick={() => openDelete("staking", n)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ================= MODAL (IDENTISCH) ================= */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">

            {modal !== "delete" && (
              <>
                <h3>{modal === "add" ? "Add" : "Edit"}</h3>

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

                {context === "staking" && (
                  <>
                    <input
                      placeholder="Token ID"
                      value={form.token_id}
                      disabled={modal === "edit"}
                      onChange={e => setForm({ ...form, token_id: e.target.value })}
                    />
                    <input
                      placeholder="Label"
                      value={form.label}
                      onChange={e => setForm({ ...form, label: e.target.value })}
                    />
                  </>
                )}

                <div className="modal-actions">
                  <button className="button-secondary" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button className="button-primary" onClick={modal === "add" ? handleAdd : handleEdit}>
                    Save
                  </button>
                </div>
              </>
            )}

            {modal === "delete" && (
              <>
                <h3>Delete</h3>
                <p className="text-secondary">Are you sure?</p>

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
      )}

    </div>
  )
}

function formatAddress(addr) {
  if (!addr) return "-"
  return addr.slice(0, 4) + "...." + addr.slice(-4)
}
