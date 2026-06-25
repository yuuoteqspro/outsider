import { Trash2 } from 'lucide-react';
import type { Match } from '../lib/supabase';

interface MatchCardProps {
  match: Match;
  onDelete: (id: string) => void;
}

export default function MatchCard({ match, onDelete }: MatchCardProps) {
  function handleDelete() {
    const pw = prompt('비밀번호를 입력하세요');
    if (pw === 'chan') {
      onDelete(match.id);
    } else if (pw !== null) {
      alert('비밀번호가 틀렸습니다');
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-2 py-2 flex items-center gap-1.5">
      <div className="flex-1 text-right min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">
          {match.player1?.name} · {match.player2?.name}
        </p>
      </div>
      <div className="shrink-0">
        <span className="text-sm font-bold text-gray-700">{match.score_us}:{match.score_them}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">
          {match.opponent1?.name} · {match.opponent2?.name}
        </p>
      </div>
      <button
        onClick={handleDelete}
        className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}