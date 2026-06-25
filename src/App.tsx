import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import type { Player, Match } from './lib/supabase';
import DateNav from './components/DateNav';
import MatchCard from './components/MatchCard';
import AddMatchForm from './components/AddMatchForm';
import PlayerPanel from './components/PlayerPanel';

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [date, setDate] = useState<Date>(() => new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setPlayers(data);
  }, []);

  const fetchMatches = useCallback(async (d: Date) => {
    setLoadingMatches(true);
    const dateStr = toLocalDateString(d);
    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(id, name),
        player2:player2_id(id, name),
        opponent1:opponent1_id(id, name),
        opponent2:opponent2_id(id, name)
      `)
      .eq('date', dateStr)
      .order('created_at', { ascending: true });
    if (data) setMatches(data as Match[]);
    setLoadingMatches(false);
  }, []);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);
  useEffect(() => { fetchMatches(date); }, [date, fetchMatches]);

  async function handleAddPlayer(name: string) {
    const { error } = await supabase.from('players').insert({ name });
    if (!error) await fetchPlayers();
  }

  async function handleDeletePlayer(id: string) {
    await supabase.from('players').delete().eq('id', id);
    await fetchPlayers();
  }

  async function handleSaveMatch(payload: {
    player1_id: string;
    player2_id: string;
    opponent1_id: string;
    opponent2_id: string;
    score_us: string;
    score_them: string;
  }) {
    const { error } = await supabase.from('matches').insert({
      ...payload,
      date: toLocalDateString(date),
    });
    if (!error) await fetchMatches(date);
  }

  async function handleDeleteMatch(id: string) {
    await supabase.from('matches').delete().eq('id', id);
    await fetchMatches(date);
  }

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <PlayerPanel
        players={players}
        selectedIds={selectedIds}
        onAddPlayer={handleAddPlayer}
        onDeletePlayer={handleDeletePlayer}
      />
      <div className="flex-1 flex flex-col min-w-0 border-l border-gray-200">
        {/* 입력 폼 (상단) */}
        <AddMatchForm
          players={players}
          onSave={handleSaveMatch}
          onSelectedIdsChange={setSelectedIds}
          onAddPlayer={handleAddPlayer}
        />
        {/* 날짜 */}
        <DateNav date={date} onChange={setDate} />
        {/* 경기 목록 */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 bg-gray-50">
          {loadingMatches ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">불러오는 중...</div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-sm">경기 없음</p>
            </div>
          ) : (
            matches.map(match => (
              <MatchCard key={match.id} match={match} onDelete={handleDeleteMatch} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}