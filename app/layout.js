import "./globals.css"

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial" }}>
        <div style={{ display: "flex", height: "100vh" }}>

          {/* SIDEBAR */}
          <div style={{
            width: 220,
            background: "#0d0d0d",
            color: "#fff",
            padding: 20
          }}>
            <h2>Apertum</h2>

            <nav style={{ marginTop: 30 }}>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/assets">Assets</NavLink>
              <NavLink href="/settings">Settings</NavLink>
            </nav>
          </div>

          {/* MAIN */}
          <div style={{
            flex: 1,
            background: "#111",
            color: "#fff",
            overflow: "auto"
          }}>
            {children}
          </div>

        </div>
      </body>
    </html>
  )
}

function NavLink({ href, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <a href={href} style={{ color: "#aaa", textDecoration: "none" }}>
        {children}
      </a>
    </div>
  )
}
