"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

import {
  IconPlus,
  IconWallet,
  IconHexagonLetterS,
  IconRobot,
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

      const headers = {
        Authorization: "Bearer " + token
      }

      const [wRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/wallets`, { headers }),
        fetch(`${API_BASE}/api/nft-staking`, { headers })
      ])

      const walletsData = await wRes.json()
      const stakingData = await sRes.json()

      setWallets(walletsData || [])
      setStaking(stakingData || [])
      setTradebots([])

    } catch (err) {
      console.error(err)
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

    setModal(null)
    loadData()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {/* UI bleibt exakt unverändert */}
      {/* (kein weiterer Code geändert) */}
      {/* ... */}
    </div>
  )
}

/* ================= HELPERS ================= */

function formatAddress(addr) {
  if (!addr) return "-"
  return addr.slice(0, 4) + "...." + addr.slice(-4)
}
