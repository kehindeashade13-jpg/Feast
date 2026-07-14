import express from "express";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Configuration
function cleanEnvValue(value: string | undefined): string {
  if (!value) return "";
  let cleaned = value.trim();
  // Remove wrapping single/double quotes if present
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

const rawSupabaseUrl = cleanEnvValue(process.env.SUPABASE_URL);
const rawSupabaseAnonKey = cleanEnvValue(process.env.SUPABASE_ANON_KEY);

const placeholders = [
  "your-project-url",
  "your-supabase-url",
  "your_supabase_url",
  "your-project-anon-or-service-role-key",
  "your-supabase-anon-key",
  "your_supabase_anon_key",
  "my_supabase_url",
  "my_supabase_anon_key",
  "placeholder"
];

const isPlaceholderValue = (val: string) => {
  const v = val.toLowerCase();
  return placeholders.some(p => v.includes(p));
};

// Check if the anon key is a valid JWT (has 3 parts separated by dots)
const isValidJwt = (token: string) => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3;
};

const isSupabaseConfigured = Boolean(
  rawSupabaseUrl && 
  rawSupabaseAnonKey && 
  !isPlaceholderValue(rawSupabaseUrl) && 
  !isPlaceholderValue(rawSupabaseAnonKey) &&
  isValidJwt(rawSupabaseAnonKey)
);

let supabaseUrl = "";
let supabaseAnonKey = "";
let supabase: any = null;

if (isSupabaseConfigured) {
  supabaseUrl = rawSupabaseUrl;
  supabaseAnonKey = rawSupabaseAnonKey;
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully with valid keys.");
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.log("Supabase is not configured or configured with invalid keys/placeholders. Running in Local Mock Database mode.");
}

// Local Fallback Database Setup
const LOCAL_DB_PATH = path.join(process.cwd(), "data_products.json");

const SEED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Minimalist Mechanical Keyboard",
    description: "A tenkeyless layout mechanical keyboard with tactile brown switches, sturdy aluminum frame, and warm-white LED backlighting.",
    price: 150000.00,
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800",
    stock: 15,
    created_at: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Classic Leather Journal",
    description: "Handcrafted genuine full-grain leather journal with 200 cream-colored lined pages, perfect for writing, sketching, and daily planning.",
    price: 25000.00,
    category: "Stationery",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
    stock: 45,
    created_at: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Ceramic Pour-Over Coffee Dripper",
    description: "Artisanal speckled ceramic coffee dripper designed to hold temperature and brew the perfect balanced, flavorful cup of coffee.",
    price: 35000.00,
    category: "Kitchen",
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
    stock: 20,
    created_at: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "Matte Black Travel Tumbler",
    description: "Double-wall vacuum-insulated stainless steel travel mug that keeps your hot drinks hot for 12 hours and cold drinks cold for 24 hours.",
    price: 30000.00,
    category: "Lifestyle",
    image_url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800",
    stock: 60,
    created_at: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "Ergonomic High-Back Office Chair",
    description: "Premium desk chair featuring adjustable adaptive lumbar support, 3D multi-directional armrests, and breathable high-tension mesh back.",
    price: 240000.00,
    category: "Furniture",
    image_url: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=800",
    stock: 8,
    created_at: new Date().toISOString()
  }
];

function readLocalProducts() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(SEED_PRODUCTS, null, 2), "utf-8");
      return SEED_PRODUCTS;
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading local products:", error);
    return SEED_PRODUCTS;
  }
}

function writeLocalProducts(products: any[]) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing local products:", error);
  }
}

// API Routes

// Get configuration status
app.get("/api/config", (req, res) => {
  res.json({
    isSupabaseConfigured,
    supabaseUrl: isSupabaseConfigured ? supabaseUrl : null,
    adminEmail: process.env.ADMIN_EMAIL || "example@gmail.com"
  });
});

// Admin Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  // If Supabase is configured, authenticate against Supabase first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If Supabase authentication fails, fall back to admin env check just in case they are developing with a local account
        const fallbackEmail = process.env.ADMIN_EMAIL || "example@gmail.com";
        const fallbackPassword = process.env.ADMIN_PASSWORD || "password123";

        if (email === fallbackEmail && password === fallbackPassword) {
          return res.json({
            success: true,
            token: "demo-token-fallback",
            user: { email },
            notice: "Supabase auth failed, logged in using local admin fallback."
          });
        }
        return res.status(401).json({ success: false, error: error.message });
      }
      return res.json({
        success: true,
        token: data.session?.access_token,
        user: { email: data.user?.email }
      });
    } catch (err: any) {
      console.error("Supabase sign in error:", err);
      // Fallback
    }
  }

  // Fallback / Demo auth
  const adminEmail = process.env.ADMIN_EMAIL || "example@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "password123";

  if (email === adminEmail && password === adminPassword) {
    return res.json({
      success: true,
      token: "demo-token-12345",
      user: { email },
      notice: "Logged in via Mock Mode. Configure SUPABASE_URL & SUPABASE_ANON_KEY to use your live Supabase database."
    });
  } else {
    return res.status(401).json({
      success: false,
      error: `Invalid email or password. Default is: ${adminEmail} / ${adminPassword}`
    });
  }
});

// GET all products
app.get("/api/products", async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch failed, falling back to local database. Error:", error.message);
        const products = readLocalProducts();
        return res.json({ products, isFallback: true, error: error.message });
      }
      return res.json({ products: data, isFallback: false });
    } catch (err: any) {
      console.error("Supabase products fetch failed:", err);
      const products = readLocalProducts();
      return res.json({ products, isFallback: true, error: err.message });
    }
  } else {
    const products = readLocalProducts();
    return res.json({ products, isFallback: true });
  }
});

// POST - Add a product
app.post("/api/products", async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, error: "Product name and price are required." });
  }

  const newProduct = {
    name,
    description: description || "",
    price: Number(price),
    category: category || "General",
    image_url: image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    stock: stock !== undefined ? Number(stock) : 0,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select();

      if (error) {
        console.warn("Supabase insert failed, inserting locally. Error:", error.message);
        // Save locally as well
        const products = readLocalProducts();
        const localProduct = { ...newProduct, id: `prod-${Date.now()}` };
        products.unshift(localProduct);
        writeLocalProducts(products);
        return res.status(201).json({ success: true, product: localProduct, isFallback: true, error: error.message });
      }
      return res.status(201).json({ success: true, product: data[0], isFallback: false });
    } catch (err: any) {
      console.error("Supabase insert crash:", err);
      const products = readLocalProducts();
      const localProduct = { ...newProduct, id: `prod-${Date.now()}` };
      products.unshift(localProduct);
      writeLocalProducts(products);
      return res.status(201).json({ success: true, product: localProduct, isFallback: true, error: err.message });
    }
  } else {
    const products = readLocalProducts();
    const localProduct = { ...newProduct, id: `prod-${Date.now()}` };
    products.unshift(localProduct);
    writeLocalProducts(products);
    return res.status(201).json({ success: true, product: localProduct, isFallback: true });
  }
});

// PUT - Update a product
app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url, stock } = req.body;

  const updateFields: any = {};
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (price !== undefined) updateFields.price = Number(price);
  if (category !== undefined) updateFields.category = category;
  if (image_url !== undefined) updateFields.image_url = image_url;
  if (stock !== undefined) updateFields.stock = Number(stock);

  if (isSupabaseConfigured && supabase) {
    try {
      // Check if it's a local uuid or an integer ID
      const isLocalId = id.startsWith("prod-");
      if (isLocalId) {
        // If it was created locally, we update locally
        const products = readLocalProducts();
        const idx = products.findIndex((p: any) => p.id === id);
        if (idx !== -1) {
          products[idx] = { ...products[idx], ...updateFields };
          writeLocalProducts(products);
          return res.json({ success: true, product: products[idx], isFallback: true });
        }
      }

      const { data, error } = await supabase
        .from("products")
        .update(updateFields)
        .eq("id", id)
        .select();

      if (error) {
        console.warn("Supabase update failed, updating locally. Error:", error.message);
        const products = readLocalProducts();
        const idx = products.findIndex((p: any) => p.id === id);
        if (idx !== -1) {
          products[idx] = { ...products[idx], ...updateFields };
          writeLocalProducts(products);
          return res.json({ success: true, product: products[idx], isFallback: true, error: error.message });
        }
        return res.status(404).json({ success: false, error: "Product not found locally or on Supabase." });
      }

      if (!data || data.length === 0) {
        // Fallback to local
        const products = readLocalProducts();
        const idx = products.findIndex((p: any) => p.id === id);
        if (idx !== -1) {
          products[idx] = { ...products[idx], ...updateFields };
          writeLocalProducts(products);
          return res.json({ success: true, product: products[idx], isFallback: true });
        }
        return res.status(404).json({ success: false, error: "Product not found." });
      }

      return res.json({ success: true, product: data[0], isFallback: false });
    } catch (err: any) {
      console.error("Supabase update crash:", err);
      const products = readLocalProducts();
      const idx = products.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updateFields };
        writeLocalProducts(products);
        return res.json({ success: true, product: products[idx], isFallback: true, error: err.message });
      }
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const products = readLocalProducts();
    const idx = products.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updateFields };
      writeLocalProducts(products);
      return res.json({ success: true, product: products[idx], isFallback: true });
    }
    return res.status(404).json({ success: false, error: "Product not found." });
  }
});

// DELETE - Delete a product
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabase) {
    try {
      const isLocalId = id.startsWith("prod-");
      if (isLocalId) {
        const products = readLocalProducts();
        const filtered = products.filter((p: any) => p.id !== id);
        writeLocalProducts(filtered);
        return res.json({ success: true, deletedId: id, isFallback: true });
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        console.warn("Supabase delete failed, trying to delete locally. Error:", error.message);
        const products = readLocalProducts();
        const filtered = products.filter((p: any) => p.id !== id);
        writeLocalProducts(filtered);
        return res.json({ success: true, deletedId: id, isFallback: true, error: error.message });
      }
      return res.json({ success: true, deletedId: id, isFallback: false });
    } catch (err: any) {
      console.error("Supabase delete crash:", err);
      const products = readLocalProducts();
      const filtered = products.filter((p: any) => p.id !== id);
      writeLocalProducts(filtered);
      return res.json({ success: true, deletedId: id, isFallback: true, error: err.message });
    }
  } else {
    const products = readLocalProducts();
    const filtered = products.filter((p: any) => p.id !== id);
    writeLocalProducts(filtered);
    return res.json({ success: true, deletedId: id, isFallback: true });
  }
});

// Main Setup (Express + Vite)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
