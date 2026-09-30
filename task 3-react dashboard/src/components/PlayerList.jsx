import PlayerCard from './PlayerCard.jsx'

export default function PlayerList({ players, versions, useIndexKeys, onStatusChange, onRemove, onReset }) {
  console.log('[render] PlayerList')

  if (players.length === 0) {
    return <p className="empty">No players match this filter.</p>
  }

  return (
    <div className="grid">
      {players.map((player, index) => (
        <PlayerCard
          // stable key = id, + version so "Reset card" can remount it on purpose
          key={useIndexKeys ? index : `${player.id}-${versions[player.id] ?? 0}`}
          player={player}
          onStatusChange={onStatusChange}
          onRemove={onRemove}
          onReset={onReset}
        />
      ))}
    </div>
  )
}
