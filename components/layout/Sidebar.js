"use client"

import Link from "next/link"

export default function Sidebar() {
  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        Apertum
      </div>

      <nav className="sidebar-nav">

        <Link href="/dashboard" className="nav-item">
          Dashboard
        </Link>

        <Link href="/assets" className="nav-item active">
          Assets
        </Link>

        <Link href="/settings" className="nav-item">
          Settings
        </Link>

      </nav>

    </div>
  )
}
