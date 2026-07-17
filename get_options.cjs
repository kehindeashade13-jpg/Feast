const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment!");
  process.exit(1);
}

async function run() {
  try {
    const response = await fetch(`${url}/rest/v1/orders`, {
      method: "OPTIONS",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    
    // Read the headers and check if there are columns or schema returned
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response text length:", text.length);
    try {
      const parsed = JSON.parse(text);
      console.log("Parsed OPTIONS response:");
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log("Could not parse as JSON. Raw text preview:", text.substring(0, 1000));
    }
  } catch (err) {
    console.error("Error making OPTIONS request:", err);
  }
}

run();
