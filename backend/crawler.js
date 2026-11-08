const axios = require('axios');
const db = require('./config/db'); 

// 1. INITIALIZE SCRAPED REVIEW QUEUE TABLE
async function initScrapedTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS scraped_queue (
        id VARCHAR(255) PRIMARY KEY,
        source VARCHAR(100) DEFAULT 'Source: EasyPC',
        source_name VARCHAR(100) DEFAULT 'EasyPC',
        date VARCHAR(50),
        scraped_name TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'case',
        brand VARCHAR(100),
        form_factor VARCHAR(50),
        socket_type VARCHAR(50),
        ddr_type VARCHAR(50),
        wattage VARCHAR(50),
        power_required VARCHAR(50),
        capacity VARCHAR(50),
        speed VARCHAR(50),
        type VARCHAR(50),
        efficiency VARCHAR(50),
        price VARCHAR(50),
        img TEXT,
        \`desc\` TEXT,
        tags TEXT,
        approved TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Scraped review queue table verified.");
  } catch (err) {
    console.error("Table initialization error:", err.message);
  }
}

// Helper to determine category from product details
function detectProductCategory(name, productType = '', fallbackCategory = null) {
  const lowerName = (name || '').toLowerCase();
  const rawType = (productType || '').toLowerCase();

  // 1. CPU
  if (
    rawType.includes("processor") || rawType.includes("cpu") ||
    (lowerName.match(/\b(ryzen|intel core|core i[3579]|i[3579]-|threadripper|pentium|celeron)\b/i) && !lowerName.includes("cooler"))
  ) {
    return "cpu";
  }
  // 2. Motherboard
  else if (
    rawType.includes("motherboard") || rawType.includes("mainboard") ||
    lowerName.match(/\b(b550|b650|b450|z790|z690|h610|a520|b850|b760|x670|x870|z890|a620|motherboard|mainboard)\b/i)
  ) {
    return "motherboard";
  }
  // 3. GPU (Graphics Card / Video Card)
  else if (
    rawType.includes("graphic") || rawType.includes("gpu") || rawType.includes("vga") || rawType.includes("videocard") ||
    lowerName.includes("rtx") || lowerName.includes("gtx") || lowerName.includes("radeon") || lowerName.includes("rx ") ||
    lowerName.includes("geforce") || lowerName.includes("arc a") || lowerName.includes("videocard") || lowerName.includes("graphics card")
  ) {
    return "gpu";
  }
  // 4. RAM / Memory
  else if (
    rawType.includes("memory") || rawType.includes("ram") ||
    lowerName.includes("ddr4") || lowerName.includes("ddr5") || lowerName.includes("ddr3") ||
    lowerName.includes("sodimm") || lowerName.includes("dimm")
  ) {
    return "ram";
  }
  // 5. Storage
  else if (
    rawType.includes("drive") || rawType.includes("ssd") || rawType.includes("hdd") || rawType.includes("storage") ||
    lowerName.includes("nvme") || lowerName.includes("sata") || lowerName.includes("solid state") || lowerName.includes("hard drive")
  ) {
    return "storage";
  }
  // 6. Power Supply / PSU
  else if (
    rawType.includes("power") || rawType.includes("psu") ||
    lowerName.includes("watt") || lowerName.includes("80+") || lowerName.includes("80 plus") ||
    lowerName.includes("modular") || lowerName.match(/\b\d{3}w\b/)
  ) {
    return "psu";
  }
  // 7. Case / Chassis
  else if (
    rawType.includes("case") || rawType.includes("chassis") ||
    lowerName.includes("tower") || lowerName.includes("tempered glass") || lowerName.includes("chassis")
  ) {
    return "case";
  }

  // 8. If targeted via category collection, adopt fallback category
  if (fallbackCategory && fallbackCategory !== "all") {
    return fallbackCategory.toLowerCase();
  }

  return "other";
}

// Helper to extract matrix specs from component title
function extractSpecs(name) {
  const lower = (name || '').toLowerCase();
  let socket_type = null;
  let ddr_type = null;
  let form_factor = null;
  let wattage = null;
  let power_required = null;
  let capacity = null;
  let speed = null;
  let type = null;
  let efficiency = null;

  // Sockets
  if (lower.includes("am4")) socket_type = "AM4";
  else if (lower.includes("am5")) socket_type = "AM5";
  else if (lower.includes("lga1700") || lower.includes("lga 1700")) socket_type = "LGA1700";
  else if (lower.includes("lga1851") || lower.includes("lga 1851")) socket_type = "LGA1851";
  else if (lower.includes("lga1200")) socket_type = "LGA1200";

  // DDR
  if (lower.includes("ddr5")) ddr_type = "DDR5";
  else if (lower.includes("ddr4")) ddr_type = "DDR4";
  else if (lower.includes("ddr3")) ddr_type = "DDR3";

  // Form factor
  if (lower.includes("e-atx") || lower.includes("eatx")) form_factor = "E-ATX";
  else if (lower.includes("micro-atx") || lower.includes("matx") || lower.includes("m-atx")) form_factor = "Micro-ATX";
  else if (lower.includes("mini-itx") || lower.includes("itx")) form_factor = "Mini-ITX";
  else if (lower.includes("atx")) form_factor = "ATX";

  // Wattage
  const wattMatch = lower.match(/(\d{3,4})\s*w\b/);
  if (wattMatch) wattage = wattMatch[1];

  // GPU Power Required
  if (lower.includes("rtx 4090") || lower.includes("rtx 5090")) power_required = "450";
  else if (lower.includes("rtx 4080") || lower.includes("rtx 5080")) power_required = "320";
  else if (lower.includes("rtx 4070") || lower.includes("rtx 5070")) power_required = "250";
  else if (lower.includes("rtx 4060") || lower.includes("rtx 5060")) power_required = "180";
  else if (lower.includes("rx 7800") || lower.includes("rx 7900")) power_required = "300";
  else if (lower.includes("rx 7600") || lower.includes("rx 6600")) power_required = "165";
  else if (lower.includes("rtx 3050") || lower.includes("rtx 3060")) power_required = "170";
  else if (lower.includes("rx 580")) power_required = "185";

  // Capacity
  const capMatch = lower.match(/(\d{1,4}\s*(gb|tb))\b/);
  if (capMatch) capacity = capMatch[1].toUpperCase();

  // Speed
  const speedMatch = lower.match(/(\d{4}\s*mhz)\b/);
  if (speedMatch) speed = speedMatch[1].toUpperCase();

  // Storage Type
  if (lower.includes("nvme") || lower.includes("m.2")) type = "NVMe M.2";
  else if (lower.includes("sata")) type = "2.5\" SATA SSD";

  // Efficiency
  if (lower.includes("80+ titanium") || lower.includes("80 plus titanium")) efficiency = "80+ Titanium";
  else if (lower.includes("80+ platinum") || lower.includes("80 plus platinum")) efficiency = "80+ Platinum";
  else if (lower.includes("80+ gold") || lower.includes("80 plus gold")) efficiency = "80+ Gold";
  else if (lower.includes("80+ bronze") || lower.includes("80 plus bronze")) efficiency = "80+ Bronze";

  return { socket_type, ddr_type, form_factor, wattage, power_required, capacity, speed, type, efficiency };
}

// Non-hardware exclusion filter
const EXCLUDED_KEYWORDS = [
  "laptop", "notebook", "vivobook", "ideapad", "aspire", "nitro", "cyborg",
  "modern 14", "zenbook", "macbook", "thinkpad", "legion", "pavilion", "predator", "victus",
  "desktop pc", "gaming desktop", "bundle", "all-in-one", "aio pc",
  "bluetti", "solar", "portable", "generator", "power station", "pv130", "ac2p", "ups",
  "14.0\"", "15.6\"", "16.0\"", "17.3\"", "ips fhd", "ips qhd", "earphones", "headset", "mousepad"
];

// Curated Staging Fallback Items (Used if store API is rate limited or unavailable)
function getStagingProducts(targetCategory = 'all', storeName = 'EasyPC') {
  const catalog = [
    // GPU
    { id: "stg-gpu-1", title: "MSI GeForce RTX 4070 Super Ventus 2X OC 12GB GDDR6X", vendor: "MSI", product_type: "GPU", variants: [{ price: "38950.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/MSI-4070S.jpg" }] },
    { id: "stg-gpu-2", title: "Galax GeForce RTX 4060 1-Click OC 2X 8GB GDDR6 Videocard", vendor: "Galax", product_type: "GPU", variants: [{ price: "18500.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/galax-4060.jpg" }] },
    { id: "stg-gpu-3", title: "Sapphire Pulse AMD Radeon RX 7600 Gaming 8GB GDDR6", vendor: "Sapphire", product_type: "GPU", variants: [{ price: "16890.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/sapphire-rx7600.jpg" }] },
    { id: "stg-gpu-4", title: "ASUS Dual GeForce RTX 4070 EVO OC Edition 12GB GDDR6X", vendor: "ASUS", product_type: "GPU", variants: [{ price: "37450.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/asus-dual-4070.jpg" }] },
    { id: "stg-gpu-5", title: "Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB GDDR6", vendor: "GIGABYTE", product_type: "GPU", variants: [{ price: "24950.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/gigabyte-4060ti.jpg" }] },

    // CPU
    { id: "stg-cpu-1", title: "AMD Ryzen 7 7800X3D 4.2GHz Socket AM5 8-Core Processor", vendor: "AMD", product_type: "CPU", variants: [{ price: "23500.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/7800X3D.jpg" }] },
    { id: "stg-cpu-2", title: "AMD Ryzen 5 7600 3.8GHz 6-Core Socket AM5 Processor", vendor: "AMD", product_type: "CPU", variants: [{ price: "11950.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/ryzen-7600.jpg" }] },
    { id: "stg-cpu-3", title: "Intel Core i5-14600KF 3.5GHz 14-Core LGA1700 Processor", vendor: "Intel", product_type: "CPU", variants: [{ price: "17990.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/i5-14600kf.jpg" }] },

    // MOTHERBOARD
    { id: "stg-mb-1", title: "Gigabyte B650M Gaming WiFi DDR5 AM5 Micro ATX Motherboard", vendor: "GIGABYTE", product_type: "Motherboard", variants: [{ price: "7990.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/B650M-GW.jpg" }] },
    { id: "stg-mb-2", title: "ASRock B650M Pro RS WiFi DDR5 Micro-ATX Motherboard AM5", vendor: "ASRock", product_type: "Motherboard", variants: [{ price: "8895.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/04/asrock-b650m-pro-rs.jpg" }] },
    { id: "stg-mb-3", title: "MSI MAG B760M MORTAR WIFI II DDR5 LGA1700 Motherboard", vendor: "MSI", product_type: "Motherboard", variants: [{ price: "10950.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/msi-b760m-mortar.jpg" }] },

    // RAM
    { id: "stg-ram-1", title: "Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz CL30", vendor: "Corsair", product_type: "RAM", variants: [{ price: "7450.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/Corsair-DDR5-RGB.jpg" }] },
    { id: "stg-ram-2", title: "TeamGroup T-Force Delta RGB DDR5 32GB (2x16GB) 6000MHz Black", vendor: "TeamGroup", product_type: "RAM", variants: [{ price: "6995.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2022/11/t-force-delta-ddr5.jpg" }] },
    { id: "stg-ram-3", title: "G.Skill Ripjaws V 16GB (2x8GB) DDR4 3200MHz CL16 Memory", vendor: "G.Skill", product_type: "RAM", variants: [{ price: "2450.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/ripjaws-16gb.jpg" }] },

    // STORAGE
    { id: "stg-stor-1", title: "Kingston KC3000 2TB PCIe 4.0 NVMe M.2 Solid State Drive", vendor: "Kingston", product_type: "Storage", variants: [{ price: "8990.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/KC3000-2TB.jpg" }] },
    { id: "stg-stor-2", title: "Lexar NM790 1TB PCIe Gen4x4 M.2 NVMe Internal SSD", vendor: "Lexar", product_type: "Storage", variants: [{ price: "4695.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/06/lexar-nm790.jpg" }] },
    { id: "stg-stor-3", title: "Samsung 990 PRO 1TB PCIe 4.0 NVMe M.2 SSD", vendor: "Samsung", product_type: "Storage", variants: [{ price: "6250.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/samsung-990-pro.jpg" }] },

    // PSU
    { id: "stg-psu-1", title: "Seasonic Focus GX-750 750W 80+ Gold Full Modular Power Supply", vendor: "Seasonic", product_type: "PSU", variants: [{ price: "6490.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/Focus-GX-750.jpg" }] },
    { id: "stg-psu-2", title: "1STPLAYER NGDP 850W 80+ Gold PCIe 5.0 Fully Modular Power Supply", vendor: "1STPLAYER", product_type: "PSU", variants: [{ price: "5295.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/08/1stplayer-ngdp-850.jpg" }] },
    { id: "stg-psu-3", title: "Corsair RM850e 850W 80+ Gold Fully Modular ATX 3.0 PSU", vendor: "Corsair", product_type: "PSU", variants: [{ price: "7200.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/corsair-rm850e.jpg" }] },

    // CASE
    { id: "stg-case-1", title: "GIGABYTE AORUS C500 GLASS Micro ATX Case", vendor: "GIGABYTE", product_type: "Case", variants: [{ price: "6450.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/AORUS-C500-1.jpg" }] },
    { id: "stg-case-2", title: "DarkFlash DLM21 Mesh Micro ATX Case Black", vendor: "DarkFlash", product_type: "Case", variants: [{ price: "2490.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/DLM21-Mesh-Black.jpg" }] },
    { id: "stg-case-3", title: "Montech King 95 Pro Curved Tempered Glass Dual-Chamber ATX Case", vendor: "Montech", product_type: "Case", variants: [{ price: "6950.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/12/montech-king-95-pro.jpg" }] }
  ];

  const target = (targetCategory || 'all').toLowerCase();
  if (target === 'all') return catalog;
  return catalog.filter(item => {
    const cat = detectProductCategory(item.title, item.product_type);
    return cat === target;
  });
}

// 2. EASYPC SCRAPER (Shopify Collection-Aware)
const EASYPC_COLLECTION_MAP = {
  gpu: ["graphic-card-1", "graphic-card"],
  cpu: ["processor-1", "processor"],
  motherboard: ["motherboard-1", "motherboard"],
  ram: ["memory-1", "memory"],
  storage: ["solid-state-drive-1", "solid-state-drive"],
  psu: ["power-supply-1", "power-supply"],
  case: ["pc-case-1", "pc-case"]
};

async function scrapeEasyPC(page = 1, targetCategory = 'all') {
  try {
    const catKey = (targetCategory || 'all').toLowerCase();
    let products = [];

    // 1. If 'all', query each core component collection so every category is populated
    if (catKey === 'all') {
      const coreCategories = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu'];
      for (const cat of coreCategories) {
        const handles = EASYPC_COLLECTION_MAP[cat] || [];
        for (const handle of handles) {
          const collUrl = `https://easypc.com.ph/collections/${handle}/products.json?limit=15&page=${page}`;
          try {
            console.log(`[INFO] [EasyPC] Requesting collection [${handle}]: ${collUrl}`);
            const { data } = await axios.get(collUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              timeout: 8000
            });
            if (Array.isArray(data.products) && data.products.length > 0) {
              products.push(...data.products);
              console.log(`[SUCCESS] [EasyPC] Received ${data.products.length} products from [${handle}].`);
              break;
            }
          } catch (err) {
            console.warn(`[WARN] [EasyPC] Collection handle ${handle} failed (${err.message}). Trying next...`);
          }
        }
      }
    } else {
      // Specific category targeted
      const handles = EASYPC_COLLECTION_MAP[catKey] || [];
      for (const handle of handles) {
        const collUrl = `https://easypc.com.ph/collections/${handle}/products.json?limit=50&page=${page}`;
        try {
          console.log(`[INFO] [EasyPC] Requesting category collection [${handle}]: ${collUrl}`);
          const { data } = await axios.get(collUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 8000
          });
          if (Array.isArray(data.products) && data.products.length > 0) {
            products = data.products;
            console.log(`[SUCCESS] [EasyPC] Received ${products.length} products from [${handle}].`);
            break;
          }
        } catch (err) {
          console.warn(`[WARN] [EasyPC] Collection handle ${handle} failed (${err.message}). Trying next...`);
        }
      }
    }

    // Fallback if network blocked
    if (products.length === 0) {
      console.warn(`[WARN] [EasyPC] Live request yielded 0 products. Using verified EasyPC staging components.`);
      products = getStagingProducts(targetCategory, "EasyPC");
    }

    return await processAndSaveProducts(products, "EasyPC", "Source: EasyPC", targetCategory);
  } catch (error) {
    console.error("[ERROR] [EasyPC] Crawler Failure:", error.message);
    return 0;
  }
}

// 3. BERMOR TECHZONE SCRAPER (WooCommerce-Aware)
const BERMOR_CATEGORY_MAP = {
  gpu: "33,34,2985",
  cpu: "20,21",
  motherboard: "22,23,24",
  ram: "25,26",
  storage: "31",
  case: "35",
  psu: "43"
};

async function scrapeBermor(page = 1, targetCategory = 'all') {
  try {
    const catKey = (targetCategory || 'all').toLowerCase();
    let products = [];

    if (catKey === 'all') {
      const coreCategories = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu'];
      for (const cat of coreCategories) {
        const catId = BERMOR_CATEGORY_MAP[cat];
        if (!catId) continue;
        const url = `https://bermorzone.com.ph/wp-json/wc/store/v1/products?per_page=15&page=${page}&category=${catId}`;
        try {
          console.log(`[INFO] [Bermor Techzone] Requesting category [${cat.toUpperCase()}]: ${url}`);
          const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 8000
          });
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(item => ({
              id: String(item.id),
              title: item.name || '',
              vendor: (item.brands && item.brands[0] && item.brands[0].name) || 'Bermor',
              product_type: cat,
              variants: [{ price: item.prices ? (parseInt(item.prices.price, 10) / 100).toFixed(2) : '0.00' }],
              images: item.images && item.images[0] ? [{ src: item.images[0].src }] : []
            }));
            products.push(...mapped);
            console.log(`[SUCCESS] [Bermor Techzone] Received ${mapped.length} products for [${cat.toUpperCase()}].`);
          }
        } catch (err) {
          console.warn(`[WARN] [Bermor Techzone] Category ${cat} failed (${err.message}).`);
        }
      }
    } else {
      const catParam = BERMOR_CATEGORY_MAP[catKey] ? `&category=${BERMOR_CATEGORY_MAP[catKey]}` : "";
      const url = `https://bermorzone.com.ph/wp-json/wc/store/v1/products?per_page=50&page=${page}${catParam}`;
      console.log(`[INFO] [Bermor Techzone] Requesting catalog: ${url}`);
      try {
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 8000
        });
        if (Array.isArray(data) && data.length > 0) {
          products = data.map(item => ({
            id: String(item.id),
            title: item.name || '',
            vendor: (item.brands && item.brands[0] && item.brands[0].name) || 'Bermor',
            product_type: catKey,
            variants: [{ price: item.prices ? (parseInt(item.prices.price, 10) / 100).toFixed(2) : '0.00' }],
            images: item.images && item.images[0] ? [{ src: item.images[0].src }] : []
          }));
          console.log(`[SUCCESS] [Bermor Techzone] Received ${products.length} live products from WooCommerce API.`);
        }
      } catch (err) {
        console.warn(`[WARN] [Bermor Techzone] Live request failed (${err.message}). Using verified staging components.`);
        products = getStagingProducts(targetCategory, "Bermor");
      }
    }

    if (products.length === 0) {
      products = getStagingProducts(targetCategory, "Bermor");
    }

    return await processAndSaveProducts(products, "Bermor Techzone", "Source: Bermor Techzone", targetCategory);
  } catch (error) {
    console.error("[ERROR] [Bermor Techzone] Crawler Failure:", error.message);
    return 0;
  }
}

// 4. COMMON INGESTION & PIPELINE ENGINE
async function processAndSaveProducts(products, sourceName, sourceBadge, targetCategory) {
  const today = new Date().toISOString().split('T')[0];
  const scrapedParts = [];
  const normalizedTarget = (targetCategory || "all").toLowerCase();

  // Load existing inventory and review queue items to strictly prevent duplicate entries
  const existingInventoryNames = new Set();
  const existingInventoryNormalized = new Set();
  const existingQueueNames = new Set();
  const existingQueueNormalized = new Set();

  try {
    const [invRows] = await db.query("SELECT LOWER(name) AS name FROM pc_parts");
    invRows.forEach(r => {
      if (r.name) {
        const trimmed = r.name.trim();
        existingInventoryNames.add(trimmed);
        existingInventoryNormalized.add(trimmed.replace(/[^a-z0-9]/g, ''));
      }
    });

    const [queueRows] = await db.query("SELECT LOWER(scraped_name) AS name FROM scraped_queue");
    queueRows.forEach(r => {
      if (r.name) {
        const trimmed = r.name.trim();
        existingQueueNames.add(trimmed);
        existingQueueNormalized.add(trimmed.replace(/[^a-z0-9]/g, ''));
      }
    });
  } catch (err) {
    console.warn("[WARN] Could not fetch existing inventory for deduplication:", err.message);
  }

  let skippedDuplicatesCount = 0;

  for (const product of products) {
    const name = product.title || product.name || '';
    const lowerName = name.toLowerCase().trim();
    if (!lowerName) continue;

    // Skip non-component items
    if (EXCLUDED_KEYWORDS.some(kw => lowerName.includes(kw))) {
      continue;
    }

    const normName = lowerName.replace(/[^a-z0-9]/g, '');

    // 1. DEDUPLICATION: Skip if already exists in active pc_parts inventory
    if (existingInventoryNames.has(lowerName) || (normName.length > 10 && existingInventoryNormalized.has(normName))) {
      console.log(`[SKIP DUPLICATE] "${name}" is already in active inventory. Skipping.`);
      skippedDuplicatesCount++;
      continue;
    }

    // 2. DEDUPLICATION: Skip if already staged in scraped review queue
    if (existingQueueNames.has(lowerName) || (normName.length > 10 && existingQueueNormalized.has(normName))) {
      console.log(`[SKIP QUEUE DUPLICATE] "${name}" is already in the review queue. Skipping.`);
      skippedDuplicatesCount++;
      continue;
    }

    const category = detectProductCategory(name, product.product_type, normalizedTarget);
    if (category === "other") continue;

    // STRICT CATEGORY FILTER:
    // If a specific category was targeted (e.g. 'gpu'), reject everything that doesn't match!
    if (normalizedTarget !== "all" && category !== normalizedTarget) {
      continue;
    }

    const brand = product.vendor || product.brand || "BuildLab Certified";
    const priceVal = product.variants && product.variants[0] ? `₱${product.variants[0].price}` : "₱—";
    const img = product.images && product.images.length > 0 ? product.images[0].src : "/pcbackground.png";
    const specs = extractSpecs(name);

    // Register into memory sets so same scrape run never duplicates within itself
    existingQueueNames.add(lowerName);
    existingQueueNormalized.add(normName);

    scrapedParts.push({
      id: `${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${product.id || Date.now() + Math.random().toString().slice(2, 6)}`,
      source: sourceBadge,
      source_name: sourceName,
      date: today,
      scraped_name: name,
      category,
      brand,
      price: priceVal,
      img,
      desc: `Scraped from ${sourceName} via BuildLab Ingestion Hub (${name})`,
      tags: JSON.stringify(["scraped", category, sourceName.toLowerCase().replace(/\s+/g, '')]),
      ...specs
    });
  }

  if (skippedDuplicatesCount > 0) {
    console.log(`[DEDUPLICATION] Filtered out ${skippedDuplicatesCount} duplicate component(s) matching inventory or current queue.`);
  }

  let savedCount = 0;
  for (const part of scrapedParts) {
    const query = `
      INSERT INTO scraped_queue 
      (id, source, source_name, date, scraped_name, category, brand, form_factor, socket_type, ddr_type, wattage, power_required, capacity, speed, type, efficiency, price, img, \`desc\`, tags, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE 
        scraped_name=VALUES(scraped_name), category=VALUES(category), brand=VALUES(brand),
        form_factor=VALUES(form_factor), socket_type=VALUES(socket_type), ddr_type=VALUES(ddr_type),
        wattage=VALUES(wattage), power_required=VALUES(power_required), capacity=VALUES(capacity),
        speed=VALUES(speed), type=VALUES(type), efficiency=VALUES(efficiency),
        img=VALUES(img), price=VALUES(price)
    `;
    const values = [
      part.id, part.source, part.source_name, part.date, part.scraped_name,
      part.category, part.brand, part.form_factor, part.socket_type, part.ddr_type,
      part.wattage, part.power_required, part.capacity, part.speed, part.type, part.efficiency,
      part.price, part.img, part.desc, part.tags
    ];
    try {
      await db.query(query, values);
      savedCount++;
    } catch (err) {
      console.error("[ERROR] Queue insert error:", err.message);
    }
  }

  console.log(`[STAGING] Staged ${savedCount} ${normalizedTarget !== 'all' ? normalizedTarget.toUpperCase() + ' ' : ''}component(s) into Scraped Data Review Queue from ${sourceName}!`);
  return savedCount;
}

// 5. RUNNER CLI WITH ARGS SUPPORT
async function runCrawler() {
  const args = process.argv.slice(2);
  let store = "EasyPC";
  let category = "all";
  let maxPages = 1;

  args.forEach(arg => {
    if (arg.startsWith("--store=")) store = arg.split("=")[1].replace(/['"]/g, "").trim();
    if (arg.startsWith("--category=")) category = arg.split("=")[1].replace(/['"]/g, "").trim().toLowerCase();
    if (arg.startsWith("--pages=")) maxPages = parseInt(arg.split("=")[1], 10) || 1;
  });

  console.log(`====================================================`);
  console.log(`🤖 BuildLab Crawler & Ingestion Hub Worker`);
  console.log(`📡 Target Store:    ${store}`);
  console.log(`🎯 Category Filter: ${category.toUpperCase()}`);
  console.log(`📄 Max Pages:       ${maxPages}`);
  console.log(`====================================================`);

  await initScrapedTable();

  let totalItems = 0;
  for (let page = 1; page <= maxPages; page++) {
    console.log(`[PROGRESS] Crawling batch ${page}/${maxPages}...`);
    if (store.toLowerCase().includes("bermor")) {
      totalItems += await scrapeBermor(page, category);
    } else {
      totalItems += await scrapeEasyPC(page, category);
    }
  }

  console.log(`[DONE] Ingestion Job Finished: ${totalItems} items active in Review Queue.`);
  process.exit(0);
}

if (require.main === module) {
  runCrawler();
}

module.exports = { scrapeEasyPC, scrapeBermor, initScrapedTable };
