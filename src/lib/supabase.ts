import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qzugzhyzzxdhzkakyiom.supabase.co';
const SUPABASE_KEY = 'sb_publishable_onTHwbiTvjbJfzgd_Z6-Gg_qA2BGvYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
