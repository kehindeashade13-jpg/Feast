import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Edit2, Trash2, Search, Filter, RefreshCw, LogOut, CheckCircle2,
  Database, AlertCircle, ShoppingBag, DollarSign, Package, Layers, Info, X,
  UploadCloud, Image
} from "lucide-react";
import { Product, AppConfig } from "../types";
import { SupabaseHelper } from "./SupabaseHelper";

interface ImagePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

function parsePrice(priceStr: any): number {
  if (typeof priceStr === "number") {
    return isNaN(priceStr) ? 0 : priceStr;
  }
  if (!priceStr) return 0;
  
  let clean = String(priceStr).trim();
  
  // Remove all common currency symbols: ₦, $, €, £, ¥, etc.
  clean = clean.replace(/[₦$€£¥]/g, "");
  
  // If there's a comma followed by 2 digits at the end (European decimal comma), e.g. "12,34" or "1.234,56"
  // let's convert it to standard decimal point.
  if (/,[0-9]{2}$/.test(clean)) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else {
    // Otherwise, assume comma is a thousands separator and remove it
    clean = clean.replace(/,/g, "");
  }
  
  // Remove any remaining whitespace
  clean = clean.replace(/\s/g, "");
  
  // Extract the first valid number sequence including decimal point
  const matched = clean.match(/-?[0-9.]+/);
  if (matched) {
    const num = Number(matched[0]);
    return isNaN(num) ? 0 : num;
  }
  
  return 0;
}

function ImagePicker({ value, onChange, label = "Product Image" }: ImagePickerProps) {
  const [mode, setMode] = useState<"upload" | "url">(value.startsWith("data:image") || !value ? "upload" : "url");
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WEBP etc.)");
      return;
    }
    // Limit to 2.5MB to keep Base64 strings reasonable
    if (file.size > 2.5 * 1024 * 1024) {
      setError("Image is too large. Must be smaller than 2.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 border border-neutral-200/60 bg-neutral-50/20 p-4 rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase font-sans">
          {label}
        </label>
        <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === "upload" 
                ? "bg-white text-neutral-900 shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Direct Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mode === "url" 
                ? "bg-white text-neutral-900 shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Preview panel */}
          <div className="sm:col-span-1 aspect-square bg-white border border-neutral-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
            {value ? (
              <>
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold"
                >
                  Remove
                </button>
              </>
            ) : (
              <div className="text-center p-2">
                <Image className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 font-medium">No Preview</span>
              </div>
            )}
          </div>

          {/* Upload / Drop Area */}
          <div className="sm:col-span-3">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[100px] ${
                isDragActive 
                  ? "border-neutral-900 bg-neutral-100/50 scale-[0.99]" 
                  : "border-neutral-200 hover:border-neutral-350 bg-white"
              }`}
              onClick={() => document.getElementById(`file-picker-${label.replace(/\s+/g, "-")}`)?.click()}
            >
              <UploadCloud className={`w-6 h-6 mb-2 transition-colors ${isDragActive ? "text-neutral-900" : "text-neutral-400"}`} />
              <p className="text-xs font-semibold text-neutral-700">
                {isDragActive ? "Drop the image here" : "Drag & drop your product image"}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                or click to browse local files (Max 2.5MB)
              </p>
              <input
                id={`file-picker-${label.replace(/\s+/g, "-")}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Preview panel */}
          <div className="sm:col-span-1 aspect-square bg-white border border-neutral-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
            {value ? (
              <>
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold"
                >
                  Clear URL
                </button>
              </>
            ) : (
              <div className="text-center p-2">
                <Image className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 font-medium">No Preview</span>
              </div>
            )}
          </div>

          <div className="sm:col-span-3">
            <input
              type="url"
              value={value.startsWith("data:image") ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
            />
            <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
              Paste an external photo web link (e.g., Unsplash, Imgur, Shopify CDN).
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-2 bg-rose-50/50 border border-rose-100 p-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"catalog" | "add" | "setup">("catalog");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isLocalStaticMode, setIsLocalStaticMode] = useState(false);
  
  // App Config (Supabase status)
  const [config, setConfig] = useState<AppConfig>({
    isSupabaseConfigured: false,
    supabaseUrl: null,
    adminEmail: "admin@example.com"
  });

  // Modal / Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Electronics",
    image_url: ""
  });

  const getLocalSeedProducts = (): Product[] => [
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
      description: "Handcrafted genuine full-grain leather journal with 200 cream-colored lined pages, perfect for writing and planning.",
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

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      let isLocalStatic = false;

      // 1. Fetch Config
      try {
        const configRes = await fetch("/api/config");
        const contentType = configRes.headers.get("content-type") || "";
        if (configRes.ok && contentType.includes("application/json")) {
          const configData = await configRes.json();
          setConfig(configData);
        } else {
          isLocalStatic = true;
        }
      } catch (err) {
        isLocalStatic = true;
      }

      // 2. Fetch Products
      let loadedProducts: Product[] = [];
      if (!isLocalStatic) {
        try {
          const productsRes = await fetch("/api/products");
          const contentType = productsRes.headers.get("content-type") || "";
          if (productsRes.ok && contentType.includes("application/json")) {
            const productsData = await productsRes.json();
            loadedProducts = productsData.products || [];
            
            if (productsData.isFallback && productsData.error) {
              setDbError(productsData.error);
              setIsFallback(true);
            } else {
              setIsFallback(false);
            }
          } else {
            isLocalStatic = true;
          }
        } catch (err) {
          isLocalStatic = true;
        }
      }

      // If we are running statically (no active JSON backend, e.g. on Vercel)
      if (isLocalStatic) {
        setIsLocalStaticMode(true);
        setIsFallback(true);
        setDbError("Running in client-side Static Mode. All product changes are saved securely to Local Storage.");
        
        const localProductsStr = localStorage.getItem("local_products");
        if (localProductsStr) {
          try {
            loadedProducts = JSON.parse(localProductsStr);
          } catch (e) {
            loadedProducts = getLocalSeedProducts();
          }
        } else {
          loadedProducts = getLocalSeedProducts();
          localStorage.setItem("local_products", JSON.stringify(loadedProducts));
        }
      } else {
        setIsLocalStaticMode(false);
      }

      setProducts(loadedProducts);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      showToast("Failed to fetch database products.", "error");
      setDbError(error.message || "Failed to sync databases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Categories list computed dynamically + defaults
  const categories = ["All", "Electronics", "Stationery", "Kitchen", "Lifestyle", "Furniture", "General"];

  // Filtered products list
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle Form Inputs for creation or editing
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open Edit Dialog
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "General",
      image_url: product.image_url || ""
    });
  };

  // Close Edit Dialog
  const handleCloseEdit = () => {
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "Electronics",
      image_url: ""
    });
  };

  // ADD PRODUCT
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast("Name and Price are required.", "error");
      return;
    }

    if (isLocalStaticMode) {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        price: parsePrice(formData.price),
        stock: Number(formData.stock) || 0,
        category: formData.category,
        image_url: formData.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
        created_at: new Date().toISOString()
      };
      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      localStorage.setItem("local_products", JSON.stringify(updatedProducts));
      showToast(`Product "${formData.name}" added successfully (Local)!`, "success");
      resetForm();
      setActiveTab("catalog");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parsePrice(formData.price),
          stock: Number(formData.stock) || 0,
          category: formData.category,
          image_url: formData.image_url
        })
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setProducts(prev => [data.product, ...prev]);
          showToast(`Product "${formData.name}" added successfully!`, "success");
          resetForm();
          setActiveTab("catalog"); // switch back to catalog
        } else {
          throw new Error(data.error || "Failed to add product.");
        }
      } else {
        throw new Error("Server did not return JSON. Trying switching to Static Mode.");
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // EDIT PRODUCT
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (isLocalStaticMode) {
      const updatedProducts = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            description: formData.description,
            price: parsePrice(formData.price),
            stock: Number(formData.stock) || 0,
            category: formData.category,
            image_url: formData.image_url
          };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem("local_products", JSON.stringify(updatedProducts));
      showToast(`Product updated successfully (Local)!`, "success");
      handleCloseEdit();
      return;
    }

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parsePrice(formData.price),
          stock: Number(formData.stock) || 0,
          category: formData.category,
          image_url: formData.image_url
        })
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
          showToast(`Product updated successfully!`, "success");
          handleCloseEdit();
        } else {
          throw new Error(data.error || "Failed to update product.");
        }
      } else {
        throw new Error("Server did not return JSON.");
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // DELETE PRODUCT
  const executeDelete = async () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;
    setProductToDelete(null); // Close confirmation modal

    if (isLocalStaticMode) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem("local_products", JSON.stringify(updatedProducts));
      showToast(`Product "${name}" deleted successfully (Local)!`, "info");
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setProducts(prev => prev.filter(p => p.id !== id));
          showToast(`Product "${name}" deleted successfully!`, "info");
        } else {
          throw new Error(data.error || "Failed to delete product.");
        }
      } else {
        throw new Error("Server did not return JSON.");
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-800 font-sans pb-16 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : toast.type === "error" 
                ? "bg-rose-50 border-rose-200 text-rose-800" 
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                E-commerce Admin Panel
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-neutral-500">
                  Account: <span className="font-medium text-neutral-700">{userEmail}</span>
                </span>
                <span className="text-neutral-300">•</span>
                
                {/* Supabase Status indicator */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${config.isSupabaseConfigured ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} />
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-neutral-500">
                    {config.isSupabaseConfigured ? "Supabase Active" : "Mock Mode (Local DB)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              title="Sync Database"
              className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-neutral-900" : ""}`} />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50/75 border border-rose-100 px-3 py-1.5 rounded-lg transition-colors font-medium ml-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Connection status callout banner */}
        {!config.isSupabaseConfigured && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-700 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">
                  Running on local JSON memory database
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
                  This demo allows you to test adding, editing, and deleting mock products instantly. To sync this admin dashboard with your live Supabase workspace database, navigate to the <strong>Supabase Setup Guide</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("setup")}
              className="text-xs bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 font-semibold px-4 py-2 rounded-xl transition shadow-sm shrink-0"
            >
              View Setup Instructions
            </button>
          </div>
        )}

        {/* Supabase Error Alert (e.g. table not found) */}
        {config.isSupabaseConfigured && dbError && (
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-pulse">
            <div className="flex gap-3">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-950 text-sm flex items-center gap-1.5">
                  Missing Supabase Database Schema
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
                  Your server is configured with Supabase credentials, but failed to find the <code className="bg-rose-100/50 px-1 py-0.5 rounded text-rose-800 font-semibold font-mono">products</code> table: <span className="italic text-neutral-700">"{dbError}"</span>. 
                  We have safely activated **local JSON memory fallback** so your dashboard remains fully functional. To fix this, click the button to the right to open the <strong>Supabase Setup Guide</strong> and execute the table schema SQL script.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("setup")}
              className="text-xs bg-rose-900 text-white hover:bg-rose-850 font-semibold px-4 py-2 rounded-xl transition shadow-sm shrink-0 cursor-pointer"
            >
              Setup products Table
            </button>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-neutral-200 mb-6 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === "catalog" ? "text-neutral-900 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Manage Products ({products.length})
            {activeTab === "catalog" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "add" ? "text-neutral-900 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Plus className="w-4 h-4" /> Add Product
            {activeTab === "add" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "setup" ? "text-emerald-700 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Supabase Setup Guide
            {activeTab === "setup" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        </div>

        {/* MAIN BODY CONTENTS */}
        <div className="transition-all duration-300">
          
          {/* TAB 1: PRODUCT CATALOG */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              
              {/* Filter Controls Bar */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, category, or description..."
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-250 focus:border-neutral-900 text-sm rounded-xl outline-none transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 text-xs font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                  <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Filters:
                  </div>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition shrink-0 ${
                        selectedCategory === cat
                          ? "bg-neutral-900 border-neutral-900 text-white font-medium shadow-sm"
                          : "bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Catalog Display */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900 mb-3" />
                  <span className="text-neutral-500 text-sm">Syncing inventory database...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl py-16 px-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">No products found</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || selectedCategory !== "All"
                      ? "No items match your active filter/search criteria. Try resetting filters."
                      : "Your store catalog is empty. Click the 'Add Product' tab above to publish your first product!"}
                  </p>
                  {(searchQuery || selectedCategory !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                      }}
                      className="mt-4 text-xs font-semibold text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-600"
                    >
                      Clear All Search Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={product.id}
                      className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative"
                    >
                      {/* Category Label Pill */}
                      <span className="absolute top-3 left-3 z-10 text-[10px] uppercase tracking-wider font-bold bg-white/90 backdrop-blur-sm text-neutral-800 px-2.5 py-1 rounded-full border border-neutral-100 shadow-sm">
                        {product.category || "General"}
                      </span>

                      {/* Image Frame */}
                      <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                          onError={(e) => {
                            // fallback image
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";
                          }}
                        />
                      </div>

                      {/* Content Frame */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-sans font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors text-base line-clamp-1">
                            {product.name}
                          </h3>
                          <span className="text-base font-bold text-neutral-950 shrink-0 font-sans">
                            ₦{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-4 flex-1 line-clamp-3">
                          {product.description || "No description provided for this product."}
                        </p>

                        <div className="border-t border-neutral-100 pt-4 flex items-center justify-between mt-auto text-xs text-neutral-500">
                          {/* Stock status indicator */}
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-neutral-400" />
                            <span>
                              Stock:{" "}
                              <span className={`font-semibold ${product.stock <= 5 ? "text-amber-600" : "text-neutral-800"}`}>
                                {product.stock} units
                              </span>
                            </span>
                            {product.stock <= 5 && (
                              <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Low
                              </span>
                            )}
                          </div>

                          {/* Action triggers */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD PRODUCT FORM */}
          {activeTab === "add" && (
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm max-w-2xl mx-auto overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold font-sans text-base">Add New Store Product</h2>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Speckled Ceramic Teacup"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Price (₦ / NGN) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 text-sm font-semibold pointer-events-none">
                        ₦
                      </span>
                      <input
                        type="text"
                        required
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="5000.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Initial Stock Level
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      placeholder="50"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Furniture">Furniture</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <ImagePicker
                      value={formData.image_url}
                      onChange={(val) => setFormData(prev => ({ ...prev, image_url: val }))}
                      label="Product Image (Upload File or paste Web URL)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Detail features, build materials, sizes, warranties etc."
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-150 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("catalog");
                    }}
                    className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition hover:bg-neutral-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Publish Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SETUP INSTRUCTIONS */}
          {activeTab === "setup" && (
            <div className="space-y-6">
              <SupabaseHelper />
            </div>
          )}

        </div>
      </main>

      {/* EDIT MODAL / DIALOG DRAWER */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEdit}
              className="absolute inset-0 bg-neutral-900"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-neutral-250 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              <div className="bg-neutral-950 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-bold font-sans text-base">Edit Product Block</h2>
                </div>
                <button
                  onClick={handleCloseEdit}
                  className="text-neutral-400 hover:text-white transition p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Price (₦ / NGN) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 text-sm font-semibold pointer-events-none">
                        ₦
                      </span>
                      <input
                        type="text"
                        required
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        className="w-full pl-7 pr-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Stock Level
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Furniture">Furniture</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <ImagePicker
                      value={formData.image_url}
                      onChange={(val) => setFormData(prev => ({ ...prev, image_url: val }))}
                      label="Product Image (Upload File or paste Web URL)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-600 tracking-wider uppercase mb-1.5 font-sans">
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-150 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition hover:bg-neutral-50 rounded-xl"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {productToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xl max-w-md w-full relative z-10 p-6"
            >
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 font-sans">Delete Product Inventory?</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed font-sans mb-6">
                Are you sure you want to delete <span className="font-semibold text-neutral-950">"{productToDelete.name}"</span>? 
                This action will remove the product permanently from your catalog. This cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer active:scale-[0.98]"
                >
                  Yes, Delete Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
