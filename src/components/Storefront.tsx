import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, Search, ShoppingCart, Plus, Minus, X, Check, MapPin, 
  Phone, User, ArrowRight, Clock, ShieldCheck, HelpCircle, Eye, ChevronRight,
  TrendingUp, Award, Flame, ExternalLink, Calendar
} from "lucide-react";
import { Product } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
  customizations: {
    size: string;
    spice: string;
    extras: string[];
    extraCost: number;
  };
}

interface StorefrontProps {
  onGoToAdmin: () => void;
  products: Product[];
  loadingProducts: boolean;
}

export function Storefront({ onGoToAdmin, products: initialProducts, loadingProducts }: StorefrontProps) {
  // Navigation & tabs
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "track" | "about">("home");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart state (persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customization modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("Regular");
  const [selectedSpice, setSelectedSpice] = useState("Spicy");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // Checkout flow
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order confirmation & tracking
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [trackOrderNumber, setTrackOrderNumber] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [trackError, setTrackError] = useState("");

  // Categories list
  const categories = ["All", "Burgers", "Shawarma", "Chicken", "Sides", "Drinks"];

  // Chef's special carousel list
  const chefSpecialItems = initialProducts && initialProducts.length > 0 
    ? initialProducts 
    : [
        {
          id: "default-suya",
          name: "Authentic Chicken Suya",
          price: 9000,
          image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
          category: "Chicken",
          description: "Tender boneless chicken thigh pieces seasoned in spicy roasted peanut rub (yaji spice) and smoked over red-hot charcoal, served with fresh sliced red onions, cabbage, and extra yaji."
        },
        {
          id: "default-burger",
          name: "Double Grilled Chicken Burger",
          price: 10500,
          image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
          category: "Burgers",
          description: "Juicy double-stacked grilled chicken breast patties, melted cheddar cheese, fresh lettuce, sliced tomatoes, caramelized onions, and our signature burger sauce on a toasted brioche bun."
        },
        {
          id: "default-wrap",
          name: "Spicy Beef Shawarma Wrap",
          price: 8500,
          image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800",
          category: "Shawarma",
          description: "Premium sliced flank beef slow-roasted and marinated in authentic Middle Eastern spices, wrapped in toasted pita with French fries, pickled cucumbers, cabbage salad, and garlic tahini sauce."
        }
      ];

  const [currentChefSpecialIndex, setCurrentChefSpecialIndex] = useState(0);

  useEffect(() => {
    if (chefSpecialItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentChefSpecialIndex((prev) => (prev + 1) % chefSpecialItems.length);
    }, 4500); // rotate every 4.5 seconds
    return () => clearInterval(interval);
  }, [chefSpecialItems.length]);

  const currentSpecial = chefSpecialItems[currentChefSpecialIndex % chefSpecialItems.length] || chefSpecialItems[0];

  // Fetch / Sync Cart on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cf_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
  }, []);

  // Save Cart helper
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cf_cart", JSON.stringify(newCart));
  };

  // Add to Cart with customizations
  const handleAddToCart = () => {
    if (!customizingProduct) return;

    let extraCost = 0;
    if (selectedSize === "Double Feast") extraCost += 2000;
    if (selectedSize === "Jumbo Feast") extraCost += 4500;
    
    selectedExtras.forEach(extra => {
      if (extra === "Extra Cheese Slice") extraCost += 1000;
      if (extra === "Suya yaji sprinkle") extraCost += 500;
      if (extra === "Crispy Fries") extraCost += 2000;
    });

    const newItem: CartItem = {
      product: customizingProduct,
      quantity: 1,
      customizations: {
        size: selectedSize,
        spice: selectedSpice,
        extras: [...selectedExtras],
        extraCost
      }
    };

    // Check if duplicate item with same customizations exists
    const duplicateIdx = cart.findIndex(item => 
      item.product.id === newItem.product.id &&
      item.customizations.size === newItem.customizations.size &&
      item.customizations.spice === newItem.customizations.spice &&
      JSON.stringify(item.customizations.extras.sort()) === JSON.stringify(newItem.customizations.extras.sort())
    );

    let newCart = [...cart];
    if (duplicateIdx > -1) {
      newCart[duplicateIdx].quantity += 1;
    } else {
      newCart.push(newItem);
    }

    saveCart(newCart);
    setCustomizingProduct(null);
    setSelectedSize("Regular");
    setSelectedSpice("Spicy");
    setSelectedExtras([]);
    setIsCartOpen(true);
  };

  // Remove / Update Cart Quantities
  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    saveCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = (item.product.price + item.customizations.extraCost) * item.quantity;
      return total + itemPrice;
    }, 0);
  };

  const deliveryFee = 1500; // Fixed delivery fee ₦1,500 inside Nigeria

  // Place Order API Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert("Please fill out Name, Phone number and Delivery Address.");
      return;
    }

    setSubmittingOrder(true);

    const orderPayload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_address: deliveryAddress,
      delivery_instructions: deliveryInstructions,
      payment_method: paymentMethod,
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price + item.customizations.extraCost,
        customizations: item.customizations
      })),
      total_price: getCartTotal() + deliveryFee
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        setPlacedOrder(data.order);
        saveCart([]); // clear cart
        setIsCheckoutOpen(false);
      } else {
        alert(data.error || "Failed to submit order. Please try again.");
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Error connecting to server. Please try again.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Live order search
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNumber.trim()) return;

    setSearchingOrder(true);
    setTrackError("");
    setSearchedOrder(null);

    try {
      const res = await fetch(`/api/orders/track?number=${encodeURIComponent(trackOrderNumber.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSearchedOrder(data.order);
      } else {
        setTrackError(data.error || "Order not found. Check the order number.");
      }
    } catch (err) {
      console.error("Tracking request failed:", err);
      setTrackError("Error reaching server. Please check your network.");
    } finally {
      setSearchingOrder(false);
    }
  };

  const toggleExtra = (extraName: string) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(prev => prev.filter(e => e !== extraName));
    } else {
      setSelectedExtras(prev => [...prev, extraName]);
    }
  };

  // Filtering products for storefront layout
  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-11 h-11 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Flame className="w-6 h-6 text-black fill-black animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-lg sm:text-xl tracking-tight text-white block">
                CHICKEN<span className="text-amber-400">FEAST</span>
              </span>
              <span className="text-[10px] tracking-widest text-amber-400/80 uppercase font-bold font-mono">
                Nigeria's Pride
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
            <button 
              onClick={() => setActiveTab("home")}
              className={`hover:text-amber-400 transition ${activeTab === "home" ? "text-amber-400 font-bold" : "text-neutral-300"}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab("menu")}
              className={`hover:text-amber-400 transition ${activeTab === "menu" ? "text-amber-400 font-bold" : "text-neutral-300"}`}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab("track")}
              className={`hover:text-amber-400 transition ${activeTab === "track" ? "text-amber-400 font-bold" : "text-neutral-300"}`}
            >
              Track Order
            </button>
            <button 
              onClick={() => setActiveTab("about")}
              className={`hover:text-amber-400 transition ${activeTab === "about" ? "text-amber-400 font-bold" : "text-neutral-300"}`}
            >
              Our Story
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-amber-400 transition shadow-md border border-neutral-700/50 cursor-pointer flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Admin entry button */}
            <button 
              onClick={onGoToAdmin}
              className="text-xs bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-400/10 cursor-pointer flex items-center gap-1.5 border border-amber-300"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 py-2.5 px-6 flex items-center justify-between text-xs font-semibold">
        <button 
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "home" ? "text-amber-400" : "text-neutral-400"}`}
        >
          <Clock className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button 
          onClick={() => setActiveTab("menu")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "menu" ? "text-amber-400" : "text-neutral-400"}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Menu</span>
        </button>
        <button 
          onClick={() => setActiveTab("track")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "track" ? "text-amber-400" : "text-neutral-400"}`}
        >
          <MapPin className="w-5 h-5" />
          <span>Track</span>
        </button>
        <button 
          onClick={() => setActiveTab("about")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "about" ? "text-amber-400" : "text-neutral-400"}`}
        >
          <User className="w-5 h-5" />
          <span>Story</span>
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-grow pb-24 md:pb-12">
        
        {/* TAB 1: HOME PAGE */}
        {activeTab === "home" && (
          <div className="space-y-16">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-neutral-900 py-16 sm:py-24 border-b border-neutral-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#b45309,transparent_70%)] opacity-20" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                <div className="lg:col-span-7 space-y-6 text-left">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-full text-amber-400 font-bold uppercase tracking-wider font-mono">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 animate-bounce" /> Spicy, Smoky, Tender Grill
                  </span>
                  <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight uppercase">
                    Nigeria's Premium <br />
                    <span className="text-amber-400">Chicken Suya</span> & Burgers
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                    Freshly charcoal-grilled suya rubs, double-stacked flame burger patties, and authentic local spices cooked to crispy, juicy perfection. Delivered hot to your doorstep inside Nigeria.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2 group text-sm sm:text-base uppercase tracking-wide border border-amber-300"
                    >
                      Explore Menu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setActiveTab("track")}
                      className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-extrabold px-8 py-4 rounded-2xl transition border border-neutral-700 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wide"
                    >
                      Track Active Order
                    </button>
                  </div>
                  
                  {/* Trust factors */}
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-850">
                    <div>
                      <span className="block font-sans font-extrabold text-xl text-white">100%</span>
                      <span className="text-xs text-neutral-400">Halal Meat</span>
                    </div>
                    <div>
                      <span className="block font-sans font-extrabold text-xl text-white">&lt; 35m</span>
                      <span className="text-xs text-neutral-400">Express Delivery</span>
                    </div>
                    <div>
                      <span className="block font-sans font-extrabold text-xl text-white">4.9 ★</span>
                      <span className="text-xs text-neutral-400">Customer Rating</span>
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="lg:col-span-5 relative">
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl scale-95" />
                  <div className="relative border-4 border-neutral-800 rounded-3xl overflow-hidden aspect-square max-w-md mx-auto shadow-2xl bg-neutral-900">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSpecial.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <img 
                          src={currentSpecial.image_url || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"} 
                          alt={currentSpecial.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/95 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-lg">
                          <div className="flex-1 min-w-0 pr-3">
                            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-amber-400 animate-pulse" /> Chef's Special
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{currentSpecial.name}</h3>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="font-mono text-amber-400 font-extrabold text-xs sm:text-sm">
                              ₦{currentSpecial.price?.toLocaleString()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomizingProduct(currentSpecial as Product);
                                setSelectedSize("Regular");
                                setSelectedSpice("Spicy");
                                setSelectedExtras([]);
                              }}
                              className="text-[9px] sm:text-[10px] bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-2 py-1 rounded-lg transition uppercase flex items-center gap-1 border border-amber-300 cursor-pointer"
                            >
                              Add +
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORIES SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-2 mb-10">
                <span className="text-xs text-amber-400 font-extrabold uppercase tracking-widest">Craving Something?</span>
                <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">Explore Our Categories</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTab("menu");
                    }}
                    className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
                      selectedCategory === cat 
                        ? "bg-amber-400 border-amber-400 text-black font-bold shadow-lg shadow-amber-400/10" 
                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <span className="text-lg font-extrabold tracking-wide uppercase">{cat}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* FEATURED / BEST SELLERS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <span className="text-xs text-amber-400 font-extrabold uppercase tracking-widest">Top Demanded</span>
                  <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">Our Weekly Best Sellers</h2>
                </div>
                <button 
                  onClick={() => { setSelectedCategory("All"); setActiveTab("menu"); }}
                  className="text-xs sm:text-sm text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  View Full Menu <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-neutral-900 h-96 rounded-2xl animate-pulse border border-neutral-800" />
                  ))}
                </div>
              ) : initialProducts.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
                  <p className="text-sm">No products in inventory. Access the Staff Portal to create some products first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialProducts.slice(0, 3).map((product) => (
                    <div 
                      key={product.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-neutral-700 transition flex flex-col h-full"
                    >
                      <div className="h-60 overflow-hidden relative">
                        <img 
                          src={product.image_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-neutral-950/90 border border-neutral-800 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono">
                          {product.category}
                        </span>
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-sans font-extrabold text-lg text-white group-hover:text-amber-400 transition">
                            {product.name}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-850">
                          <span className="font-mono text-lg font-bold text-amber-400">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              setCustomizingProduct(product);
                              setSelectedSize("Regular");
                              setSelectedSpice("Spicy");
                              setSelectedExtras([]);
                            }}
                            className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer uppercase flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Order Feast
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: MENU PAGE */}
        {activeTab === "menu" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-6">
            {/* SEARCH AND TITLE BAR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
              <div>
                <h1 className="font-sans font-extrabold text-2xl text-white uppercase tracking-tight">Our Full Feast Menu</h1>
                <p className="text-xs text-neutral-400 mt-1">Browse, search, and customize your hot Nigerian fast food feast.</p>
              </div>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search double burgers, suya wraps, crispy sides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-amber-400 border-amber-400 text-black"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* PRODUCTS LIST */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-neutral-900 h-96 rounded-2xl animate-pulse border border-neutral-800" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <Search className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-neutral-300 uppercase">No Feast Found</h3>
                <p className="text-xs text-neutral-500 mt-1">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-neutral-700 transition flex flex-col h-full"
                  >
                    <div className="h-60 overflow-hidden relative">
                      <img 
                        src={product.image_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 bg-neutral-950/90 border border-neutral-800 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono">
                        {product.category}
                      </span>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-sans font-extrabold text-lg text-white">
                          {product.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-850">
                        <span className="font-mono text-lg font-bold text-amber-400">
                          ₦{product.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            setCustomizingProduct(product);
                            setSelectedSize("Regular");
                            setSelectedSpice("Spicy");
                            setSelectedExtras([]);
                          }}
                          className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer uppercase flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Order Feast
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRACK ORDER PAGE */}
        {activeTab === "track" && (
          <div className="max-w-2xl mx-auto px-4 space-y-8 mt-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-400/30">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <h1 className="font-sans font-extrabold text-2xl text-white uppercase tracking-tight">Live Order Tracker</h1>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Enter your order number (e.g. CF-XXXX-XXXX) to track your delivery status in real-time.
                </p>
              </div>

              <form onSubmit={handleTrackOrder} className="flex gap-2">
                <input
                  type="text"
                  placeholder="CF-1234-5678"
                  value={trackOrderNumber}
                  onChange={(e) => setTrackOrderNumber(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-sm rounded-xl px-4 py-3 outline-none focus:border-amber-400 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={searchingOrder}
                  className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-extrabold text-xs px-6 py-3 rounded-xl transition cursor-pointer uppercase flex items-center gap-1.5"
                >
                  {searchingOrder ? "Searching..." : "Track"}
                </button>
              </form>

              {trackError && (
                <p className="text-xs text-rose-500 text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-medium">
                  {trackError}
                </p>
              )}

              {searchedOrder && (
                <div className="pt-6 border-t border-neutral-800 space-y-6">
                  {/* Status Visual Stepper */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Delivery Status Tracker</h4>
                    
                    <div className="space-y-4 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                      
                      {/* Step 1: Placed */}
                      <div className="relative">
                        <div className="absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center bg-emerald-500 text-black font-bold text-xs border border-neutral-900">
                          ✓
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">Order Placed</span>
                          <span className="text-[11px] text-neutral-400">Order recorded successfully in our database.</span>
                        </div>
                      </div>

                      {/* Step 2: Preparing */}
                      <div className="relative">
                        <div className={`absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs border border-neutral-900 ${
                          ["Preparing", "Ready", "Out for Delivery", "Delivered"].includes(searchedOrder.status)
                            ? "bg-blue-500 text-black" : "bg-neutral-800 text-neutral-400"
                        }`}>
                          {["Preparing", "Ready", "Out for Delivery", "Delivered"].includes(searchedOrder.status) ? "✓" : "2"}
                        </div>
                        <div>
                          <span className={`text-sm font-bold block ${["Preparing", "Ready", "Out for Delivery", "Delivered"].includes(searchedOrder.status) ? "text-white" : "text-neutral-500"}`}>
                            Kitchen Preparing {searchedOrder.status === "Preparing" && <span className="text-xs text-amber-400 animate-pulse">(Active)</span>}
                          </span>
                          <span className="text-[11px] text-neutral-400">Chef is grilling your chicken and prepping fresh suya.</span>
                        </div>
                      </div>

                      {/* Step 3: Ready */}
                      <div className="relative">
                        <div className={`absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs border border-neutral-900 ${
                          ["Ready", "Out for Delivery", "Delivered"].includes(searchedOrder.status)
                            ? "bg-purple-500 text-black" : "bg-neutral-800 text-neutral-400"
                        }`}>
                          {["Ready", "Out for Delivery", "Delivered"].includes(searchedOrder.status) ? "✓" : "3"}
                        </div>
                        <div>
                          <span className={`text-sm font-bold block ${["Ready", "Out for Delivery", "Delivered"].includes(searchedOrder.status) ? "text-white" : "text-neutral-500"}`}>
                            Ready for Pickup {searchedOrder.status === "Ready" && <span className="text-xs text-amber-400 animate-pulse">(Active)</span>}
                          </span>
                          <span className="text-[11px] text-neutral-400">Packed in heat-safe foil to lock in spicy steam.</span>
                        </div>
                      </div>

                      {/* Step 4: Delivery */}
                      <div className="relative">
                        <div className={`absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs border border-neutral-900 ${
                          ["Out for Delivery", "Delivered"].includes(searchedOrder.status)
                            ? "bg-teal-500 text-black" : "bg-neutral-800 text-neutral-400"
                        }`}>
                          {["Out for Delivery", "Delivered"].includes(searchedOrder.status) ? "✓" : "4"}
                        </div>
                        <div>
                          <span className={`text-sm font-bold block ${["Out for Delivery", "Delivered"].includes(searchedOrder.status) ? "text-white" : "text-neutral-500"}`}>
                            Out for Delivery {searchedOrder.status === "Out for Delivery" && <span className="text-xs text-amber-400 animate-pulse">(Active)</span>}
                          </span>
                          <span className="text-[11px] text-neutral-400">Rider has left our hub and is routing to your address.</span>
                        </div>
                      </div>

                      {/* Step 5: Delivered */}
                      <div className="relative">
                        <div className={`absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs border border-neutral-900 ${
                          searchedOrder.status === "Delivered" ? "bg-emerald-500 text-black" : "bg-neutral-800 text-neutral-400"
                        }`}>
                          {searchedOrder.status === "Delivered" ? "✓" : "5"}
                        </div>
                        <div>
                          <span className={`text-sm font-bold block ${searchedOrder.status === "Delivered" ? "text-emerald-400" : "text-neutral-500"}`}>
                            Delivered
                          </span>
                          <span className="text-[11px] text-neutral-400">Feast delivered. Enjoy your fresh and delicious meal!</span>
                        </div>
                      </div>

                      {/* Cancelled state fallback */}
                      {searchedOrder.status === "Cancelled" && (
                        <div className="relative">
                          <div className="absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center bg-rose-500 text-black font-bold text-xs border border-neutral-900">
                            ✕
                          </div>
                          <div>
                            <span className="text-sm font-bold text-rose-400 block">Order Cancelled</span>
                            <span className="text-[11px] text-neutral-400">Your order has been cancelled or rejected by our kitchen.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order summary breakdown */}
                  <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
                    <div className="flex justify-between border-b border-neutral-850 pb-3">
                      <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Billing details</span>
                      <span className="font-mono text-xs text-amber-400">{searchedOrder.order_number}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <p><span className="text-neutral-400 font-medium">Customer:</span> {searchedOrder.customer_name}</p>
                      <p><span className="text-neutral-400 font-medium">Phone:</span> {searchedOrder.customer_phone}</p>
                      <p><span className="text-neutral-400 font-medium">Delivery:</span> {searchedOrder.delivery_address}</p>
                      <p><span className="text-neutral-400 font-medium">Payment:</span> {searchedOrder.payment_method}</p>
                    </div>
                    <div className="border-t border-neutral-850 pt-3 flex justify-between items-center">
                      <span className="text-xs text-neutral-400 font-semibold">Total paid (incl. delivery):</span>
                      <span className="font-mono text-sm font-extrabold text-amber-400">₦{searchedOrder.total_price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT PAGE */}
        {activeTab === "about" && (
          <div className="max-w-3xl mx-auto px-4 space-y-10 mt-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-6 text-center">
              <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-400/10">
                <Award className="w-7 h-7 text-black fill-black" />
              </div>
              <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">The Story of ChickenFeast.ng</h1>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Born out of a deep-seated passion for authentic Nigerian smokehouse grill culture, ChickenFeast.ng combines traditional yaji spices and roasted-peanut rubs with modern fast-food culinary precision.
              </p>
              <div className="border-t border-neutral-800 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-850">
                  <h3 className="font-bold text-white text-sm uppercase text-amber-400">Smoked Daily</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">We source all our beef flank and tender chicken thighs locally, prepared fresh with hickory embers daily.</p>
                </div>
                <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-850">
                  <h3 className="font-bold text-white text-sm uppercase text-amber-400">Traditional Yaji</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">Our secret seasoning blends are imported straight from Kano, mixing authentic peanut ginger spices with heat.</p>
                </div>
                <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-850">
                  <h3 className="font-bold text-white text-sm uppercase text-amber-400">Hygiene Standard</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">From raw preparation to state-of-the-art aluminum thermal locks, we guarantee spotless kitchen safety.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-12 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="text-left space-y-1">
            <span className="font-extrabold text-white text-sm block">CHICKENFEAST<span className="text-amber-400">.NG</span></span>
            <p className="text-[11px] text-neutral-400">Serving Premium Halal Smoked Suya & Burgers since 2026.</p>
          </div>
          <div className="flex gap-4 text-neutral-400 font-semibold justify-center">
            <button onClick={() => setActiveTab("home")} className="hover:text-amber-400">Home</button>
            <button onClick={() => setActiveTab("menu")} className="hover:text-amber-400">Menu</button>
            <button onClick={() => setActiveTab("track")} className="hover:text-amber-400">Track</button>
            <button onClick={() => setActiveTab("about")} className="hover:text-amber-400">About</button>
          </div>
          <div className="text-sm sm:text-right text-[11px] text-neutral-400">
            © 2026 ChickenFeast.ng Storefront. Built for absolute dining excellence.
          </div>
        </div>
      </footer>

      {/* ITEM CUSTOMIZATION MODAL */}
      <AnimatePresence>
        {customizingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingProduct(null)}
              className="absolute inset-0 bg-neutral-950"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setCustomizingProduct(null)}
                className="absolute top-4 right-4 p-2 bg-neutral-950/80 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto p-6 space-y-6">
                {/* Hero image in modal */}
                <div className="h-52 rounded-2xl overflow-hidden relative">
                  <img 
                    src={customizingProduct.image_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"} 
                    alt={customizingProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                      {customizingProduct.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1 uppercase">{customizingProduct.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {customizingProduct.description}
                </p>

                {/* 1. Size customizations */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">1. Choose size</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: "Regular", priceLabel: "Included" },
                      { name: "Double Feast", priceLabel: "+₦2,000" },
                      { name: "Jumbo Feast", priceLabel: "+₦4,500" }
                    ].map((sz) => (
                      <button
                        key={sz.name}
                        type="button"
                        onClick={() => setSelectedSize(sz.name)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex justify-between items-center ${
                          selectedSize === sz.name
                            ? "bg-amber-400/10 border-amber-400 text-amber-400"
                            : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <span className="text-xs font-bold">{sz.name}</span>
                        <span className="text-[10px] opacity-80">{sz.priceLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Spice Level Customization */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">2. Choose Spice Level</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["Mild", "Spicy", "Suya Fire 🔥"].map((spice) => (
                      <button
                        key={spice}
                        type="button"
                        onClick={() => setSelectedSpice(spice)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                          selectedSpice === spice
                            ? "bg-amber-400/10 border-amber-400 text-amber-400"
                            : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {spice}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Add Extras */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">3. Add Extra Delicacies (Optional)</span>
                  <div className="space-y-2">
                    {[
                      { name: "Extra Cheese Slice", price: 1000 },
                      { name: "Suya yaji sprinkle", price: 500 },
                      { name: "Crispy Fries", price: 2000 }
                    ].map((extra) => {
                      const isAdded = selectedExtras.includes(extra.name);
                      return (
                        <button
                          key={extra.name}
                          type="button"
                          onClick={() => toggleExtra(extra.name)}
                          className={`w-full p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isAdded
                              ? "bg-amber-400/10 border-amber-400 text-amber-400"
                              : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-750"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${isAdded ? "border-amber-400 bg-amber-400 text-black" : "border-neutral-700"}`}>
                              {isAdded && "✓"}
                            </div>
                            <span className="text-xs font-bold">{extra.name}</span>
                          </div>
                          <span className="text-xs font-mono font-semibold">+₦{extra.price.toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Add to Cart Footer Action */}
              <div className="p-6 bg-neutral-950 border-t border-neutral-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Total Price:</span>
                  <span className="font-mono text-lg font-extrabold text-amber-400">
                    ₦{(
                      customizingProduct.price + 
                      (selectedSize === "Double Feast" ? 2000 : selectedSize === "Jumbo Feast" ? 4500 : 0) +
                      (selectedExtras.includes("Extra Cheese Slice") ? 1000 : 0) +
                      (selectedExtras.includes("Suya yaji sprinkle") ? 500 : 0) +
                      (selectedExtras.includes("Crispy Fries") ? 2000 : 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs px-6 py-3.5 rounded-xl transition cursor-pointer uppercase flex items-center gap-1.5 border border-amber-300 shadow-md shadow-amber-400/5"
                >
                  Add Feast to Cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING CART DRAWER SLIDE-OVER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-neutral-950"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col h-full shadow-2xl"
              >
                {/* Header */}
                <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                  <h2 className="font-sans font-extrabold text-lg text-white uppercase tracking-tight flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-amber-400" /> Your Feast Cart
                  </h2>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 hover:bg-neutral-800 rounded-xl transition text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingBag className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <h3 className="text-sm font-bold text-neutral-400 uppercase">Cart is Empty</h3>
                      <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">Browse our hot charcoal feast and stack up some delicious burgers!</p>
                      <button
                        onClick={() => { setIsCartOpen(false); setActiveTab("menu"); }}
                        className="mt-5 text-xs bg-amber-400 text-black font-extrabold px-5 py-2.5 rounded-xl uppercase hover:bg-amber-500 cursor-pointer"
                      >
                        Explore Menu
                      </button>
                    </div>
                  ) : (
                    cart.map((item, idx) => {
                      const itemPrice = item.product.price + item.customizations.extraCost;
                      return (
                        <div key={idx} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 flex gap-4 items-start relative">
                          <img 
                            src={item.product.image_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"} 
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs font-bold text-white pr-6 line-clamp-1">{item.product.name}</h4>
                            
                            {/* Option list */}
                            <div className="text-[10px] text-amber-500/90 font-medium space-y-0.5 font-sans">
                              <p>Size: {item.customizations.size}</p>
                              <p>Spice: {item.customizations.spice}</p>
                              {item.customizations.extras.length > 0 && (
                                <p>Extras: {item.customizations.extras.join(", ")}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              {/* Quantity selectors */}
                              <div className="flex items-center gap-2 border border-neutral-800 bg-neutral-900 rounded-lg p-1 scale-90 -ml-1">
                                <button 
                                  onClick={() => updateQuantity(idx, -1)}
                                  className="p-1 hover:bg-neutral-850 rounded text-neutral-400 hover:text-white transition"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(idx, 1)}
                                  className="p-1 hover:bg-neutral-850 rounded text-neutral-400 hover:text-white transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-mono text-xs font-bold text-amber-400">
                                ₦{(itemPrice * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => updateQuantity(idx, -item.quantity)}
                            className="absolute top-2.5 right-2.5 text-neutral-600 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer and checkout prompt */}
                {cart.length > 0 && (
                  <div className="p-5 bg-neutral-950 border-t border-neutral-850 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 font-semibold">Subtotal:</span>
                      <span className="font-mono text-sm font-extrabold text-white">₦{getCartTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 font-semibold">Delivery Fee:</span>
                      <span className="font-mono text-sm font-extrabold text-neutral-400">₦{deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-850 flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Total Feast Bill:</span>
                      <span className="font-mono text-base font-extrabold text-amber-400">₦{(getCartTotal() + deliveryFee).toLocaleString()}</span>
                    </div>
                    
                    <button
                      onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs py-3.5 rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg border border-amber-300"
                    >
                      Checkout Feast Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL CHECKOUT OVERLAY MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-neutral-950"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
                <h2 className="font-sans font-extrabold text-lg text-white uppercase tracking-tight flex items-center gap-2">
                  🛡️ Secure Checkout Feast
                </h2>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 hover:bg-neutral-850 rounded-xl transition text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="flex-grow overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Emeka Okafor"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Phone Number (Nigeria) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="tel"
                        placeholder="+234 812 345 6789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs rounded-xl px-4 py-3 outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Delivery Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <textarea
                      placeholder="Apartment, Street Name, Estate, City, State"
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-400 transition"
                      required
                    />
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Special Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="Ring buzzer, deliver at gate, bring change for ₦10,000, etc."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs rounded-xl px-4 py-3 outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Choose Payment Option</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: "Cash on Delivery", label: "Cash on Delivery", subtitle: "Pay cash at gate" },
                      { name: "POS on Delivery", label: "POS Terminal", subtitle: "Card/POS on arrival" },
                      { name: "Instant Bank Transfer", label: "Bank Transfer", subtitle: "Transfer on arrival" }
                    ].map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => setPaymentMethod(m.name)}
                        className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === m.name
                            ? "bg-amber-400/10 border-amber-400 text-amber-400"
                            : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-750"
                        }`}
                      >
                        <span className="text-xs font-bold block">{m.label}</span>
                        <span className="text-[10px] opacity-70 mt-1 block">{m.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order Summary</h4>
                  <div className="space-y-1.5">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-neutral-300">
                        <span>{item.quantity}x {item.product.name} ({item.customizations.size})</span>
                        <span className="font-mono">₦{((item.product.price + item.customizations.extraCost) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2.5 border-t border-neutral-850 flex justify-between text-xs font-bold text-white">
                    <span>Total Feast Bill:</span>
                    <span className="font-mono text-amber-400 text-sm">₦{(getCartTotal() + deliveryFee).toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-extrabold text-sm py-4 rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg border border-amber-300"
                >
                  {submittingOrder ? "Registering Feast..." : `Confirm Order (₦${(getCartTotal() + deliveryFee).toLocaleString()})`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLACED ORDER CONFIRMATION MODAL */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlacedOrder(null)}
              className="absolute inset-0 bg-neutral-950"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 text-center space-y-6"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 text-black stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 font-bold uppercase tracking-wider font-mono">
                  Feast Ordered Successfully!
                </span>
                <h2 className="font-sans font-extrabold text-2xl text-white uppercase tracking-tight">Enjoy Your Feast!</h2>
                <p className="text-xs text-neutral-400">
                  Your order is registered with order code <span className="font-mono font-bold text-amber-400">{placedOrder.order_number}</span>. Please copy or screenshot this code to track your order.
                </p>
              </div>

              {/* Summary details */}
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-850 text-left space-y-3.5">
                <div className="flex justify-between border-b border-neutral-850 pb-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Receipt Breakdown</span>
                  <span className="font-mono text-xs font-bold text-amber-400">{placedOrder.order_number}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p><span className="text-neutral-400">Customer:</span> {placedOrder.customer_name}</p>
                  <p><span className="text-neutral-400">Phone:</span> {placedOrder.customer_phone}</p>
                  <p><span className="text-neutral-400">Address:</span> {placedOrder.delivery_address}</p>
                  <p><span className="text-neutral-400">Payment:</span> {placedOrder.payment_method}</p>
                </div>
                <div className="border-t border-neutral-850 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Grand Total (incl. delivery):</span>
                  <span className="font-mono text-sm font-extrabold text-amber-400">₦{placedOrder.total_price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTrackOrderNumber(placedOrder.order_number);
                    setSearchedOrder(placedOrder);
                    setPlacedOrder(null);
                    setActiveTab("track");
                  }}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs py-3.5 rounded-xl uppercase transition cursor-pointer border border-amber-300"
                >
                  Track Live Status
                </button>
                <button
                  onClick={() => {
                    setPlacedOrder(null);
                    setActiveTab("home");
                  }}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-extrabold text-xs py-3.5 rounded-xl uppercase transition border border-neutral-700 cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
