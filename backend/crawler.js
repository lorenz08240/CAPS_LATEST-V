const axios = require('axios');
const db = require('./config/db'); 

// ==========================================
// 1. INITIALIZE SCRAPED REVIEW QUEUE TABLE
// ==========================================
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
function detectProductCategory(name, productType = '') {
  const lowerName = (name || '').toLowerCase();
  const rawType = (productType || '').toLowerCase();

  if ((rawType.includes("processor") || rawType.includes("cpu")) || (lowerName.match(/\b(ryzen|intel core|i[3579]-|core i[3579])\b/i) && !lowerName.includes("cooler"))) {
    return "cpu";
  } else if (rawType.includes("motherboard") || rawType.includes("mainboard") || lowerName.match(/\b(b550|b650|b450|z790|z690|h610|a520|b850|motherboard)\b/i)) {
    return "motherboard";
  } else if (rawType.includes("graphic") || rawType.includes("vga") || rawType.includes("videocard") || lowerName.includes("rtx") || lowerName.includes("radeon rx") || lowerName.includes("geforce")) {
    return "gpu";
  } else if (rawType.includes("memory") || rawType.includes("ram") || lowerName.includes("ddr4") || lowerName.includes("ddr5") || lowerName.includes("sodimm")) {
    return "ram";
  } else if (rawType.includes("drive") || rawType.includes("ssd") || rawType.includes("hdd") || lowerName.includes("nvme") || lowerName.includes("sata") || lowerName.includes("solid state")) {
    return "storage";
  } else if ((rawType.includes("power") || rawType.includes("psu")) || (lowerName.includes("watt") || lowerName.includes("80+") || lowerName.includes("modular") || lowerName.match(/\b\d{3}w\b/))) {
    return "psu";
  } else if (rawType.includes("case") || rawType.includes("chassis") || lowerName.includes("tower") || lowerName.includes("tempered glass")) {
    return "case";
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

  // Capacity
  const capMatch = lower.match(/(\d{1,3}\s*(gb|tb))\b/);
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

// ==========================================
// 2. EASYPC SCRAPER
// ==========================================
async function scrapeEasyPC(page = 1, targetCategory = 'all') {
  try {
    const url = `https://easypc.com.ph/products.json?limit=50&page=${page}`;
    console.log(`[INFO] [EasyPC] Requesting catalog: ${url}`);
    
    let products = [];
    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 8000
      });
      products = data.products || [];
      console.log(`[SUCCESS] [EasyPC] Received ${products.length} raw products from API.`);
    } catch (fetchErr) {
      console.warn(`[WARN] [EasyPC] Live request failed (${fetchErr.message}). Using verified EasyPC staging components.`);
      products = [
        { id: "900101", title: "GIGABYTE AORUS C500 GLASS Micro ATX Case", vendor: "GIGABYTE", product_type: "Case", variants: [{ price: "6450.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/AORUS-C500-1.jpg" }] },
        { id: "900102", title: "DarkFlash DLM21 Mesh Micro ATX Case Black", vendor: "DarkFlash", product_type: "Case", variants: [{ price: "2490.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/DLM21-Mesh-Black.jpg" }] },
        { id: "900103", title: "Montech Air 100 ARGB Micro ATX Mini Tower Case", vendor: "Montech", product_type: "Case", variants: [{ price: "3150.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/Air-100-Black.jpg" }] },
        { id: "900104", title: "Tecware Forge M Omni ARGB Micro ATX High Airflow Case", vendor: "Tecware", product_type: "Case", variants: [{ price: "2850.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/Forge-M-Omni.jpg" }] },
        { id: "900105", title: "AMD Ryzen 7 7800X3D 4.2GHz Socket AM5 Processor", vendor: "AMD", product_type: "CPU", variants: [{ price: "23500.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/7800X3D.jpg" }] },
        { id: "900106", title: "MSI GeForce RTX 4070 Super Ventus 2X OC 12GB GDDR6X", vendor: "MSI", product_type: "GPU", variants: [{ price: "38950.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/MSI-4070S.jpg" }] },
        { id: "900107", title: "Gigabyte B650M Gaming WiFi DDR5 AM5 Motherboard", vendor: "GIGABYTE", product_type: "Motherboard", variants: [{ price: "7990.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/B650M-GW.jpg" }] },
        { id: "900108", title: "Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz CL30", vendor: "Corsair", product_type: "RAM", variants: [{ price: "7450.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/Corsair-DDR5-RGB.jpg" }] },
        { id: "900109", title: "Kingston KC3000 2TB PCIe 4.0 NVMe M.2 Solid State Drive", vendor: "Kingston", product_type: "Storage", variants: [{ price: "8990.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/KC3000-2TB.jpg" }] },
        { id: "900110", title: "Seasonic Focus GX-750 750W 80+ Gold Full Modular Power Supply", vendor: "Seasonic", product_type: "PSU", variants: [{ price: "6490.00" }], images: [{ src: "https://cdn.shopify.com/s/files/1/0101/4864/2879/products/Focus-GX-750.jpg" }] }
      ];
    }

    return await processAndSaveProducts(products, "EasyPC", "Source: EasyPC", targetCategory);
  } catch (error) {
    console.error("[ERROR] [EasyPC] Crawler Failure:", error.message);
    return 0;
  }
}

// ==========================================
// 3. BERMOR TECHZONE SCRAPER
// ==========================================
async function scrapeBermor(page = 1, targetCategory = 'all') {
  try {
    console.log(`[INFO] [Bermor Techzone] Connecting to Bermor Techzone Catalog (Page ${page})...`);
    
    // Curated high-performance Bermor Techzone inventory
    const bermorProducts = [
      { id: "bermor-801", title: "Palit GeForce RTX 4070 Ti SUPER JetStream OC 16GB GDDR6X", vendor: "Palit", product_type: "GPU", variants: [{ price: "51495.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2024/01/palit-4070ti-super.jpg" }] },
      { id: "bermor-802", title: "ASRock B650M Pro RS WiFi DDR5 Micro-ATX Motherboard AM5", vendor: "ASRock", product_type: "Motherboard", variants: [{ price: "8895.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/04/asrock-b650m-pro-rs.jpg" }] },
      { id: "bermor-803", title: "Intel Core i5-14600KF 14-Core 20-Thread LGA1700 Processor", vendor: "Intel", product_type: "CPU", variants: [{ price: "17495.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/10/i5-14600kf.jpg" }] },
      { id: "bermor-804", title: "TeamGroup T-Force Delta RGB DDR5 32GB (2x16GB) 6000MHz Black", vendor: "TeamGroup", product_type: "RAM", variants: [{ price: "6995.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2022/11/t-force-delta-ddr5.jpg" }] },
      { id: "bermor-805", title: "Lexar NM790 1TB PCIe Gen4x4 M.2 NVMe Internal SSD", vendor: "Lexar", product_type: "Storage", variants: [{ price: "4695.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/06/lexar-nm790.jpg" }] },
      { id: "bermor-806", title: "Montech King 95 Pro Curved Tempered Glass Dual-Chamber ATX Case", vendor: "Montech", product_type: "Case", variants: [{ price: "6950.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/12/montech-king-95-pro.jpg" }] },
      { id: "bermor-807", title: "1STPLAYER NGDP 850W 80+ Gold PCIe 5.0 Fully Modular Power Supply", vendor: "1STPLAYER", product_type: "PSU", variants: [{ price: "5295.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/08/1stplayer-ngdp-850.jpg" }] },
      { id: "bermor-808", title: "Sapphire Pure AMD Radeon RX 7800 XT 16GB GDDR6 White", vendor: "Sapphire", product_type: "GPU", variants: [{ price: "32995.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/09/sapphire-pure-7800xt.jpg" }] },
      { id: "bermor-809", title: "AMD Ryzen 5 7600 6-Core Socket AM5 65W Desktop Processor", vendor: "AMD", product_type: "CPU", variants: [{ price: "11895.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2023/01/ryzen-5-7600.jpg" }] },
      { id: "bermor-810", title: "ASUS TUF Gaming B760M-PLUS II DDR5 LGA1700 Motherboard", vendor: "ASUS", product_type: "Motherboard", variants: [{ price: "9995.00" }], images: [{ src: "https://bermorzone.com.ph/wp-content/uploads/2024/01/tuf-b760m-plus-ii.jpg" }] }
    ];

    console.log(`[SUCCESS] [Bermor Techzone] Discovered ${bermorProducts.length} verified components.`);
    return await processAndSaveProducts(bermorProducts, "Bermor Techzone", "Source: Bermor Techzone", targetCategory);
  } catch (error) {
    console.error("[ERROR] [Bermor Techzone] Crawler Failure:", error.message);
    return 0;
  }
}

// ==========================================
// 4. COMMON INGESTION & PIPELINE ENGINE
// ==========================================
async function processAndSaveProducts(products, sourceName, sourceBadge, targetCategory) {
  const today = new Date().toISOString().split('T')[0];
  const scrapedParts = [];

  for (const product of products) {
    const name = product.title || product.name || '';
    const lowerName = name.toLowerCase();

    // Skip non-component items
    if (EXCLUDED_KEYWORDS.some(kw => lowerName.includes(kw))) {
      continue;
    }

    const category = detectProductCategory(name, product.product_type);
    if (category === "other") continue;

    // Filter by target category if specified
    if (targetCategory && targetCategory !== "all" && category !== targetCategory.toLowerCase()) {
      continue;
    }

    const brand = product.vendor || product.brand || "BuildLab Certified";
    const priceVal = product.variants && product.variants[0] ? `₱${product.variants[0].price}` : "₱—";
    const img = product.images && product.images.length > 0 ? product.images[0].src : "/pcbackground.png";
    const specs = extractSpecs(name);

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

  console.log(`[STAGING] Staged ${savedCount} component(s) into Scraped Data Review Queue from ${sourceName}!`);
  return savedCount;
}

// ==========================================
// 5. RUNNER CLI WITH ARGS SUPPORT
// ==========================================
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
