import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPlayerProfile, getPlayerSeasonStats, getPlayerGameLog } from '../api'

function StatsCard({ title, stats }) {
  if (!stats) return null
  const entries = Object.entries(stats).filter(([k]) => k !== '__typename')
  if (entries.every(([, v]) => v == null || v === 0)) return null

  return (
    <div className="stat-card">
      <h3>{title}</h3>
      {entries.map(([key, value]) => (
        <div className="stat-row" key={key}>
          <span>{formatLabel(key)}</span>
          <span>{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value ?? '—'}</span>
        </div>
      ))}
    </div>
  )
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace('Pct', '%')
}

function GameLogTable({ games }) {
  if (!games || games.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No game log data available.</p>

  const hasPassing = games.some(g => g.passing?.attempts > 0)
  const hasRushing = games.some(g => g.rushing?.attempts > 0)
  const hasReceiving = games.some(g => g.receiving?.receptions > 0)
  const hasDefensive = games.some(g => g.defensive?.totalTackles > 0 || g.defensive?.sacks > 0)
  const hasFumbles = games.some(g => g.fumbles?.fumbles > 0 || g.fumbles?.fumblesRecovered > 0)

  return (
    <div className="table-wrap">
      <table className="gamelog-table">
        <thead>
          <tr>
            <th>Wk</th>
            <th>Date</th>
            <th>Opp</th>
            <th>Result</th>
            {hasPassing && <><th>Cmp/Att</th><th>Yds</th><th>TD</th><th>INT</th><th>Rtg</th></>}
            {hasRushing && <><th>Rush</th><th>Yds</th><th>TD</th></>}
            {hasReceiving && <><th>Rec</th><th>Yds</th><th>TD</th></>}
            {hasDefensive && <><th>Tkl</th><th>Solo</th><th>Sck</th><th>TFL</th><th>PD</th><th>INT</th><th>FF</th></>}
            {hasFumbles && <><th>Fum</th><th>Lost</th></>}
          </tr>
        </thead>
        <tbody>
          {games.map((g, i) => (
            <tr key={i}>
              <td>{g.week}</td>
              <td>{g.date}</td>
              <td>{g.opponent}</td>
              <td><span className={g.won ? 'win' : 'loss'}>{g.won ? 'W' : 'L'}</span></td>
              {hasPassing && (
                <>
                  <td>{g.passing?.completions}/{g.passing?.attempts}</td>
                  <td>{g.passing?.yards}</td>
                  <td>{g.passing?.touchdowns}</td>
                  <td>{g.passing?.interceptions}</td>
                  <td>{g.passing?.rating?.toFixed(1)}</td>
                </>
              )}
              {hasRushing && (
                <>
                  <td>{g.rushing?.attempts}</td>
                  <td>{g.rushing?.yards}</td>
                  <td>{g.rushing?.touchdowns}</td>
                </>
              )}
              {hasReceiving && (
                <>
                  <td>{g.receiving?.receptions}</td>
                  <td>{g.receiving?.yards}</td>
                  <td>{g.receiving?.touchdowns}</td>
                </>
              )}
              {hasDefensive && (
                <>
                  <td>{g.defensive?.totalTackles}</td>
                  <td>{g.defensive?.soloTackles}</td>
                  <td>{g.defensive?.sacks}</td>
                  <td>{g.defensive?.tacklesForLoss}</td>
                  <td>{g.defensive?.passesDefended}</td>
                  <td>{g.defensive?.interceptions}</td>
                  <td>{g.defensive?.forcedFumbles}</td>
                </>
              )}
              {hasFumbles && (
                <>
                  <td>{g.fumbles?.fumbles}</td>
                  <td>{g.fumbles?.fumblesLost}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PlayerPage() {
  const { playerId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [tab, setTab] = useState('career')
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [seasonStats, setSeasonStats] = useState(null)
  const [gameLog, setGameLog] = useState(null)
  const [seasonLoading, setSeasonLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPlayerProfile(playerId)
      .then(data => {
        setProfile(data)
        if (data.availableSeasons?.length > 0) {
          setSelectedSeason(data.availableSeasons[0])
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [playerId])

  useEffect(() => {
    if (!selectedSeason || tab === 'career') return
    setSeasonLoading(true)
    const promises = [
      tab === 'season' ? getPlayerSeasonStats(playerId, selectedSeason) : Promise.resolve(null),
      tab === 'gamelog' ? getPlayerGameLog(playerId, selectedSeason) : Promise.resolve(null),
    ]
    Promise.all(promises)
      .then(([stats, games]) => {
        if (stats) setSeasonStats(stats)
        if (games) setGameLog(games)
      })
      .catch(() => {})
      .finally(() => setSeasonLoading(false))
  }, [playerId, selectedSeason, tab])

  if (loading) return <div className="loading"><div className="spinner" />Loading player...</div>
  if (error) return <div className="error">Failed to load player: {error}</div>
  if (!profile) return null

  const career = profile.careerStats

  return (
    <>
      <Link to="/" className="back-link">&larr; Back to Teams</Link>

      <div className="player-header">
        {profile.headshotUrl && (
          <img className="player-headshot-lg" src={profile.headshotUrl} alt={profile.name} />
        )}
        <div className="player-info">
          <h1>{profile.name}</h1>
          <div className="player-badges">
            {profile.position && <span className="badge">{profile.position}</span>}
            {profile.team && <span className="badge">{profile.team}</span>}
            {profile.jersey && <span className="badge">#{profile.jersey}</span>}
          </div>
          <div className="player-bio">
            {profile.age && <div className="bio-item"><strong>{profile.age}</strong>Age</div>}
            {profile.height && <div className="bio-item"><strong>{profile.height}</strong>Height</div>}
            {profile.weight && <div className="bio-item"><strong>{profile.weight}</strong>Weight</div>}
            {profile.college && <div className="bio-item"><strong>{profile.college}</strong>College</div>}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'career' ? 'active' : ''}`} onClick={() => setTab('career')}>Career Stats</button>
        <button className={`tab ${tab === 'season' ? 'active' : ''}`} onClick={() => setTab('season')}>Season Stats</button>
        <button className={`tab ${tab === 'gamelog' ? 'active' : ''}`} onClick={() => setTab('gamelog')}>Game Log</button>
      </div>

      {(tab === 'season' || tab === 'gamelog') && profile.availableSeasons?.length > 0 && (
        <select
          className="season-select"
          value={selectedSeason || ''}
          onChange={e => setSelectedSeason(Number(e.target.value))}
        >
          {profile.availableSeasons.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      {tab === 'career' && career && (
        <div className="stats-grid">
          <StatsCard title="Passing" stats={career.passing} />
          <StatsCard title="Rushing" stats={career.rushing} />
          <StatsCard title="Receiving" stats={career.receiving} />
          <StatsCard title="Defensive" stats={career.defensive} />
          <StatsCard title="Fumbles" stats={career.fumbles} />
        </div>
      )}

      {tab === 'season' && (
        seasonLoading
          ? <div className="loading"><div className="spinner" />Loading stats...</div>
          : seasonStats
            ? <div className="stats-grid">
                <StatsCard title="Passing" stats={seasonStats.passing} />
                <StatsCard title="Rushing" stats={seasonStats.rushing} />
                <StatsCard title="Receiving" stats={seasonStats.receiving} />
                <StatsCard title="Defensive" stats={seasonStats.defensive} />
                <StatsCard title="Fumbles" stats={seasonStats.fumbles} />
              </div>
            : <p style={{ color: 'var(--text-muted)' }}>Select a season to view stats.</p>
      )}

      {tab === 'gamelog' && (
        seasonLoading
          ? <div className="loading"><div className="spinner" />Loading game log...</div>
          : <GameLogTable games={gameLog} />
      )}
    </>
  )
}
