const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment!");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Attempting test insert into orders table (omitting id)...");
  
  const testOrder = {
    subtotal: 1000,
    total: 1000,
    customer_name: "Test User Omitted ID",
    customer_phone: "08066482553",
    payment_method: "Cash on Delivery"
  };

  const { data, error } = await supabase
    .from("orders")
    .insert([testOrder])
    .select();

  if (error) {
    console.log("Insertion error:", error);
  } else {
    console.log("Insertion succeeded! Row:", data);
    const generatedId = data[0].id;
    console.log("Generated ID:", generatedId);
    await supabase.from("orders").delete().eq("id", generatedId);
  }
}

run();
