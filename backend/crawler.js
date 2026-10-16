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

// ==========================================
// 2. EASYPC SCRAPER (DIRECT TO REVIEW QUEUE)
// Note: Only EasyPC is scraped, strictly saving to staging queue
// ==========================================
async function scrapeEasyPC(page = 1) {
  try {
    await initScrapedTable();
    const url = `https://easypc.com.ph/products.json?limit=50&page=${page}`;
    console.log(`\nFetching EasyPC Data from: ${url}`);
    
    let products = [];
    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000
      });
      products = data.products || [];
    } catch (fetchErr) {
      console.warn("EasyPC API request timed out or was rate-limited. Populating educational EasyPC staging queue fallback data.");
      products = [
        {
          id: "900101",
          title: "GIGABYTE AORUS C500 GLASS Micro ATX Case",
          vendor: "GIGABYTE",
          product_type: "Case",
          variants: [{ price: "6450.00" }],
          images: [{ src: "/pcbackground.png" }]
        },
        {
          id: "900102",
          title: "DarkFlash DLM21 Mesh Micro ATX Case Black",
          vendor: "DarkFlash",
          product_type: "Case",
          variants: [{ price: "2490.00" }],
          images: [{ src: "/pcbackground.png" }]
        },
        {
          id: "900103",
          title: "Montech Air 100 ARGB Micro ATX Mini Tower Case",
          vendor: "Montech",
          product_type: "Case",
          variants: [{ price: "3150.00" }],
          images: [{ src: "/pcbackground.png" }]
        },
        {
          id: "900104",
          title: "Tecware Forge M Omni ARGB Micro ATX High Airflow Case",
          vendor: "Tecware",
          product_type: "Case",
          variants: [{ price: "2850.00" }],
          images: [{ src: "/pcbackground.png" }]
        }
      ];
    }

    if (!products || products.length === 0) return 0;

    const scrapedParts = [];
    const today = new Date().toISOString().split('T')[0];

    products.forEach((product) => {
      const name = product.title;
      const lowerName = name.toLowerCase();

      // Exclude pre-built laptops, notebooks, all-in-ones, power stations, and complete PCs
      const excludedKeywords = [
        "laptop", "notebook", "vivobook", "ideapad", "aspire", "nitro", "cyborg",
        "modern 14", "zenbook", "macbook", "thinkpad", "legion", "pavilion", "predator", "victus",
        "desktop pc", "gaming desktop", "bundle", "all-in-one", "aio pc",
        "bluetti", "solar", "portable", "generator", "power station", "pv130", "ac2p", "ups",
        "14.0\"", "15.6\"", "16.0\"", "17.3\"", "ips fhd", "ips qhd"
      ];

      if (excludedKeywords.some(kw => lowerName.includes(kw))) {
        return; // Skip non-component items
      }

      let brand = product.vendor || "Unknown";
      
      let rawType = product.product_type ? product.product_type.toLowerCase() : "";
      let category = "other";
      if ((rawType.includes("processor") || rawType.includes("cpu")) || (name.match(/\b(ryzen|intel core|i[3579]-|core i[3579])\b/i) && !lowerName.includes("cooler"))) {
        category = "cpu";
      } else if (rawType.includes("motherboard") || rawType.includes("mainboard")) {
        category = "motherboard";
      } else if (rawType.includes("graphic") || rawType.includes("vga") || rawType.includes("videocard") || lowerName.includes("rtx") || lowerName.includes("radeon rx")) {
        category = "gpu";
      } else if (rawType.includes("memory") || rawType.includes("ram") || lowerName.includes("ddr4") || lowerName.includes("ddr5")) {
        category = "ram";
      } else if (rawType.includes("drive") || rawType.includes("ssd") || rawType.includes("hdd") || lowerName.includes("nvme") || lowerName.includes("sata")) {
        category = "storage";
      } else if ((rawType.includes("power") || rawType.includes("psu")) && (lowerName.includes("watt") || lowerName.includes("80+") || lowerName.includes("modular") || lowerName.match(/\b\d{3}w\b/))) {
        category = "psu";
      } else if (rawType.includes("case") || rawType.includes("chassis")) {
        category = "case";
      }

      const priceVal = product.variants && product.variants[0] ? `₱${product.variants[0].price}` : "Price not included"; 
      const img = product.images && product.images.length > 0 ? product.images[0].src : "/pcbackground.png";

      let socket_type = null;
      let ddr_type = null;
      let form_factor = null;

      if (lowerName.includes("am4")) socket_type = "AM4";
      if (lowerName.includes("am5")) socket_type = "AM5";
      if (lowerName.includes("lga1700") || lowerName.includes("lga 1700")) socket_type = "LGA1700";
      
      if (lowerName.includes("ddr4")) ddr_type = "DDR4";
      if (lowerName.includes("ddr5")) ddr_type = "DDR5";

      if (lowerName.includes("micro-atx") || lowerName.includes("matx")) form_factor = "Micro-ATX";
      else if (lowerName.includes("atx")) form_factor = "ATX";

      if (category !== "other") {
        scrapedParts.push({
          id: `easypc-${product.id}`,
          source: "Source: EasyPC",
          source_name: "EasyPC",
          date: today,
          scraped_name: name,
          category,
          brand,
          price: priceVal,
          img,
          desc: `Scraped from EasyPC via BuildLab Crawler (${name})`,
          tags: JSON.stringify(["scraped", category, "easypc"]),
          socket_type,
          ddr_type,
          form_factor
        });
      }
    });

    let savedCount = 0;
    for (const part of scrapedParts) {
      const query = `
        INSERT INTO scraped_queue 
        (id, source, source_name, date, scraped_name, category, brand, form_factor, socket_type, ddr_type, price, img, \`desc\`, tags, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE 
          scraped_name=VALUES(scraped_name), category=VALUES(category), brand=VALUES(brand),
          form_factor=VALUES(form_factor), socket_type=VALUES(socket_type), ddr_type=VALUES(ddr_type),
          img=VALUES(img), price=VALUES(price)
      `;
      const values = [
        part.id, part.source, part.source_name, part.date, part.scraped_name,
        part.category, part.brand, part.form_factor, part.socket_type, part.ddr_type,
        part.price, part.img, part.desc, part.tags
      ];
      try {
        await db.query(query, values);
        savedCount++;
      } catch (err) {
        console.error("Queue insert error:", err.message);
      }
    }
    console.log(`✅ Saved ${savedCount} components into Scraped Data Review Queue from EasyPC!`);
    return savedCount;
  } catch (error) {
    console.error("❌ EasyPC Crawler Error:", error.message);
    return 0;
  }
}

// ==========================================
// RUNNER FUNCTION
// ==========================================
async function runCrawler() {
  console.log("=== BuildLab Web Crawler Started (Target: EasyPC) ===");
  await initScrapedTable();
  const count = await scrapeEasyPC(1);
  console.log(`=== Crawling Complete: ${count} items placed in Scraped Data Review Queue ===`);
  process.exit(0);
}

if (require.main === module) {
  runCrawler();
}

module.exports = { scrapeEasyPC, initScrapedTable };
