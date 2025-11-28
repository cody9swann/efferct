import { createRootRoute, Outlet, Link } from "@tanstack/react-router"
import { RegistryProvider } from "@effect-atom/atom-react"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ATS</title>
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f0f;
            color: #fff;
          }
          .app-layout {
            display: flex;
            min-height: 100vh;
          }
          .sidebar {
            width: 240px;
            background: #1a1a1a;
            border-right: 1px solid #333;
            padding: 16px;
          }
          .sidebar nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .sidebar a {
            color: #888;
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
          }
          .sidebar a:hover {
            background: #333;
            color: #fff;
          }
          .sidebar a.active {
            background: #333;
            color: #fff;
          }
          .main-content {
            flex: 1;
            padding: 24px;
          }
          .logo {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #fff;
          }
        `}</style>
      </head>
      <body>
        <RegistryProvider>
          <div className="app-layout">
            <aside className="sidebar">
              <div className="logo">ATS</div>
              <nav>
                <Link to="/">Dashboard</Link>
                <Link to="/jobs">Jobs</Link>
                <Link to="/candidates">Candidates</Link>
              </nav>
            </aside>
            <main className="main-content">
              <Outlet />
            </main>
          </div>
        </RegistryProvider>
      </body>
    </html>
  )
}
