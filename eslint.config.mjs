import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * FRONT_ARCHITECTURE v1.2 § 4 "레이어 규칙"을 코드로 강제한다.
 * 의존 방향: app → features → components/ui · lib · types
 * 리뷰어의 기억력이 아니라 ESLint가 경계를 지킨다.
 *
 * 관리자 공통 인프라는 features/admin 이 아니라 components/admin 에 있다(v1.1).
 * 덕분에 feature 간 import 예외는 "자기 자신" 하나뿐이다.
 */
const FEATURES = ["projects", "studies", "events", "members", "settings"];

/** features/a 가 features/b 를 직접 import 하는 것을 막는다. */
const crossFeatureZones = FEATURES.map((feature) => ({
  target: `./src/features/${feature}`,
  from: "./src/features",
  except: [`./${feature}`],
  message:
    "features 간 직접 import 금지. 관리자 공통 인프라는 components/admin, 그 밖의 공통 코드는 components·lib 로 올리고, 두 도메인이 섞이는 화면은 app 에서 조합하세요.",
}));

const layerZones = [
  {
    target: "./src/components",
    from: ["./src/features", "./src/app"],
    message: "components 는 도메인을 몰라야 합니다. 역방향 import 금지.",
  },
  {
    target: "./src/components/ui",
    from: [
      "./src/data",
      "./src/types/api.ts",
      "./src/types/request.ts",
      "./src/lib/api",
      "./src/constants/labels.ts",
    ],
    message:
      "components/ui 는 도메인 지식이 없는 UI 원자입니다. API 호출(lib/api)·도메인 타입·도메인 라벨(constants/labels) import 금지.",
  },
  {
    target: "./src/app/api",
    from: "./src/features",
    message:
      "app/api(BFF) 에 도메인 로직 금지. 쿠키 처리·프록시·재검증만 두고 lib·constants·types 만 씁니다.",
  },
  {
    target: "./src/lib",
    from: ["./src/features", "./src/components", "./src/app", "./src/data"],
    message: "lib 은 순수 함수와 외부 경계 어댑터만 둡니다. React 컴포넌트·도메인 import 금지.",
  },
  {
    target: "./src/hooks",
    from: ["./src/features", "./src/components", "./src/app"],
    message:
      "공통 hooks 는 도메인을 몰라야 합니다. 관리자 전용 훅은 components/admin/hooks 에 둡니다.",
  },
  {
    target: ["./src/types", "./src/constants", "./src/data"],
    from: ["./src/app", "./src/features", "./src/components", "./src/lib", "./src/hooks"],
    message: "types · constants · data 에는 값과 타입만 둡니다. 로직을 import 하지 마세요.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    name: "gdgoc/boundaries",
    rules: {
      "import/no-restricted-paths": ["error", { zones: [...layerZones, ...crossFeatureZones] }],
      // 2단계 이상 상위 경로 대신 @/* 별칭을 쓴다.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "2단계 이상 상위 경로 대신 @/* 별칭을 사용하세요.",
            },
          ],
        },
      ],
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "next/**", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["react", "next/**"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Prettier 와 충돌하는 포맷 규칙을 끈다. 항상 마지막.
  prettier,
]);

export default eslintConfig;
