import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTeams } from '../api'

export default function TeamsPage() {
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" />Loading teams...</div>
  if (error) return <div className="error">Failed to load teams: {error}</div>

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.abbreviation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 24 }}>
        NFL Teams
      </h1>
      <input
        className="search-input"
        placeholder="Search teams..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="teams-grid">
        {filtered.map(team => (
          <Link key={team.id} to={`/teams/${team.id}`} className="team-card">
            {team.logoUrl && (
              <img src={team.logoUrl} alt={team.name} />
            )}
            <div className="team-card-info">
              <h3>{team.name}</h3>
              <span>{team.abbreviation}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
