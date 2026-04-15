"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconPlus,
  IconStack2,
  IconRobot,
  IconShovel,
  IconPencil,
  IconTrash,
  IconHexagonLetterS,
  IconHexagonLetterT,
  IconHexagonLetterM
} from "@tabler/icons-react"

export default function NFTsPage() {

  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)

  const [form, setForm] = useState({
    token_id: "",
    tier: 1,
    lock_years: 1
  })

  /* ================= LOAD ================= */

  async function loadNFTs() {

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch(
        "https://apertum-dashboard-production.up.railway.app/api/nfts",
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      )

      if (!res.ok) throw new Error("API error")

      const json = await res.json()
      setNfts(json || [])

    } catch (err) {

      console.error(err)
      setNfts([])

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  /* ================= HELPERS ================= */

  function getIcon(type) {
    if (type === "membership") return <IconHexagonLetterS size={18} />
    if (type === "tradebot") return <IconHexagonLetterT size={18} />
    if (type === "minebot") return <IconHexagonLetterM size={18} />
    return null
  }

  function getLabel(type) {
    if (type === "membership") return "Staking"
    if (type === "tradebot") return "TradeBot"
    if (type === "minebot") return "MineBot"
    return "-"
  }

  const memberships = nfts.filter(n => n.type === "membership")

  /* ================= ACTIONS ================= */

  function openAdd() {
    setForm({ token_id: "", tier: 1, lock_years: 1 })
    setModal("add")
  }

  function openEdit(n) {
    setSelected(n)
    setForm({
      token_id: n.token_id,
      tier: n.tier,
      lock_years: n.lock_years
    })
    setModal("edit")
  }

  function openDelete(n) {
    setSelected(n)
    setModal("delete")
  }

  async function handleAdd() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/nfts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          ...form,
          tier: Number(form.tier),
          lock_years: Number(form.lock_years),
          type: "membership"
        })
      }
    )

    setModal(null)
    loadNFTs()
  }

  async function handleEdit() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      `https://apertum-dashboard-production.up.railway.app/api/nfts/${selected.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          tier: Number(form.tier),
          lock_years: Number(form.lock_years)
        })
      }
    )

    setModal(null)
    loadNFTs()
  }

  async function handleDelete() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      `https://apertum-dashboard-production.up.railway.app/api/nfts/${selected.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )

    setModal(null)
    loadNFTs()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>

      <h1>My NFTs</h1>

      {/* ADD NFT */}
      <div className="wallet-grid mb-32">

        <div className="card add-wallet-card" onClick={openAdd}>
          <IconPlus size={26} />
          <IconStack2 size={20} />
          <div>Add Staking NFT</div>
        </div>

        <div className="card add-wallet-card disabled">
          <IconPlus size={26} />
          <IconRobot size={20} />
          <div>Add TradeBot NFT</div>
        </div>

        <div className="card add-wallet-card disabled">
          <IconPlus size={26} />
          <IconShovel size={20} />
          <div>Add MineBot NFT</div>
        </div>

      </div>

      {/* TABLE */}
      <div className="card">
        <h3 className="mb-16">NFT Overview</h3>

        <table className="table">
          <thead>
            <tr>
              <th>NFT</th>
              <th>Token ID</th>
              <th>Tier</th>
              <th>Lock</th>
              <th>Settings</th>
            </tr>
          </thead>

          <tbody>
            {memberships.map(n => (
              <tr key={n.id}>

                <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {getIcon(n.type)}
                  {getLabel(n.type)}
                </td>

                <td>#{n.token_id}</td>

                <td>Tier {n.tier}</td>

                <td>{n.lock_years} Years</td>

                <td>
                  <div style={{ display: "flex", gap: 10 }}>
                    <IconPencil
                      size={18}
                      className="action-icon"
                      onClick={() => openEdit(n)}
                    />
                    <IconTrash
                      size={18}
                      className="action-icon delete"
                      onClick={() => openDelete(n)}
                    />
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL bleibt unverändert */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">

            {modal !== "delete" && (
              <>
                <h3>{modal === "add" ? "Add NFT" : "Edit NFT"}</h3>

                <input
                  placeholder="Token ID"
                  value={form.token_id}
                  onChange={e => setForm({ ...form, token_id: e.target.value })}
                  disabled={modal === "edit"}
                />

                <select
                  value={String(form.tier)}
                  onChange={e => setForm({ ...form, tier: Number(e.target.value) })}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>
                      Tier {i+1}
                    </option>
                  ))}
                </select>

                <select
                  value={String(form.lock_years)}
                  onChange={e => setForm({ ...form, lock_years: Number(e.target.value) })}
                >
                  {[1,2,3,4].map(y => (
                    <option key={y} value={y}>
                      {y} Years
                    </option>
                  ))}
                </select>

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

            {modal === "delete" && (
              <>
                <h3>Delete NFT</h3>

                <p className="text-secondary">
                  Are you sure you want to delete this NFT?
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
      )}

    </div>
  )
}
