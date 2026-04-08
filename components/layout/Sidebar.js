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

  const menu = [
    {
      title: "Portfolio",
      items: [
        { label: "Overview", href: "/dashboard", icon: IconLayoutDashboard },
        { label: "Wallets", href: "/wallets", icon: IconWallet },
        { label: "Assets", href: "/assets", icon: IconCoins }
      ]
    },
    {
      title: "System",
      items: [
        { label: "Settings", href: "/settings", icon: IconSettings }
      ]
    }
  ]

  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="logo"> <svg width="100%" height="32" viewBox="0 0 210 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M28.594 8.328 24.992 0 11.153 32h6.921l6.918-15.569 3.84 8.65h-7.3L24.992 32H38.83L28.594 8.328z" fill="#488BC3"></path> <path d="M17.439 8.328 13.837 0 0 32h6.918l6.919-15.569 3.602-8.103z" fill="url(#dxqoqp9hea)"></path> <path d="M209.711 26.218h-2.736l-4.736-13.627-5.648 12.791c-.406.912-.989 1.064-1.621 1.064-.66 0-1.217-.152-1.622-1.064L187.7 12.591l-4.763 13.627h-2.684l5.572-15.881c.279-.836.862-1.292 1.57-1.292.735 0 1.267.405 1.572 1.013l6.054 13.323 6.053-13.323c.253-.608.81-1.013 1.544-1.013.735 0 1.292.456 1.596 1.292l5.497 15.881zM176.737 18.822v-9.55h2.761v9.55c0 5.116-3.293 7.674-9.827 7.674-7.574 0-10.842-2.558-10.842-7.674v-9.55h2.736v9.55c0 3.8 2.254 5.395 8.106 5.395 5.85 0 7.066-1.596 7.066-5.395zM146.8 26.218h-2.761V11.603h-7.948l-1.529-2.33h19.653l1.532 2.33H146.8v14.615zM135.832 26.218h-3.723l-6.054-5.598h-9.727v5.598h-2.735v-7.802h12.133c3.166 0 6.028-.912 6.028-3.343 0-2.685-2.508-3.47-6.028-3.47h-12.184l-1.538-2.33h14.735c3.951 0 7.827 1.52 7.827 5.648 0 3.04-2.229 4.889-5.674 5.192l6.94 6.105zM110.092 26.218H93.779V9.272h14.656l1.53 2.33h-13.45v5.092H108.1l1.309 2.026H96.515v5.193h12.059l1.518 2.305zM83.622 20.696h-10.31v5.522h-2.735v-7.802h12.108c3.217 0 5.825-.912 5.825-3.368 0-2.635-2.38-3.445-5.85-3.445H70.526l-1.534-2.33h14.629c4.66 0 7.624 2.178 7.624 5.8 0 3.597-2.938 5.623-7.624 5.623zM68.742 26.289H53.891l-1.52-2.305h11.483l-7.801-11.753-9.499 14.058h-3.242c4.247-6.233 8.478-12.106 12.74-18.328 4.48 6.046 8.495 12.083 12.69 18.328z" fill="#fff"></path> <defs> <linearGradient id="dxqoqp9hea" x1="109.992" y1="76.98" x2="-7.816" y2="3.526" gradientUnits="userSpaceOnUse"> <stop stop-color="#B58947"></stop> <stop offset=".11" stop-color="#A3732F"></stop> <stop offset=".3" stop-color="#FFEAA5"></stop> <stop offset=".62" stop-color="#CEA253"></stop> <stop offset=".71" stop-color="#82561D"></stop> <stop offset=".74" stop-color="#A07A3F"></stop> <stop offset=".8" stop-color="#D3B879"></stop> <stop offset=".84" stop-color="#F2DE9D"></stop> <stop offset=".86" stop-color="#FFEDAB"></stop> <stop offset=".9" stop-color="#EAD290"></stop> <stop offset=".97" stop-color="#B88E4B"></stop> <stop offset="1" stop-color="#A3732F"></stop> </linearGradient> </defs> </svg> </div>

      {menu.map(section => (
        <div key={section.title}>

          <div className="menu-section">
            {section.title}
          </div>

          {section.items.map(item => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={path === item.href ? "active" : ""}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}

        </div>
      ))}

    </div>
  )
}
