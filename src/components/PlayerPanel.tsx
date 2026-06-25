import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Player } from '../lib/supabase';

interface PlayerPanelProps {
  players: Player[];
  selectedIds: string[];
  onAddPlayer: (name: string) => Promise<void>;
  onDeletePlayer: (id: string) => Promise<void>;
}

export default function PlayerPanel({
  players,
  selectedIds,
  onAddPlayer,
  onDeletePlayer,
}: PlayerPanelProps) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    await onAddPlayer(name);
    setNewName('');
    setAdding(false);
  }

  function handleLongPressStart(playerId: string) {
    const t = setTimeout(async () => {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      if (confirm(`"${player.name}" 삭제?`)) {
        await onDeletePlayer(playerId);
      }
    }, 600);
    setLongPressTimer(t);
  }

  function handleLongPressEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }

  function handleChipClick(playerId: string) {
    if (selectedIds.includes(playerId)) return;
    window.dispatchEvent(new CustomEvent('player-chip-click', { detail: playerId }));
  }

  return (
    <div className="shrink-0 w-28 flex flex-col bg-white h-full">
      <div className="px-2 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500">선수</p>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <div className="grid grid-cols-2 gap-0.5">
          {sorted.map(player => {
            const isSelected = selectedIds.includes(player.id);
            return (
              <button
                key={player.id}
                onClick={() => handleChipClick(player.id)}
                onTouchStart={() => handleLongPressStart(player.id)}
                onTouchEnd={handleLongPressEnd}
                onMouseDown={() => handleLongPressStart(player.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                disabled={isSelected}
                className={[
                  'px-1 py-1 rounded text-xs font-medium transition-all select-none truncate text-center',
                  isSelected
                    ? 'bg-blue-50 text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-blue-50',
                ].join(' ')}
              >
                {player.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-1 border-t border-gray-100">
        <div className="flex items-center gap-0.5">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="이름"
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-blue-400 bg-gray-50 placeholder-gray-300"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="w-5 h-5 flex items-center justify-center rounded bg-blue-500 text-white disabled:opacity-30 shrink-0"
          >
            <Plus size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}