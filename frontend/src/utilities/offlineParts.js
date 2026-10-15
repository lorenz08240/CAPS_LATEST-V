// Offline fallback components seeded directly from buildlab_db.sql
// Allows full 3D building and testing even when XAMPP/MySQL is offline!

export const OFFLINE_COMPONENTS = {
  case: [
    {
      id: "case1",
      category: "case",
      name: "Montech AIR-903-base",
      brand: "Montech",
      desc: "Excellent airflow mid-tower case with tempered glass side panel and pre-installed high-performance fans.",
      img: "https://netcodex.ph/wp-content/uploads/2025/04/Air-903-Base-Black-1.webp",
      price: "₱3,500",
      form_factor: "Mid Tower",
      tags: ["Mid Tower", "Airflow", "Tempered Glass"]
    },
    {
      id: "case2",
      category: "case",
      name: "Corsair 5000T RGB",
      brand: "Corsair",
      desc: "Premium ATX case with integrated RGB accent lighting and spacious interior.",
      img: "https://i.pinimg.com/736x/80/1a/a2/801aa278ac082746e4d985a88a49b050.jpg",
      price: "₱6,200",
      form_factor: "Full Tower",
      tags: ["Full Tower", "Tempered Glass", "RGB"]
    },
    {
      id: "case3",
      category: "case",
      name: "NZXT H510 Elite",
      brand: "NZXT",
      desc: "Clean modern design with front and side tempered glass panels and cable management channels.",
      img: "https://img.overclockers.co.uk/images/CAS-PHK-02322/2cf0f3d0d8c9ab24eee5cd10713cd601.jpg",
      price: "₱5,500",
      form_factor: "Mid Tower",
      tags: ["Mid Tower", "Tempered Glass", "Clean Design"]
    },
    {
      id: "case4",
      category: "case",
      name: "Lian Li Lancool 215",
      brand: "Lian Li",
      desc: "Airflow-optimized chassis with two massive 200mm ARGB intake fans.",
      img: "https://i.pinimg.com/1200x/1f/59/8f/1f598fb26027a902adf73c58d122f477.jpg",
      price: "₱6,200",
      form_factor: "Mid Tower",
      tags: ["Mid Tower", "Mesh Front", "High Airflow"]
    }
  ],

  motherboard: [
    {
      id: "asus-rog-strix-z690",
      category: "motherboard",
      name: "ASUS ROG Strix Z690-E Gaming WiFi",
      brand: "ASUS",
      desc: "High-end gaming motherboard with PCIe 5.0, robust power stages, and WiFi 6E.",
      img: "https://i.pinimg.com/736x/03/8b/63/038b634627abdf7d8ffafbb73b6f5055.jpg",
      price: "₱28,500",
      socket_type: "LGA1700",
      ddr_type: "DDR5",
      form_factor: "ATX",
      tags: ["LGA1700", "DDR5", "ATX", "PCIe 5.0"]
    },
    {
      id: "asus-prime-b660m",
      category: "motherboard",
      name: "ASUS Prime B660M-A WiFi",
      brand: "ASUS",
      desc: "Reliable mATX motherboard for Intel 12th/13th/14th gen processors.",
      img: "https://i.pinimg.com/1200x/aa/7a/b6/aa7ab6601d825d397bdc9a0ef0536107.jpg",
      price: "₱8,500",
      socket_type: "LGA1700",
      ddr_type: "DDR4",
      form_factor: "mATX",
      tags: ["LGA1700", "DDR4", "mATX"]
    },
    {
      id: "gigabyte-b850m-eagle",
      category: "motherboard",
      name: "Gigabyte B850M EAGLE AX ICE",
      brand: "GIGABYTE",
      desc: "Next-gen AMD AM5 motherboard with DDR5 support and white/silver aesthetic heatsinks.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11249-a.png?v=1778516158",
      price: "₱11,200",
      socket_type: "AM5",
      ddr_type: "DDR5",
      form_factor: "mATX",
      tags: ["AM5", "DDR5", "PCIe 5.0"]
    },
    {
      id: "asus-prime-a520m",
      category: "motherboard",
      name: "ASUS Prime A520M-K",
      brand: "ASUS",
      desc: "Budget-friendly AM4 motherboard for AMD Ryzen 3000, 4000, and 5000 series.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10296-a.png?v=1779312235",
      price: "₱4,200",
      socket_type: "AM4",
      ddr_type: "DDR4",
      form_factor: "mATX",
      tags: ["AM4", "DDR4", "Budget"]
    }
  ],

  cpu: [
    {
      id: "amd-ryzen5-7600x",
      category: "cpu",
      name: "AMD Ryzen 5 7600X",
      brand: "AMD",
      desc: "6-core, 12-thread desktop processor built on Zen 4 architecture with 5.3GHz boost clock.",
      img: "https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg",
      price: "₱14,900",
      socket_type: "AM5",
      wattage: 105,
      tags: ["AM5", "105W", "6 cores", "Zen 4"]
    },
    {
      id: "intel-core-i7-13700k",
      category: "cpu",
      name: "Intel Core i7-13700K",
      brand: "Intel",
      desc: "16 cores (8P + 8E) up to 5.4GHz. Unlocked enthusiast desktop processor for gaming and rendering.",
      img: "https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg",
      price: "₱24,500",
      socket_type: "LGA1700",
      wattage: 125,
      tags: ["LGA1700", "125W", "16 cores", "Raptor Lake"]
    },
    {
      id: "amd-ryzen7-5700x",
      category: "cpu",
      name: "AMD Ryzen 7 5700X",
      brand: "AMD",
      desc: "8-core, 16-thread processor on AM4 platform with high power efficiency.",
      img: "https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg",
      price: "₱10,800",
      socket_type: "AM4",
      wattage: 65,
      tags: ["AM4", "65W", "8 cores", "Zen 3"]
    }
  ],

  ram: [
    {
      id: "corsair-dominator-ddr5-32gb",
      category: "ram",
      name: "Corsair Dominator Platinum RGB 32GB (2x16GB)",
      brand: "Corsair",
      desc: "Iconic aluminum heatspreader with Capellix RGB LEDs and 6000MHz ultra-low latency.",
      img: "https://i.pinimg.com/1200x/24/32/a7/2432a792587ec1347b7f0b9b952a559f.jpg",
      price: "₱12,500",
      ddr_type: "DDR5",
      capacity: "32GB",
      speed: "6000MHz",
      tags: ["DDR5", "32GB", "6000MHz", "RGB"]
    },
    {
      id: "corsair-vengeance-16gb",
      category: "ram",
      name: "Corsair Vengeance LPX 16GB (2x8GB)",
      brand: "Corsair",
      desc: "Low-profile DDR4 memory designed for high-performance overclocking and broad cooler clearance.",
      img: "https://i.pinimg.com/1200x/d9/ce/16/d9ce160cb4b2b9fe73179f1a976bc8f6.jpg",
      price: "₱3,200",
      ddr_type: "DDR4",
      capacity: "16GB",
      speed: "3200MHz",
      tags: ["DDR4", "16GB", "3200MHz"]
    },
    {
      id: "klevv-bolt-x-16gb",
      category: "ram",
      name: "Klevv Bolt X 16GB (2x8GB) DDR4",
      brand: "Klevv",
      desc: "Reliable gamer memory with pure aluminum heatsink.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11146-a.png?v=1776907621",
      price: "₱2,800",
      ddr_type: "DDR4",
      capacity: "16GB",
      speed: "3200MHz",
      tags: ["DDR4", "16GB", "Budget"]
    }
  ],

  storage: [
    {
      id: "crucial-p5-plus-1tb",
      category: "storage",
      name: "Crucial P5 Plus 1TB NVMe PCIe 4.0 M.2 SSD",
      brand: "Crucial",
      desc: "Up to 6600MB/s sequential read speeds for intensive gaming and content creation.",
      img: "https://i.pinimg.com/1200x/7e/10/b8/7e10b88e6fec645fde0db26318870dd2.jpg",
      price: "₱4,800",
      capacity: "1TB",
      type: "NVMe SSD",
      tags: ["NVMe", "1TB", "PCIe 4.0", "M.2"]
    },
    {
      id: "hiksemi-wave-p-512gb",
      category: "storage",
      name: "Hiksemi Wave P 512GB PCIe M.2 SSD",
      brand: "Hiksemi",
      desc: "High-speed compact storage for OS boot drive and favorite games.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11100-a.png?v=1778105140",
      price: "₱2,400",
      capacity: "512GB",
      type: "NVMe SSD",
      tags: ["NVMe", "512GB", "PCIe 3.0"]
    },
    {
      id: "esgaming-sata-512gb",
      category: "storage",
      name: "ESGaming 512GB SATA 2.5 SSD",
      brand: "ESGaming",
      desc: "2.5 inch internal SATA solid state drive for bulk game libraries.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11323-a.png?v=1778809756",
      price: "₱1,800",
      capacity: "512GB",
      type: "SATA SSD",
      tags: ["SATA", "512GB", "2.5 inch"]
    }
  ],

  gpu: [
    {
      id: "gigabyte-rtx-4070-aero",
      category: "gpu",
      name: "Gigabyte GeForce RTX 4070 AERO OC 12GB",
      brand: "GIGABYTE",
      desc: "Ada Lovelace architecture with DLSS 3, WINDFORCE cooling system, and white shroud.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11245-a.png?v=1778516081",
      price: "₱41,500",
      power_required: 200,
      tags: ["RTX 4070", "12GB", "GDDR6X", "DLSS 3"]
    },
    {
      id: "amd-rx-6800-xt",
      category: "gpu",
      name: "AMD Radeon RX 6800 XT 16GB",
      brand: "AMD",
      desc: "Powerful RDNA 2 GPU with 16GB GDDR6 memory for high refresh 1440p and 4K gaming.",
      img: "https://i.pinimg.com/1200x/83/e6/51/83e6515f65aabf7666f11422a6dc07e6.jpg",
      price: "₱38,200",
      power_required: 300,
      tags: ["RX 6800 XT", "16GB", "4K Gaming"]
    },
    {
      id: "inno3d-rtx-3050",
      category: "gpu",
      name: "Inno3D GeForce RTX 3050 Twin X2 6GB",
      brand: "INNO3D",
      desc: "Budget ray-tracing entry graphics card for 1080p esports and everyday gaming.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10015-a.png?v=1778516178",
      price: "₱12,500",
      power_required: 130,
      tags: ["RTX 3050", "6GB", "Budget"]
    }
  ],

  psu: [
    {
      id: "corsair-hx850x",
      category: "psu",
      name: "Corsair HX850 850W Platinum Fully Modular",
      brand: "Corsair",
      desc: "80 PLUS Platinum efficiency, Zero RPM fan mode, and 100% Japanese 105°C capacitors.",
      img: "https://assets.corsair.com/image/upload/c_pad,q_85,h_360,w_360/products/Power-Supply-Units/CMPSU-850HX/Gallery/hx850_01.webp",
      price: "₱9,200",
      wattage: 850,
      efficiency: "80+ Platinum",
      tags: ["850W", "80+ Platinum", "Fully Modular"]
    },
    {
      id: "corsair-rm650x",
      category: "psu",
      name: "Corsair RM650x 650W Gold Modular",
      brand: "Corsair",
      desc: "80 PLUS Gold certified power supply with modular black sleeved cables.",
      img: "https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Power-Supply-Units/CP-9020178-NA/Gallery/RM650x_PSU_01.webp",
      price: "₱5,800",
      wattage: 650,
      efficiency: "80+ Gold",
      tags: ["650W", "80+ Gold", "Modular"]
    },
    {
      id: "acer-ac-500",
      category: "psu",
      name: "Acer AC-500 500W Bronze",
      brand: "ACER",
      desc: "Reliable 500 watt entry power supply with 80 Plus Bronze rating.",
      img: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11266-a.png?v=1778809722",
      price: "₱2,200",
      wattage: 500,
      efficiency: "80+ Bronze",
      tags: ["500W", "80+ Bronze"]
    }
  ]
};

// Ready-to-go balanced demo gaming PC build for 1-click test assembly
export const DEMO_GAMING_RIG = {
  case: OFFLINE_COMPONENTS.case[0],
  motherboard: OFFLINE_COMPONENTS.motherboard[0],
  cpu: OFFLINE_COMPONENTS.cpu[1],
  ram: OFFLINE_COMPONENTS.ram[0],
  storage: OFFLINE_COMPONENTS.storage[0],
  gpu: OFFLINE_COMPONENTS.gpu[0],
  psu: OFFLINE_COMPONENTS.psu[0]
};
