import "./globals.css"
import Sidebar from "../components/layout/Sidebar"
import Header from "../components/layout/Header"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <div className="app">

          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN */}
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
