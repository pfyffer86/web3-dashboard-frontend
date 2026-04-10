import "./globals.css"
import "./styles/layout.css"
import "./styles/components.css"

import Sidebar from "../components/layout/Sidebar"
import Header from "../components/layout/Header"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <div className="app">

          <Sidebar />

          <div className="main">
            <Header />

            <div className="content">
              {children}
            </div>
          </div>

        </div>

      </body>
    </html>
  )
}
