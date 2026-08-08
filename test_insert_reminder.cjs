const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bxulvgkqilgfbotomopo.supabase.co';
const supabaseAnonKey = 'sb_publishable_anHKk1lXopPi98dJZhu6cQ_SDidjQSo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data, error } = await supabase.from('reminders').insert([{ text: 'Teste Script', time: '12:00', date: '2026-08-08', active: true }]).select().single();
  console.log("Insert Result:", data, "Error:", error);
}

testInsert();
