import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qgchhfukuwbfrkhnqvbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_l4XB6bAGQQl1ZfUBHlUcjA_pM0W9N-0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
