// Single source of truth for public "About Us" team content.
//
// This file is committed to git, so `git pull` actually delivers profile
// edits and photo URLs. The MySQL `team_members` table is deliberately NOT
// used by the app anymore — see AGENTS.md at the repository root.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data", "team-members.json");

const parseJSON = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed !== null && typeof parsed === "object" ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }
  return fallback;
};

const parseArray = (value) => {
  const parsed = parseJSON(value, []);
  return Array.isArray(parsed) ? parsed : [];
};

const parseObject = (value) => {
  const parsed = parseJSON(value, {});
  return parsed && !Array.isArray(parsed) && typeof parsed === "object" ? parsed : {};
};

const normalize = (raw) => {
  const member = { ...(raw || {}) };
  return {
    ...member,
    id: String(member.id || ""),
    name: String(member.name || ""),
    designation: String(member.designation || ""),
    codename: member.codename || "",
    role_category: member.role_category || "core",
    avatar_badge: member.avatar_badge || "DEV",
    photo_url: member.photo_url || "",
    highlight: member.highlight || "",
    bio: member.bio || "",
    key_contributions: parseArray(member.key_contributions),
    tech_stack: parseArray(member.tech_stack),
    rig_specs: parseObject(member.rig_specs),
    fav_tip: member.fav_tip || "",
    github: member.github || "https://github.com",
    linkedin: member.linkedin || "https://linkedin.com",
    sort_order: Number.isFinite(Number(member.sort_order)) ? Number(member.sort_order) : 99
  };
};

const readTeam = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("team-members.json must contain an array");
    return parsed
      .map(normalize)
      .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
  } catch (err) {
    console.error("Failed to read team content store:", err.message);
    return [];
  }
};

const writeTeam = (members) => {
  const normalized = (members || []).map(normalize);
  const tempFile = `${DATA_FILE}.tmp`;
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(tempFile, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, DATA_FILE);
  return normalized;
};

const getMember = (id) => {
  const found = readTeam().find((m) => m.id === String(id));
  return found || null;
};

const upsertMember = (id, patch) => {
  const members = readTeam();
  const index = members.findIndex((m) => m.id === String(id));
  if (index === -1) return null;
  members[index] = normalize({ ...members[index], ...(patch || {}), id: members[index].id });
  writeTeam(members);
  return members[index];
};

const createMember = (data) => {
  const members = readTeam();
  const member = normalize(data);
  if (!member.id) throw Object.assign(new Error("A member id is required"), { code: "MISSING_ID" });
  if (members.some((m) => m.id === member.id)) {
    throw Object.assign(new Error(`Member '${member.id}' already exists`), { code: "DUPLICATE_ID" });
  }
  members.push(member);
  writeTeam(members);
  return member;
};

const deleteMember = (id) => {
  const members = readTeam();
  const next = members.filter((m) => m.id !== String(id));
  if (next.length === members.length) return false;
  writeTeam(next);
  return true;
};

module.exports = {
  DATA_FILE,
  normalize,
  readTeam,
  writeTeam,
  getMember,
  upsertMember,
  createMember,
  deleteMember
};
