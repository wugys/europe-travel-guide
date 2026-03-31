const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbwibudbaqhxbuyjhouc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2lidWRiYXFoeGJ1eWpob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3Mjc4NCwiZXhwIjoyMDkwNTQ4Nzg0fQ.-Glmjn-wFRv72dHjqfw_V2PygeuxHF9wOHPYGL-H9VI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log('Success:', data);
}

const fs = require('fs');
const sql = fs.readFileSync(process.argv[2], 'utf8');
executeSQL(sql);
