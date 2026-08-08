const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bxulvgkqilgfbotomopo.supabase.co';
const supabaseAnonKey = 'sb_publishable_anHKk1lXopPi98dJZhu6cQ_SDidjQSo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Checking categories:");
  const res1 = await supabase.from('categories').select('*');
  console.log(res1.data, res1.error);
  
  console.log("Trying to insert one:");
  const res2 = await supabase.from('categories').insert([{name: 'Saúde', color: 'text-rose-300 border-rose-300/20', icon: 'Heart'}]).select().single();
  console.log(res2.data, res2.error);
  
  const res3 = await supabase.from('categories').select('*');
  console.log(res3.data, res3.error);
}
test();
