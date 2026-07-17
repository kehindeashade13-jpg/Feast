const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment!");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Querying orders table metadata/columns...");
  const { data, error } = await supabase.from("orders").select("*").limit(1);
  if (error) {
    console.error("Error querying orders:", error);
  } else {
    console.log("Successfully fetched orders. Sample row:", data);
    if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
    } else {
      console.log("No rows in orders table. Let's try to query info from postgrest API directly.");
      // We can also query options or schema info
    }
  }
}

run();
