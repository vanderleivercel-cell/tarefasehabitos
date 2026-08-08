import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxulvgkqilgfbotomopo.supabase.co';
const supabaseAnonKey = 'sb_publishable_anHKk1lXopPi98dJZhu6cQ_SDidjQSo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
