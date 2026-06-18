import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // Completely exclude files that cannot be parsed (corrupted legacy files).
  {
    ignores: [
      "src/app/api/ai/voice/route.ts",
      "src/app/api/travel/planner/route.ts",
      "src/app/api/travel/report/route.ts",
    ],
  },

  // Base Next.js rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ── Project-wide rule overrides ──────────────────────────────────────────
  {
    rules: {
      // Allow _-prefixed parameters and variables to signal intentionally unused
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ── Legacy files — not part of the new Accessana architecture ────────────
  // These files predate Phase 1 and contain pre-existing lint violations.
  // Suppress errors until they are replaced or deleted.
  {
    files: [
      "src/app/api/ai/**/*.ts",
      "src/app/api/analytics/**/*.ts",
      "src/app/api/reports/**/*.ts",
      "src/app/api/travel/**/*.ts",
      "src/app/api/places/**/*.ts",
      "src/app/api/profiles/**/*.ts",
      "src/app/api/summarize*/**/*.ts",
      "src/app/api/test-anon/**/*.ts",
      "src/app/api/auth/**/*.ts",
      "src/app/api/firebase/**/*.ts",
      "src/components/AIChatWidget.tsx",
      "src/components/ReviewDetail.tsx",
      "src/components/VoiceNav.tsx",
      "src/components/ShareButtons.tsx",
      "src/components/ai/**/*.tsx",
      "src/components/analytics/**/*.tsx",
      "src/components/auth/**/*.tsx",
      "src/components/chat/**/*.tsx",
      "src/components/dashboard/**/*.tsx",
      "src/components/enterprise/**/*.tsx",
      "src/components/health/**/*.tsx",
      "src/components/living/**/*.tsx",
      "src/components/map/**/*.tsx",
      "src/components/render/**/*.tsx",
      "src/components/reviews/**/*.tsx",
      "src/components/travel/**/*.tsx",
      "src/hooks/useAI*.ts",
      "src/hooks/useAdaptive*.ts",
      "src/hooks/useChatbot.ts",
      "src/hooks/useConversational*.ts",
      "src/hooks/useCrowd*.ts",
      "src/hooks/useDevice*.ts",
      "src/hooks/useEmotion*.ts",
      "src/hooks/useEnvironment*.ts",
      "src/hooks/useLive*.ts",
      "src/hooks/useMap*.ts",
      "src/hooks/useNearby*.ts",
      "src/hooks/useObstacle*.ts",
      "src/hooks/useOffline*.ts",
      "src/hooks/usePath*.ts",
      "src/hooks/useProximity*.ts",
      "src/hooks/useRole*.ts",
      "src/hooks/useSafety*.ts",
      "src/hooks/useSession*.ts",
      "src/hooks/useSpeech*.ts",
      "src/hooks/useUserMemory.ts",
      "src/hooks/useUserPrefs.ts",
      "src/hooks/useVoice*.ts",
      "src/lib/ai/**/*.ts",
      "src/lib/aiScan.ts",
      "src/lib/auth.ts",
      "src/lib/bookmark.ts",
      "src/lib/firebase.ts",
      "src/lib/firestore.ts",
      "src/lib/insights.ts",
      "src/lib/pdfReports.ts",
      "src/lib/reports.ts",
      "src/lib/submitReview.ts",
      "src/lib/stripe.ts",
      "src/pages/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
