"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconChartLine,
  IconCoins,
  IconStack2,
  IconRobot,
  IconShovel,
  IconWallet,
  IconHexagonLetterN,
  IconSettings
} from "@tabler/icons-react"

export default function Sidebar() {

  const path = usePathname()

  const isActive = (href) => path === href

  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="logo">
     <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gSq_logo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00f0ff" />
      <stop offset="100%" stopColor="#7a5cff" />
    </linearGradient>
  </defs>

  <g stroke="url(#gSq_logo)" strokeWidth="4.5" fill="none">
    <path d="M55 95 Q40 75 55 55 Q70 35 90 55 Q110 75 90 95 Q70 115 55 95" />
    <path d="M90 95 Q75 75 90 55 Q105 35 125 55 Q145 75 125 95 Q105 115 90 95" />
    <line x1="70" y1="75" x2="110" y2="75" />
  </g>

  <g fontFamily="Eurostile, Arial Black, sans-serif" textAnchor="middle">
    <text x="90" y="130" fontSize="12" fill="#9aa" letterSpacing="3">
      MY
    </text>
    <text x="90" y="155" fontSize="22" fill="url(#gSq_logo)" letterSpacing="3">
      APERTUM
    </text>
  </g>
</svg>
      </div>

      {/* OVERVIEW */}
      <div className="menu-section">Overview</div>

      <Link href="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
        <IconLayoutDashboard size={18} />
        <span>Dashboard</span>
      </Link>

      <Link href="/rates" className={isActive("/rates") ? "active" : ""}>
        <IconChartLine size={18} />
        <span>Rates</span>
      </Link>

      {/* PORTFOLIO */}
      <div className="menu-section">Portfolio</div>

      <Link href="/wallets" className={isActive("/wallets") ? "active" : ""}>
        <IconWallet size={18} />
        <span>Wallets</span>
      </Link>

      <Link href="/assets" className={isActive("/assets") ? "active" : ""}>
        <IconCoins size={18} />
        <span>Tokens</span>
      </Link>

      <Link href="/staking" className={isActive("/staking") ? "active" : ""}>
        <IconStack2 size={18} />
        <span>Staking</span>
      </Link>

      <Link href="/trading" className={isActive("/trading") ? "active" : ""}>
        <IconRobot size={18} />
        <span>Trading</span>
      </Link>

      {/* MANAGEMENT */}
      <div className="menu-section">Management</div>

      <Link href="/settings" className={isActive("/settings") ? "active" : ""}>
        <IconSettings size={18} />
        <span>Settings</span>
      </Link>

    </div>
  )
}
