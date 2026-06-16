import fs from "fs";
import path from "path";

const requiredStructure = {
  "src/components": [
    "ai",
    "analytics",
    "health",
    "living",
    "travel",
    "pro",
    "government",
    "education",
    "enterprise",
    "foundation",
  ],
  "src/hooks": ["useAIScan.ts", "useAIInsights.ts", "useAIAnalytics.ts"],
  "src/app/api/ai": ["scan", "insights", "report", "render"],
  "src/lib": ["firebase.ts", "utils.ts"],
};

const placeholder = (name: string) => `
export default function ${name}() {
  return <div>${name} placeholder</div>;
}
`;

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Created missing directory:", dir);
  }
}

function ensureFileExists(file: string, content = "") {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content.trim());
    console.log("📝 Created missing file:", file);
  }
}

console.log("🔍 Verifying Accessly project structure...\n");

for (const [base, entries] of Object.entries(requiredStructure)) {
  const basePath = path.join(process.cwd(), base);
  ensureDirExists(basePath);

  for (const entry of entries) {
    const fullPath = path.join(basePath, entry);

    if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      ensureFileExists(fullPath, placeholder(entry.replace(/\..+$/, "")));
    } else {
      ensureDirExists(fullPath);
    }
  }
}

console.log("\n✅ Accessly structure verification complete!");
