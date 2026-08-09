const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bxulvgkqilgfbotomopo.supabase.co';
const supabaseAnonKey = 'sb_publishable_anHKk1lXopPi98dJZhu6cQ_SDidjQSo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log("Profiles:", data);
  console.log("Error:", error);
}
check();
