"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconWallet,
  IconCoins,
  IconSettings
} from "@tabler/icons-react"

export default function Sidebar() {

  const path = usePathname()

  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="logo">
        <span className="logo-mark">A</span> Apertum
      </div>

      <div className="menu-section">Portfolio</div>

      <Link href="/dashboard" className={path === "/dashboard" ? "active" : ""}>
        <IconLayoutDashboard size={18} />
        Overview
      </Link>

      <Link href="/wallets" className={path === "/wallets" ? "active" : ""}>
        <IconWallet size={18} />
        Wallets
      </Link>

      <Link href="/assets" className={path === "/assets" ? "active" : ""}>
        <IconCoins size={18} />
        Assets
      </Link>

      <div className="menu-section">System</div>

      <Link href="/settings" className={path === "/settings" ? "active" : ""}>
        <IconSettings size={18} />
        Settings
      </Link>

    </div>
  )
}
