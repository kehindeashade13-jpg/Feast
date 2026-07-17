const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment!");
  process.exit(1);
}

async function run() {
  try {
    const response = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const spec = await response.json();
    if (spec && spec.definitions) {
      console.log("Found definitions for tables:", Object.keys(spec.definitions));
      if (spec.definitions.orders) {
        console.log("--- ORDERS TABLE SCHEMA ---");
        console.log(JSON.stringify(spec.definitions.orders, null, 2));
      } else {
        console.log("No definition for 'orders' table found!");
      }
      if (spec.definitions.products) {
        console.log("--- PRODUCTS TABLE SCHEMA ---");
        console.log(JSON.stringify(spec.definitions.products, null, 2));
      }
    } else {
      console.log("Failed to load schema definitions:", spec);
    }
  } catch (err) {
    console.error("Error fetching OpenAPI schema:", err);
  }
}

run();
