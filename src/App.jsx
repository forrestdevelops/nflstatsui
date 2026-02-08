import { Routes, Route, Link } from 'react-router-dom'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import PlayerPage from './pages/PlayerPage'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">NFL Stats</Link>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/players/:playerId" element={<PlayerPage />} />
        </Routes>
      </main>
    </div>
  )
}
