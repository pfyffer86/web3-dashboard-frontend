"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconPlus,
  IconWallet,
  IconPencil,
  IconTrash
} from "@tabler/icons-react"

export default function WalletsPage() {

  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(null) // add | edit | delete
  const [selected, setSelected] = useState(null)

  const [form, setForm] = useState({
    label: "",
    address: ""
  })

  // ===== LOAD =====
  async function loadWallets() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/wallets",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )

    const json = await res.json()

    setWallets(json || [])
    setLoading(false)
  }

  useEffect(() => {
    loadWallets()
  }, [])

  // ===== ACTIONS =====

  function openAdd() {
    setForm({ label: "", address: "" })
    setModal("add")
  }

  function openEdit(w) {
    setSelected(w)
    setForm({
      label: w.label || "",
      address: w.address
    })
    setModal("edit")
  }

  function openDelete(w) {
    setSelected(w)
    setModal("delete")
  }

  async function handleAdd() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      "https://apertum-dashboard-production.up.railway.app/api/wallets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      }
    )

    setModal(null)
    loadWallets()
  }

  async function handleEdit() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      `https://apertum-dashboard-production.up.railway.app/api/wallets/${selected.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      }
    )

    setModal(null)
    loadWallets()
  }

  async function handleDelete() {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    await fetch(
      `https://apertum-dashboard-production.up.railway.app/api/wallets/${selected.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )

    setModal(null)
    loadWallets()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>

      <h1>My Wallets</h1>

      {/* GRID */}
     {/* ADD CARD (SEPARATE ROW) */}
<div className="mb-24">
  <div className="card add-wallet-card full" onClick={openAdd}>
    <IconPlus size={36} />
    <div>Add Wallet</div>
  </div>
</div>

{/* WALLET GRID */}
<div className="wallet-grid">
  {wallets.map(w => (
          <div key={w.id} className="card wallet-card">

            <div className="wallet-row">

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

              <div className="wallet-actions">

                <IconPencil
                  size={18}
                  className="action-icon"
                  onClick={() => openEdit(w)}
                />

                <IconTrash
                  size={18}
                  className="action-icon delete"
                  onClick={() => openDelete(w)}
                />

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay">

          <div className="modal">

            {modal !== "delete" && (
              <>
                <h3>{modal === "add" ? "Add Wallet" : "Edit Wallet"}</h3>

                <input
                  placeholder="Label"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                />

                <input
                  placeholder="Wallet Address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />

                <div className="modal-actions">
                  <button onClick={() => setModal(null)}>Cancel</button>

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
                <h3>Delete Wallet</h3>

                <p className="text-secondary">
                  Are you sure you want to delete this wallet?
                </p>

                <div className="modal-actions">
                  <button onClick={() => setModal(null)}>Cancel</button>

                  <button
                    className="button-danger"
                    onClick={handleDelete}
                  >
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

/* HELPERS */

function formatAddress(addr) {
  if (!addr) return ""
  return addr.slice(0, 4) + "..." + addr.slice(-4)
}
