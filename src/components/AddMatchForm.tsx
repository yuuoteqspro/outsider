import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Player } from '../lib/supabase';

type SlotKey = 'p1' | 'p2' | 'o1' | 'o2';
const ALL_KEYS: SlotKey[] = ['p1', 'p2', 'o1', 'o2'];
const SCORES = [0, 1, 2, 3, 4, 5, 6];

interface AddMatchFormProps {
  players: Player[];
  onSave: (payload: { player1_id: string; player2_id: string; opponent1_id: string; opponent2_id: string; score_us: string; score_them: string }) => Promise<void>;
  onSelectedIdsChange: (ids: string[]) => void;
  onAddPlayer: (name: string) => Promise<void>;
}

export default function AddMatchForm({ players, onSave, onSelectedIdsChange, onAddPlayer }: AddMatchFormProps) {
  const [selected, setSelected] = useState<Record<string, string | null>>({ p1: null, p2: null, o1: null, o2: null });
  const [activeSlot, setActiveSlot] = useState<SlotKey>('p1');
  const [scoreUs, setScoreUs] = useState<number | null>(null);
  const [scoreThem, setScoreThem] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [slotText, setSlotText] = useState<Record<string, string>>({ p1: '', p2: '', o1: '', o2: '' });
  const slotInputRefs = useRef<Record<string, HTMLInputElement | null>>({ p1: null, p2: null, o1: null, o2: null });

  const selectedIds = Object.values(selected).filter(Boolean) as string[];
  const canSave = ALL_KEYS.every(k => selected[k] !== null) && scoreUs !== null && scoreThem !== null;

  useEffect(() => { onSelectedIdsChange(selectedIds); }, [selectedIds.join(',')]);

  useEffect(() => {
    function handleChipEvent(e: Event) {
      const playerId = (e as CustomEvent).detail as string;
      if (selectedIds.includes(playerId)) return;
      setSelected(prev => {
        const next = { ...prev, [activeSlot]: playerId };
        const nextSlot = ALL_KEYS.find(k => !next[k] && k !== activeSlot);
        if (nextSlot) setActiveSlot(nextSlot);
        return next;
      });
    }
    window.addEventListener('player-chip-click', handleChipEvent);
    return () => window.removeEventListener('player-chip-click', handleChipEvent);
  }, [activeSlot, selectedIds]);

  for (const key of ALL_KEYS) {
    const text = slotText[key]?.trim();
    if (text && !selected[key]) {
      const match = players.find(p => p.name.toLowerCase() === text.toLowerCase());
      if (match && !selectedIds.includes(match.id)) {
        setTimeout(() => {
          setSelected(prev => {
            if (prev[key]) return prev;
            const m = players.find(p => p.name.toLowerCase() === text.toLowerCase());
            if (!m || Object.values(prev).includes(m.id)) return prev;
            return { ...prev, [key]: m.id };
          });
          setSlotText(prev => ({ ...prev, [key]: '' }));
        }, 0);
        break;
      }
    }
  }

  function handleSlotClick(key: SlotKey) {
    if (selected[key]) {
      setSelected(prev => ({ ...prev, [key]: null }));
      setSlotText(prev => ({ ...prev, [key]: '' }));
    }
    setActiveSlot(key);
    setTimeout(() => slotInputRefs.current[key]?.focus(), 50);
  }

  async function handleSlotSubmit(key: SlotKey) {
    const text = slotText[key]?.trim();
    if (!text) return;
    const match = players.find(p => p.name.toLowerCase() === text.toLowerCase());
    if (match && !selectedIds.includes(match.id)) {
      setSelected(prev => ({ ...prev, [key]: match.id }));
      setSlotText(prev => ({ ...prev, [key]: '' }));
      const nextSlot = ALL_KEYS.find(k => { const next = { ...selected, [key]: match.id }; return !next[k] && k !== key; });
      if (nextSlot) { setActiveSlot(nextSlot); setTimeout(() => slotInputRefs.current[nextSlot]?.focus(), 50); }
    } else if (!match) {
      await onAddPlayer(text);
      setSlotText(prev => ({ ...prev, [key]: text }));
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      player1_id: selected.p1!, player2_id: selected.p2!,
      opponent1_id: selected.o1!, opponent2_id: selected.o2!,
      score_us: String(scoreUs), score_them: String(scoreThem),
    });
    setSelected({ p1: null, p2: null, o1: null, o2: null });
    setSlotText({ p1: '', p2: '', o1: '', o2: '' });
    setScoreUs(null); setScoreThem(null);
    setActiveSlot('p1');
    setSaving(false);
  }

  const playerName = (id: string | null) => id ? (players.find(p => p.id === id)?.name ?? '') : '';

  function SlotInput({ label, slotKey }: { label: string; slotKey: SlotKey }) {
    const filled = selected[slotKey];
    const isActive = activeSlot === slotKey;
    return (
      <div
        onClick={() => !filled && handleSlotClick(slotKey)}
        className={[
          'flex items-center px-1.5 py-1 rounded border text-xs cursor-pointer transition-all flex-1 min-w-0',
          filled ? 'bg-blue-50 border-blue-300 text-blue-800'
          : isActive ? 'border-blue-400 bg-white ring-1 ring-blue-200'
          : 'border-gray-200 bg-gray-50',
        ].join(' ')}
      >
        <span className={`font-medium mr-0.5 shrink-0 ${filled ? 'text-blue-500' : 'text-gray-400'}`}>{label}</span>
        {filled ? (
          <div className="flex items-center flex-1 min-w-0">
            <span className="font-medium truncate flex-1 text-xs">{playerName(filled)}</span>
            <button onClick={e => { e.stopPropagation(); handleSlotClick(slotKey); }} className="ml-0.5 shrink-0">
              <X size={9} className="text-blue-400" />
            </button>
          </div>
        ) : (
          <input
            ref={el => { slotInputRefs.current[slotKey] = el; }}
            type="text" value={slotText[slotKey]}
            onChange={e => { setSlotText(prev => ({ ...prev, [slotKey]: e.target.value })); setActiveSlot(slotKey); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSlotSubmit(slotKey); }}
            onFocus={() => setActiveSlot(slotKey)}
            placeholder="이름"
            className="flex-1 min-w-0 bg-transparent outline-none text-xs text-gray-700 placeholder-gray-300 w-0"
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
    );
  }

  function ScoreRow({ value, onChange, color }: { value: number | null; onChange: (n: number) => void; color: 'blue' | 'red' }) {
    const active = color === 'blue' ? 'bg-blue-500 text-white' : 'bg-red-400 text-white';
    return (
      <div className="flex gap-px">
        {SCORES.map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={['flex-1 h-6 text-xs font-bold rounded transition-all',
              value === n ? active : 'bg-gray-100 text-gray-500 hover:bg-gray-200'].join(' ')}>
            {n}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex gap-1.5 items-stretch">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex gap-1">
            <SlotInput label="나" slotKey="p1" />
            <SlotInput label="파트너" slotKey="p2" />
          </div>
          <ScoreRow value={scoreUs} onChange={setScoreUs} color="blue" />
          <div className="text-center text-xs text-black-900">vs</div> 
          <div className="flex gap-1">
            <SlotInput label="상대1" slotKey="o1" />
            <SlotInput label="상대2" slotKey="o2" />
          </div>
          <ScoreRow value={scoreThem} onChange={setScoreThem} color="red" />
        </div>
        <button onClick={handleSave} disabled={!canSave || saving}
          className="shrink-0 w-10 bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-30 transition-colors">
          {saving ? '...' : '저장'}
        </button>
      </div>
    </div>
  );
}