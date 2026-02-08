import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam } from '../api'

const POSITION_GROUPS = {
  All: null,
  QB: ['QB'],
  RB: ['RB', 'FB'],
  WR: ['WR'],
  TE: ['TE'],
  OL: ['OT', 'OG', 'C', 'OL', 'T', 'G'],
  DL: ['DE', 'DT', 'DL', 'NT'],
  LB: ['LB', 'OLB', 'ILB', 'MLB'],
  DB: ['CB', 'S', 'FS', 'SS', 'DB'],
  ST: ['K', 'P', 'LS'],
}

export default function TeamDetailPage() {
  const { teamId } = useParams()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [posFilter, setPosFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getTeam(teamId)
      .then(setTeam)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [teamId])

  const roster = useMemo(() => {
    if (!team?.roster) return []
    let filtered = team.roster
    if (posFilter !== 'All') {
      const positions = POSITION_GROUPS[posFilter]
      filtered = filtered.filter(p => positions.includes(p.position))
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q))
    }
    return filtered
  }, [team, posFilter, search])

  if (loading) return <div className="loading"><div className="spinner" />Loading team...</div>
  if (error) return <div className="error">Failed to load team: {error}</div>
  if (!team) return null

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Teams</Link>
        <span>/</span>
        <span>{team.name}</span>
      </div>

      <div className="team-header">
        {team.logoUrl && <img src={team.logoUrl} alt={team.name} />}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{team.name}</h1>
          <div className="team-meta">
            {team.record && <span>Record: <strong>{team.record}</strong></span>}
            {team.divisionStanding && <span>Standing: <strong>{team.divisionStanding}</strong></span>}
            {team.venue && <span>Venue: <strong>{team.venue}</strong></span>}
          </div>
        </div>
      </div>

      <h2 className="section-title">Roster</h2>

      <input
        className="search-input"
        placeholder="Search players..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 300 }}
      />

      <div className="position-filters">
        {Object.keys(POSITION_GROUPS).map(group => (
          <button
            key={group}
            className={`pos-btn ${posFilter === group ? 'active' : ''}`}
            onClick={() => setPosFilter(group)}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Pos</th>
              <th>Age</th>
              <th>Ht</th>
              <th>Wt</th>
              <th>Exp</th>
              <th>College</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map(player => (
              <tr key={player.id} onClick={() => window.location.href = `/players/${player.id}`} style={{ cursor: 'pointer' }}>
                <td>
                  <Link to={`/players/${player.id}`} className="roster-player-cell" onClick={e => e.stopPropagation()}>
                    {player.headshotUrl && (
                      <img className="roster-headshot" src={player.headshotUrl} alt="" />
                    )}
                    <span>{player.name}</span>
                  </Link>
                </td>
                <td>{player.jersey}</td>
                <td>{player.position}</td>
                <td>{player.age}</td>
                <td>{player.height}</td>
                <td>{player.weight}</td>
                <td>{player.experience != null ? (player.experience === 0 ? 'R' : player.experience) : '—'}</td>
                <td>{player.college || '—'}</td>
                <td>{player.status || '—'}</td>
              </tr>
            ))}
            {roster.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No players found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
