// SCRAPED PRODUCT NAME / MODEL / QUICK-SPEC PARSERS
// Turns raw catalog titles ("GIGABYTE GP-P750GM 750W 80+ Gold
// Power Supply") into review-queue friendly metadata:
//   { brand, model, productName }  →  "GIGABYTE" / "GP-P750GM"

const KNOWN_BRANDS = [
  "Gigabyte", "ASUS", "ASRock", "MSI", "Intel", "AMD", "Palit", "Sapphire",
  "Zotac", "Gainward", "Galax", "EVGA", "PNY", "XFX", "Colorful", "Inno3D",
  "Corsair", "Kingston", "Crucial", "Samsung", "Western Digital", "Seagate", "Lexar",
  "TeamGroup", "Adata", "XPG", "Silicon Power", "Patriot", "G.Skill", "Klevv", "Kingspec",
  "Thermaltake", "CoolerMaster", "Cooler Master", "DeepCool", "Noctua", "NZXT", "Lian Li",
  "Phanteks", "Montech", "DarkFlash", "Tecware", "Antec", "SilverStone", "Xigmatek",
  "Seasonic", "1STPlayer", "FSP", "Cougar", "Rakk", "Axgon", "Redragon", "Walker",
  "Lenovo", "HP", "Dell", "Acer", "Logitech", "Razer", "Edifier", "Kyzen", "Thunder"
];

const GENERIC_TOKENS = new Set([
  // category words
  "ssd", "hdd", "nvme", "sata", "m.2", "m2", "gpu", "graphics", "graphic", "card",
  "video", "motherboard", "mainboard", "processor", "cpu", "power", "supply", "psu",
  "case", "chassis", "casing", "tower", "memory", "ram", "dimm", "desktop", "aio",
  "cooler", "cooling", "air", "liquid", "water", "unit", "drive",
  // form-factor words
  "atx", "e-atx", "eatx", "micro-atx", "matx", "m-atx", "mini-itx", "itx", "xl-atx",
  "dtx", "full", "mid", "ultra", "super", "mini",
  // colour words
  "black", "white", "silver", "gray", "grey", "red", "blue", "gold", "bronze",
  "platinum", "titanium", "pink", "green", "purple",
  // misc marketing filler
  "pc", "kit", "set", "laptop", "game", "gaming-desktop",
  "socket", "fully", "modular", "internal", "solid", "state",
  "curved", "tempered", "glass", "dual-chamber", "mesh", "micro"
]);

const SPEC_TOKEN_PATTERNS = [
  /^\d+(\.\d+)?(tb|gb)$/i,        // 32GB / 1TB
  /^\d+w$/i,                      // 750W / 65W
  /^\d+(\.\d+)?(mhz|mt\/s|mbps|gb\/s|rpm|ghz)$/i,
  /^\d+-?(core|thread)$/i,        // 6-Core
  /^\d+x\d+(gb)?$/i,              // 2x16GB
  /^g?ddr\d(x)?(-\d+)?$/i,        // DDR5 / GDDR6X / DDR5-5600
  /^cl\d+$/i,                     // CL30
  /^pci-?e?$/i,                   // PCIe
  /^gen\d+x\d+$/i,                // Gen4x4
  /^lga\d+$/i,                    // LGA1700
  /^am\d$/i,                      // AM5
  /^\d+\.\d$/,                    // 4.0 / 5.0 (PCIe ratings)
  /^\d+mm$/i,                     // fan sizes
  /^\d+pin$/i
];

const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isJunkToken = (token = "") =>
  GENERIC_TOKENS.has(token.toLowerCase()) ||
  SPEC_TOKEN_PATTERNS.some((rx) => rx.test(token));

/**
 * Parse a scraped catalog title into brand + model.
 * brand:  DB vendor field first, fallback to a known brand found in the title.
 * model:  everything after the brand, minus wattage / capacity / efficiency /
 *         form-factor / marketing filler tokens.
 */
export function parseProductMeta(item = {}) {
  const name = (item.scraped_name || item.scrapedName || item.name || "").trim();
  if (!name) return { brand: "", model: "", productName: "" };

  // 1. Resolve brand (never trust the "BuildLab Certified" filler default)
  let brand = "";
  const dbBrand = (item.brand || "").trim();
  if (dbBrand && !/buildlab/i.test(dbBrand)) {
    brand = dbBrand;
  } else {
    const found = KNOWN_BRANDS.find((b) =>
      new RegExp(`^${escapeRegex(b)}\\b`, "i").test(name)
    );
    brand = found || name.split(/\s+/)[0] || "Generic";
  }

  // 2. Extract efficiency phrases before tokenizing ("80+ Gold", "80 Plus Gold")
  let remainder = name.replace(
    /\b80\s*\+?\s*(plus)?\s*(gold|bronze|silver|platinum|titanium)\b/gi,
    " "
  );

  // 3. Remove the first standalone occurrence of the brand from the title
  //    (handles spaced variants too: "Cooler Master" vs "CoolerMaster")
  const brandVariants = [brand, brand.replace(/\s+/g, "")].filter(Boolean);
  for (const variant of brandVariants) {
    const brandRx = new RegExp(`(^|\\s)${escapeRegex(variant)}\\b`, "i");
    if (brandRx.test(remainder)) {
      remainder = remainder.replace(brandRx, " ");
      break;
    }
  }

  // 4. Tokenize and drop spec / markup tokens
  const modelTokens = remainder
    .split(/\s+/)
    .filter((t) => t && !isJunkToken(t.replace(/^[,()-]+|[,()-]+$/g, "") || ""));

  let model = modelTokens.join(" ").trim();
  if (!model) model = name; // never leave the model empty — surface the raw title

  return {
    brand: brand.trim(),
    model,
    productName: `${brand.trim()} ${model}`.trim()
  };
}

/**
 * Quick specs line for the review queue.
 * Prefers the structured fields the crawler extracted, then falls back to
 * regex pulls straight from the title so the specs cell is rarely empty.
 */
export function buildQuickSpecs(item = {}) {
  const cat = (item.category || "").toLowerCase();
  const name = item.scraped_name || item.scrapedName || item.name || "";
  const specs = [];
  const push = (v) => {
    const s = (v === 0 ? "" : v || "").toString().trim();
    if (s && !specs.includes(s)) specs.push(s);
  };

  const nameCap = (/\b(\d+\.?\d*)(TB|GB)\b/i.exec(name) || [])[0];
  const wattMatch = /\b(\d{2,4})W\b/i.exec(name);
  const nameWatt = wattMatch ? `${wattMatch[1]}W` : "";
  const nameSpeed = (/\b\d{3,5}\s*(MHz|MT\/s)\b/.exec(name) || [])[0];
  const nameCores = (/\b(\d+)[- ]Core\b/i.exec(name) || [])[0];
  const nameFormFactor =
    /\b(micro|e|super)[- ]?atx\b/i.exec(name)?.[0] ||
    /\bmini[- ]?itx\b/i.exec(name)?.[0] ||
    /\b(mid|full)[- ]tower\b/i.exec(name)?.[0] ||
    /\batx\b/i.exec(name)?.[0] ||
    "";

  switch (cat) {
    case "cpu":
      push(item.socket_type);
      push(nameCores);
      push(item.wattage ? `${item.wattage}W` : nameWatt);
      break;
    case "motherboard":
      push(item.socket_type);
      push(item.ddr_type);
      push(item.form_factor || nameFormFactor);
      break;
    case "ram":
      push(item.ddr_type);
      push(item.capacity || nameCap);
      push(item.speed || nameSpeed);
      break;
    case "storage":
      push(item.capacity || nameCap);
      push(item.type);
      break;
    case "gpu":
      push(item.capacity || nameCap);
      push(item.power_required ? `${item.power_required}W TDP` : "");
      push(nameSpeed);
      break;
    case "psu":
      push(item.wattage ? `${item.wattage}W` : nameWatt);
      push(item.efficiency);
      break;
    case "case":
      push(item.form_factor || nameFormFactor);
      break;
    default:
      break;
  }

  return specs.slice(0, 3);
}

export default { parseProductMeta, buildQuickSpecs };
