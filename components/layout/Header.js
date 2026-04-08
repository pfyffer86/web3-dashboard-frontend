"use client"

import { IconRefresh, IconUser } from "@tabler/icons-react"

export default function Header() {
  return (
    <div className="header">

      <button className="button-primary" style={{ marginRight: 12 }}>
        <IconRefresh size={16} style={{ marginRight: 6 }} />
        Refresh
      </button>

      <div className="user-button">
        <IconUser size={18} />
      </div>

    </div>
  )
}
