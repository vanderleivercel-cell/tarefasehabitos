const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bxulvgkqilgfbotomopo.supabase.co';
const supabaseAnonKey = 'sb_publishable_anHKk1lXopPi98dJZhu6cQ_SDidjQSo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching reminders...");
  const { data, error } = await supabase.from('reminders').select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Reminders:", data);
  }
}
test();
