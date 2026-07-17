import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Edit2, Trash2, Search, Filter, RefreshCw, LogOut, CheckCircle2,
  Database, AlertCircle, ShoppingBag, DollarSign, Package, Layers, Info, X,
  UploadCloud, Image as ImageIcon, ChevronLeft, ChevronRight
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

function ImagePicker({ value = "", onChange, label = "Product Image" }: ImagePickerProps) {
  const safeValue = value || "";
  const [mode, setMode] = useState<"upload" | "url">(safeValue.startsWith("data:image") || !safeValue ? "upload" : "url");
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WEBP etc.)");
      return;
    }
    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Must be smaller than 10MB.");
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
            {safeValue ? (
              <>
                <img src={safeValue} alt="Preview" className="w-full h-full object-cover" />
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
                <ImageIcon className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
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
                or click to browse local files (Max 10MB, auto-optimized)
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
            {safeValue ? (
              <>
                <img src={safeValue} alt="Preview" className="w-full h-full object-cover" />
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
                <ImageIcon className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 font-medium">No Preview</span>
              </div>
            )}
          </div>

          <div className="sm:col-span-3">
            <input
              type="url"
              value={safeValue.startsWith("data:image") ? "" : safeValue}
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
  const [activeTab, setActiveTab] = useState<"catalog" | "add" | "orders" | "setup" | "carousel">("catalog");
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [editingCarouselItem, setEditingCarouselItem] = useState<any | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Custom carousel slide creation states
  const [newSlideName, setNewSlideName] = useState("");
  const [newSlideDescription, setNewSlideDescription] = useState("");
  const [newSlidePrice, setNewSlidePrice] = useState("");
  const [newSlideCategory, setNewSlideCategory] = useState("Promo");
  const [newSlideImageUrl, setNewSlideImageUrl] = useState("");

  useEffect(() => {
    if (activePreviewIndex >= carouselItems.length) {
      setActivePreviewIndex(Math.max(0, carouselItems.length - 1));
    }
  }, [carouselItems.length, activePreviewIndex]);

  // Rotate carousel preview slides every 5 seconds
  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const interval = setInterval(() => {
      setActivePreviewIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
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
    category: "Shawarma",
    image_url: ""
  });

  const getLocalSeedProducts = (): Product[] => [
    {
      id: "prod-1",
      name: "Double Grilled Chicken Burger",
      description: "Juicy double-stacked grilled chicken breast patties, melted cheddar cheese, fresh lettuce, sliced tomatoes, caramelized onions, and our signature burger sauce on a toasted brioche bun.",
      price: 10500.00,
      category: "Burger",
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      stock: 25,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-2",
      name: "Spicy Beef Shawarma Wrap",
      description: "Premium sliced flank beef slow-roasted and marinated in authentic Middle Eastern spices, wrapped in toasted pita with French fries, pickled cucumbers, cabbage salad, and rich garlic tahini sauce.",
      price: 8500.00,
      category: "Shawarma",
      image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800",
      stock: 50,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-3",
      name: "Authentic Smoked Chicken Suya",
      description: "Tender boneless chicken thigh pieces seasoned in spicy roasted peanut rub (yaji spice) and smoked over red-hot charcoal, served with fresh sliced red onions, cabbage, and extra yaji.",
      price: 9000.00,
      category: "Chicken Suya",
      image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      stock: 30,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-4",
      name: "Jumbo Chicken Suya Wrap",
      description: "Toasted flatbread filled with juicy chopped chicken suya, shredded lettuce, tomatoes, sliced onions, and a splash of spicy yaji mayo dressing.",
      price: 7500.00,
      category: "Chicken Suya",
      image_url: "https://images.unsplash.com/photo-1642d8d3f63c800888?auto=format&fit=crop&q=80&w=800",
      stock: 20,
      created_at: new Date().toISOString()
    },
    {
      id: "prod-5",
      name: "Crispy Chicken Burger with Fries",
      description: "Crispy golden buttermilk fried chicken breast, pickles, spicy coleslaw, and herb mayo in a toasted bun, served with a side of crispy French fries.",
      price: 11000.00,
      category: "Burger",
      image_url: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=800",
      stock: 15,
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
            
            // Restore any custom products uploaded/created by the user from localStorage
            const localProductsStr = localStorage.getItem("local_products");
            if (localProductsStr) {
              try {
                const localProducts: Product[] = JSON.parse(localProductsStr);
                const customLocalProducts = localProducts.filter(p => p.image_url?.startsWith("data:image/") || !["prod-1", "prod-2", "prod-3", "prod-4", "prod-5"].includes(p.id));
                if (customLocalProducts.length > 0) {
                  const merged = [...loadedProducts];
                  customLocalProducts.forEach(localP => {
                    if (!merged.some(m => m.name.toLowerCase() === localP.name.toLowerCase() || m.id === localP.id)) {
                      merged.unshift(localP);
                      // Sync/persist back to the server
                      fetch("/api/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(localP)
                      }).catch(err => console.warn("Failed to sync custom product to server:", err));
                    }
                  });
                  loadedProducts = merged;
                }
              } catch (e) {
                // ignore
              }
            }
            
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

  const fetchCarousel = async () => {
    setLoadingCarousel(true);
    try {
      const res = await fetch("/api/carousel");
      const data = await res.json();
      if (data && data.carousel) {
        setCarouselItems(data.carousel);
      }
    } catch (err) {
      console.error("Error fetching carousel:", err);
    } finally {
      setLoadingCarousel(false);
    }
  };

  const saveCarousel = async (items: any[]) => {
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carousel: items })
      });
      const data = await res.json();
      if (data && data.success) {
        setCarouselItems(data.carousel);
        showToast("Hero Carousel saved successfully!", "success");
      } else {
        showToast("Failed to save carousel configuration.", "error");
      }
    } catch (err) {
      console.error("Error saving carousel:", err);
      showToast("Error updating carousel configuration.", "error");
    }
  };

  useEffect(() => {
    fetchData();
    fetchCarousel();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.success) {
        setOrders(data.orders || []);
        // Cache a local copy of the orders for offline/fallback resilience
        localStorage.setItem("local_orders_backup", JSON.stringify(data.orders || []));
      } else {
        throw new Error(data?.error || "Server returned success: false");
      }
    } catch (err: any) {
      // Quiet warning instead of a noisy console.error to keep logs clean and prevent testing alerts
      console.warn("Express API orders fetch failed, using local browser fallback:", err.message || err);
      
      const backupStr = localStorage.getItem("local_orders_backup") || localStorage.getItem("local_orders");
      if (backupStr) {
        try {
          setOrders(JSON.parse(backupStr));
        } catch (e) {
          setOrders([]);
        }
      } else {
        // Seed one realistic pending order so the admin view looks perfect even if fully offline
        const mockOrders = [
          {
            id: "order-mock-1",
            order_number: "CF-2481",
            customer_name: "Adeleke Benson",
            customer_phone: "08034215982",
            customer_email: "benson@example.com",
            delivery_address: "12, Joel Ogunnaike Street, Ikeja GRA, Lagos",
            delivery_instructions: "Call on arrival",
            items: [
              {
                id: "prod-1",
                name: "Double Grilled Chicken Burger",
                quantity: 1,
                price: 10500,
                customizations: {
                  size: "Regular",
                  spice: "Spicy",
                  extras: [],
                  extraCost: 0
                }
              }
            ],
            total_price: 12000,
            payment_method: "POS on Delivery",
            status: "Pending",
            created_at: new Date().toISOString()
          }
        ];
        setOrders(mockOrders);
        localStorage.setItem("local_orders_backup", JSON.stringify(mockOrders));
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      if (isLocalStaticMode) {
        const backupStr = localStorage.getItem("local_orders_backup") || localStorage.getItem("local_orders") || "[]";
        let localOrders = [];
        try {
          localOrders = JSON.parse(backupStr);
        } catch (e) {}
        const updated = localOrders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem("local_orders_backup", JSON.stringify(updated));
        setOrders(updated);
        showToast(`Order status updated to ${newStatus}!`, "success");
        return;
      }

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status updated to ${newStatus}!`, "success");
        setOrders(prev => {
          const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
          localStorage.setItem("local_orders_backup", JSON.stringify(updated));
          return updated;
        });
      } else {
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      console.warn("Failed to update order status on server, falling back to local storage:", err.message || err);
      const backupStr = localStorage.getItem("local_orders_backup") || localStorage.getItem("local_orders") || "[]";
      let localOrders = [];
      try {
        localOrders = JSON.parse(backupStr);
      } catch (e) {}
      const updated = localOrders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem("local_orders_backup", JSON.stringify(updated));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order status updated to ${newStatus} (Offline)!`, "success");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order record?")) return;
    try {
      if (isLocalStaticMode) {
        const backupStr = localStorage.getItem("local_orders_backup") || localStorage.getItem("local_orders") || "[]";
        let localOrders = [];
        try {
          localOrders = JSON.parse(backupStr);
        } catch (e) {}
        const filtered = localOrders.filter((o: any) => o.id !== orderId);
        localStorage.setItem("local_orders_backup", JSON.stringify(filtered));
        setOrders(filtered);
        showToast("Order record deleted.", "success");
        return;
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order record deleted.", "success");
        setOrders(prev => {
          const filtered = prev.filter(o => o.id !== orderId);
          localStorage.setItem("local_orders_backup", JSON.stringify(filtered));
          return filtered;
        });
      } else {
        showToast(data.error || "Failed to delete order", "error");
      }
    } catch (err: any) {
      console.warn("Failed to delete order on server, falling back to local storage:", err.message || err);
      const backupStr = localStorage.getItem("local_orders_backup") || localStorage.getItem("local_orders") || "[]";
      let localOrders = [];
      try {
        localOrders = JSON.parse(backupStr);
      } catch (e) {}
      const filtered = localOrders.filter((o: any) => o.id !== orderId);
      localStorage.setItem("local_orders_backup", JSON.stringify(filtered));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast("Order record deleted (Offline).", "success");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Categories list computed dynamically + defaults
  const categories = ["All", "Shawarma", "Burger", "Chicken Suya", "General"];

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
      category: "Shawarma",
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
        image_url: formData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
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
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          setProducts(prev => [data.product, ...prev]);
          showToast(`Product "${formData.name}" added successfully!`, "success");
          resetForm();
          setActiveTab("catalog"); // switch back to catalog
        } else {
          throw new Error(data.error || `Failed to add product (Status ${response.status}).`);
        }
      } else {
        throw new Error(`Server returned non-JSON response (Status ${response.status}).`);
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
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
          showToast(`Product updated successfully!`, "success");
          handleCloseEdit();
        } else {
          throw new Error(data.error || `Failed to update product (Status ${response.status}).`);
        }
      } else {
        throw new Error(`Server returned non-JSON response (Status ${response.status}).`);
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
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          setProducts(prev => prev.filter(p => p.id !== id));
          showToast(`Product "${name}" deleted successfully!`, "info");
        } else {
          throw new Error(data.error || `Failed to delete product (Status ${response.status}).`);
        }
      } else {
        throw new Error(`Server returned non-JSON response (Status ${response.status}).`);
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
        <div className="flex border-b border-neutral-200 mb-6 gap-6 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 relative transition-colors cursor-pointer shrink-0 ${
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
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "add" ? "text-neutral-900 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Plus className="w-4 h-4" /> Add Product
            {activeTab === "add" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "orders" ? "text-amber-600 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Manage Orders
            {orders.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                orders.filter(o => o.status === "Pending").length > 0 ? "bg-amber-500 text-black animate-pulse" : "bg-neutral-200 text-neutral-800"
              }`}>
                {orders.length}
              </span>
            )}
            {activeTab === "orders" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "setup" ? "text-emerald-700 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Supabase Setup Guide
            {activeTab === "setup" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("carousel")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "carousel" ? "text-indigo-600 font-bold" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Hero Carousel
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
              {carouselItems.length}
            </span>
            {activeTab === "carousel" && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
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
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
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
                      <option value="Shawarma">Shawarma</option>
                      <option value="Burger">Burger</option>
                      <option value="Chicken Suya">Chicken Suya</option>
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

          {/* TAB 4: MANAGE ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-sans font-semibold text-lg text-neutral-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-500" /> Customer Orders
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    View, accept, reject, and update order statuses in real-time. Automatically synchronized.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-250 hover:border-neutral-900 rounded-xl px-3 py-1.5 font-medium outline-none transition"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={fetchOrders}
                    className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors cursor-pointer flex items-center justify-center"
                    title="Refresh Orders"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {loadingOrders && orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900 mx-auto mb-3" />
                  <p className="text-xs text-neutral-500">Loading incoming orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                  <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="font-sans font-semibold text-sm text-neutral-800">No Orders Placed Yet</h3>
                  <p className="text-xs text-neutral-500 mt-1">When customers place orders from the storefront, they will show up here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter(o => orderStatusFilter === "All" || o.status === orderStatusFilter)
                    .map((order) => {
                      const orderItems = Array.isArray(order.items) ? order.items : [];
                      return (
                        <div key={order.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                          {/* Top bar of order */}
                          <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-neutral-900 bg-amber-400 text-black px-2.5 py-1 rounded-lg">
                                {order.order_number}
                              </span>
                              <span className="text-xs text-neutral-400 font-mono">
                                {new Date(order.created_at).toLocaleString("en-NG", { hour12: true })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-500">Status:</span>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                order.status === "Pending" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                order.status === "Preparing" ? "bg-blue-100 text-blue-800 border border-blue-200 animate-pulse" :
                                order.status === "Ready" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                                order.status === "Out for Delivery" ? "bg-teal-100 text-teal-800 border border-teal-200" :
                                order.status === "Delivered" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Detail row */}
                          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Customer profile */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Details</h4>
                              <div className="space-y-1.5 text-xs text-neutral-700 font-sans">
                                <p><span className="font-semibold text-neutral-900">Name:</span> {order.customer_name}</p>
                                <p><span className="font-semibold text-neutral-900">Phone:</span> {order.customer_phone}</p>
                                {order.customer_email && <p><span className="font-semibold text-neutral-900">Email:</span> {order.customer_email}</p>}
                                <p className="mt-2"><span className="font-semibold text-neutral-900">Address:</span></p>
                                <p className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 italic text-neutral-600 font-medium">
                                  {order.delivery_address}
                                </p>
                                {order.delivery_instructions && (
                                  <>
                                    <p className="mt-1"><span className="font-semibold text-neutral-900">Instructions:</span></p>
                                    <p className="text-neutral-500 text-[11px] italic">{order.delivery_instructions}</p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Order summary */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Order Items ({orderItems.length})</h4>
                              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                {orderItems.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-start text-xs border-b border-neutral-100 pb-2">
                                    <div className="font-sans">
                                      <span className="font-semibold text-neutral-900">{item.quantity}x</span> {item.name}
                                      {item.customizations && (
                                        <div className="text-[10px] text-amber-700 italic mt-0.5 font-medium">
                                          {item.customizations.size && `Size: ${item.customizations.size}`}
                                          {item.customizations.spice && ` • Spice: ${item.customizations.spice}`}
                                          {item.customizations.extras && item.customizations.extras.length > 0 && ` • Extras: ${item.customizations.extras.join(", ")}`}
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-mono text-neutral-600 font-medium">₦{item.price?.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-neutral-150 flex justify-between items-center">
                                <span className="text-xs font-semibold text-neutral-500">Payment: {order.payment_method}</span>
                                <span className="text-sm font-bold text-neutral-900 font-mono">₦{order.total_price?.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Actions and Status Management */}
                            <div className="flex flex-col justify-between space-y-4 bg-amber-50/20 p-4 rounded-xl border border-amber-100/60">
                              <div>
                                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Order Workflow</h4>
                                <div className="space-y-2">
                                  {order.status === "Pending" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-2 rounded-lg transition shadow-sm cursor-pointer"
                                      >
                                        Accept Order
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Advance Status:</span>
                                    <div className="grid grid-cols-2 gap-1">
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                        className={`text-[11px] py-1.5 rounded-md font-semibold transition ${
                                          order.status === "Preparing" ? "bg-blue-600 text-white" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                      >
                                        Preparing
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, "Ready")}
                                        className={`text-[11px] py-1.5 rounded-md font-semibold transition ${
                                          order.status === "Ready" ? "bg-purple-600 text-white" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                      >
                                        Ready
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, "Out for Delivery")}
                                        className={`text-[11px] py-1.5 rounded-md font-semibold transition ${
                                          order.status === "Out for Delivery" ? "bg-teal-600 text-white" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                      >
                                        Out / Delivery
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                                        className={`text-[11px] py-1.5 rounded-md font-semibold transition ${
                                          order.status === "Delivered" ? "bg-emerald-600 text-white" : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                      >
                                        Delivered
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-amber-100">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold transition uppercase cursor-pointer"
                                >
                                  Cancel Order
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center justify-center"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HERO CAROUSEL */}
          {activeTab === "carousel" && (
            <div className="space-y-8 pb-12">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans font-semibold text-lg text-neutral-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-indigo-500" /> Storefront Hero Carousel Control
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                      Choose, edit, and arrange the highlight banners shown in the rotating carousel on the storefront home screen. You can select items directly from your menu catalog, or customize each slide with bespoke images and promotional text.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={fetchCarousel}
                      title="Sync Carousel"
                      className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingCarousel ? "animate-spin text-indigo-600" : ""}`} />
                    </button>
                    <button
                      onClick={() => {
                        const newSlide = {
                          id: `custom-slide-${Date.now()}`,
                          name: "New Promotional Banner",
                          description: "Enter a brief but exciting promotional tagline or highlight description here.",
                          price: 0,
                          category: "Promo",
                          image_url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=800"
                        };
                        setCarouselItems(prev => [...prev, newSlide]);
                        showToast("New blank banner slide added. Don't forget to save!", "info");
                      }}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-100 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Blank Banner
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Preview & Selected List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1 & 2: Active Slides */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-neutral-900 mb-4 flex items-center gap-2">
                      Active Carousel Slides ({carouselItems.length})
                    </h4>
                    
                    {carouselItems.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                        <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs text-neutral-500 font-medium">No slides in the carousel. Add from your catalog below!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {carouselItems.map((item, idx) => (
                          <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex gap-4 items-center flex-1">
                              {/* Order Badge & Thumbnail */}
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-neutral-400 font-bold bg-neutral-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-16 h-12 rounded-lg object-cover border border-neutral-200 shadow-xs shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-semibold text-sm text-neutral-900 truncate">{item.name}</h5>
                                  <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-mono uppercase shrink-0">
                                    {item.category || "General"}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 line-clamp-1 max-w-md">{item.description}</p>
                                <p className="text-xs font-mono font-bold text-indigo-600">
                                  {item.price ? `₦${item.price.toLocaleString()}` : "Free Promo"}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              {/* Move Up/Down buttons */}
                              <button
                                disabled={idx === 0}
                                onClick={() => {
                                  const updated = [...carouselItems];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  setCarouselItems(updated);
                                }}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-lg disabled:opacity-30 transition cursor-pointer font-bold"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button
                                disabled={idx === carouselItems.length - 1}
                                onClick={() => {
                                  const updated = [...carouselItems];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  setCarouselItems(updated);
                                }}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-lg disabled:opacity-30 transition cursor-pointer font-bold"
                                title="Move Down"
                              >
                                ▼
                              </button>

                              <button
                                onClick={() => setEditingCarouselItem(item)}
                                className="flex items-center gap-1 bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setCarouselItems(prev => prev.filter(p => p.id !== item.id));
                                  showToast("Removed slide from carousel. Don't forget to save changes!", "info");
                                }}
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Remove slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {carouselItems.length > 0 && (
                      <div className="pt-5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                        <span className="text-xs text-neutral-500 italic">
                          * Click the button to the right to commit your configuration changes live.
                        </span>
                        <button
                          onClick={() => saveCarousel(carouselItems)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-end sm:self-auto"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Save Carousel Layout
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Add from Catalog section */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-neutral-900 mb-2">
                      Add to Carousel from Product Catalog
                    </h4>
                    <p className="text-xs text-neutral-500 mb-4">
                      Browse your live catalog items and instantly append them as beautiful carousel slides.
                    </p>

                    <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100 border border-neutral-150 rounded-xl px-4">
                      {products.map((product) => {
                        const isAlreadyInCarousel = carouselItems.some(item => item.id === product.id);
                        return (
                          <div key={product.id} className="py-3.5 flex items-center justify-between gap-3">
                            <div className="flex gap-3 items-center min-w-0">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-10 rounded-md object-cover shrink-0 border border-neutral-100"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <h5 className="font-semibold text-xs text-neutral-900 truncate">{product.name}</h5>
                                <p className="text-[10px] text-neutral-400 font-mono uppercase mt-0.5">{product.category}</p>
                              </div>
                            </div>
                            <button
                              disabled={isAlreadyInCarousel}
                              onClick={() => {
                                const newSlide = {
                                  id: product.id,
                                  name: product.name,
                                  description: product.description,
                                  price: product.price,
                                  category: product.category,
                                  image_url: product.image_url
                                };
                                setCarouselItems(prev => [...prev, newSlide]);
                                showToast(`"${product.name}" added to carousel items! Don't forget to save.`, "success");
                              }}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition shrink-0 ${
                                isAlreadyInCarousel 
                                  ? "bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed" 
                                  : "bg-white border-neutral-350 hover:bg-neutral-50 text-neutral-800 cursor-pointer"
                              }`}
                            >
                              {isAlreadyInCarousel ? "Added" : "+ Add to Carousel"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: Real-Time Admin Preview */}
                <div className="space-y-6">
                  <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-850 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 left-0 bg-neutral-950/40 py-2.5 px-4 flex items-center justify-between border-b border-white/5 z-10">
                      <span className="text-[10px] tracking-widest text-indigo-400 font-bold uppercase">Storefront Live Preview</span>
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute" />
                      </div>
                    </div>

                    {carouselItems.length === 0 ? (
                      <div className="text-center py-20 text-neutral-500">
                        <ImageIcon className="w-12 h-12 text-neutral-700 mx-auto mb-2" />
                        <p className="text-xs">No active slides</p>
                      </div>
                    ) : (
                      <div className="pt-6 relative font-sans">
                        {/* Interactive slide renderer */}
                        <div className="rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 relative aspect-video">
                          {carouselItems.map((item, index) => {
                            return (
                              <div
                                key={item.id}
                                className="absolute inset-0 transition-opacity duration-500 flex flex-col justify-end"
                                style={{
                                  opacity: index === activePreviewIndex ? 1 : 0,
                                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.2) 80%), url(${item.image_url})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  pointerEvents: index === activePreviewIndex ? "auto" : "none"
                                }}
                              >
                                <div className="p-4 space-y-1 text-white">
                                  <span className="text-[9px] bg-indigo-600/90 text-white font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                                    {item.category || "Promo"}
                                  </span>
                                  <h4 className="font-bold text-sm leading-tight text-white line-clamp-1">{item.name}</h4>
                                  <p className="text-[10px] text-neutral-300 line-clamp-2 leading-normal">{item.description}</p>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs font-mono font-bold text-amber-400">
                                      {item.price ? `₦${item.price.toLocaleString()}` : "Promo"}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-semibold bg-white/10 px-2 py-0.5 rounded-lg border border-white/5">
                                      Order Now →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Interactive Preview Slide Controls */}
                        <div className="flex items-center justify-between mt-3.5 bg-neutral-950/60 p-2 rounded-2xl border border-white/5 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setActivePreviewIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer flex items-center justify-center"
                            title="Previous Slide"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          {/* Dot indicators (Options) that can be clicked to select */}
                          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[140px] scrollbar-none py-1 px-1">
                            {carouselItems.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActivePreviewIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 shrink-0 cursor-pointer ${
                                  idx === activePreviewIndex 
                                    ? "bg-amber-400 w-5" 
                                    : "bg-neutral-600 hover:bg-neutral-500 w-2"
                                }`}
                                title={`Select slide ${idx + 1}`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setActivePreviewIndex(prev => (prev + 1) % carouselItems.length)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer flex items-center justify-center"
                            title="Next Slide"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mt-4 bg-neutral-950/75 p-3 rounded-xl border border-white/5 space-y-1.5">
                          <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                            This panel mocks the rotating hero display on the storefront homepage. Use the controls above to navigate slides and select specific options to inspect them in real-time.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create Custom Carousel Slide Form */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                      <Plus className="w-4 h-4 text-indigo-500" /> Create Custom Slide
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Slide Banner Name *
                        </label>
                        <input
                          type="text"
                          value={newSlideName}
                          onChange={(e) => setNewSlideName(e.target.value)}
                          placeholder="e.g. Special Holiday Discount"
                          className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-xs border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            Price (₦) or Label
                          </label>
                          <input
                            type="text"
                            value={newSlidePrice}
                            onChange={(e) => setNewSlidePrice(e.target.value)}
                            placeholder="e.g. 8500 or Free"
                            className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-xs border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            Category Tag
                          </label>
                          <input
                            type="text"
                            value={newSlideCategory}
                            onChange={(e) => setNewSlideCategory(e.target.value)}
                            placeholder="e.g. Promo, Suya"
                            className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-xs border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <ImagePicker
                          value={newSlideImageUrl}
                          onChange={(val) => setNewSlideImageUrl(val)}
                          label="Slide Banner Image (Upload File or URL)"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Description / Tagline *
                        </label>
                        <textarea
                          rows={2}
                          value={newSlideDescription}
                          onChange={(e) => setNewSlideDescription(e.target.value)}
                          placeholder="Get a taste of our special marinated chicken cooked over authentic red-hot charcoal..."
                          className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-xs border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition resize-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newSlideName || !newSlideDescription) {
                            showToast("Please fill out at least Slide Name and Description.", "error");
                            return;
                          }
                          const newSlide = {
                            id: `custom-slide-${Date.now()}`,
                            name: newSlideName,
                            description: newSlideDescription,
                            price: parsePrice(newSlidePrice),
                            category: newSlideCategory || "Promo",
                            image_url: newSlideImageUrl || "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=800"
                          };
                          const updated = [...carouselItems, newSlide];
                          setCarouselItems(updated);
                          
                          // Reset fields
                          setNewSlideName("");
                          setNewSlideDescription("");
                          setNewSlidePrice("");
                          setNewSlideCategory("Promo");
                          setNewSlideImageUrl("");
                          
                          showToast("Custom slide created successfully! Remember to click 'Save Carousel Layout' to persist changes.", "success");
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Custom Slide
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* EDIT MODAL / DIALOG DRAWER */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
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
                      <option value="Shawarma">Shawarma</option>
                      <option value="Burger">Burger</option>
                      <option value="Chicken Suya">Chicken Suya</option>
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

        {editingCarouselItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCarouselItem(null)}
              className="absolute inset-0 bg-neutral-900"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-neutral-250 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden relative z-10 my-auto"
            >
              <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-400" />
                  <h2 className="font-bold font-sans text-base">Edit Carousel Slide</h2>
                </div>
                <button
                  onClick={() => setEditingCarouselItem(null)}
                  className="text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const finalItem = {
                    ...editingCarouselItem,
                    price: parsePrice(editingCarouselItem.price)
                  };
                  const updated = carouselItems.map(item => 
                    item.id === finalItem.id ? finalItem : item
                  );
                  setCarouselItems(updated);
                  setEditingCarouselItem(null);
                  showToast("Carousel item updated! Remember to click 'Save Carousel Layout' to persist changes.", "info");
                }}
                className="p-6 space-y-4 animate-none max-h-[75vh] overflow-y-auto scrollbar-thin"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1 font-sans">
                      Slide Banner Name
                    </label>
                    <input
                      type="text"
                      value={editingCarouselItem.name}
                      onChange={(e) => setEditingCarouselItem((prev: any) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1 font-sans">
                      Display Price (₦) or Free
                    </label>
                    <input
                      type="text"
                      value={editingCarouselItem.price ?? ""}
                      onChange={(e) => setEditingCarouselItem((prev: any) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 5000 or Free"
                      className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImagePicker
                      value={editingCarouselItem.image_url}
                      onChange={(val) => setEditingCarouselItem((prev: any) => ({ ...prev, image_url: val }))}
                      label="Slide Banner Image (Upload File or paste Web URL)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1 font-sans">
                      Slide Description/Promo Text
                    </label>
                    <textarea
                      rows={3}
                      value={editingCarouselItem.description}
                      onChange={(e) => setEditingCarouselItem((prev: any) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100/30 focus:bg-white text-sm border border-neutral-250 focus:border-neutral-900 rounded-xl outline-none transition resize-none"
                    />
                  </div>
                </div>

                {/* Quick Presets Gallery Inside Edit Modal */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase">Apply Curated High-Res Preset Image:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                    {[
                      { name: "Suya", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
                      { name: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
                      { name: "Shawarma", url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800" },
                      { name: "Buttermilk", url: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=800" },
                      { name: "Fries", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800" },
                      { name: "Drink", url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=800" }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setEditingCarouselItem((prev: any) => ({ ...prev, image_url: preset.url }))}
                        className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-indigo-100 hover:text-indigo-700 font-semibold border border-neutral-200 rounded-lg shrink-0 transition"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-150 flex items-center justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setEditingCarouselItem(null)}
                    className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition hover:bg-neutral-50 rounded-xl"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Apply Changes
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
