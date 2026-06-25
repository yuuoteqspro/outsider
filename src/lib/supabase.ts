import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  name: string;
  created_at: string;
}

export interface Match {
  id: string;
  date: string;
  player1_id: string;
  player2_id: string;
  opponent1_id: string;
  opponent2_id: string;
  score_us: string;
  score_them: string;
  created_at: string;
  player1?: Player;
  player2?: Player;
  opponent1?: Player;
  opponent2?: Player;
}
