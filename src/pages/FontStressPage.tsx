import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Exaggerated Theranest-like font pressure for Chromeleon repros.
 *
 * Goal: push harder than production Theranest so a fresh Windows-persona
 * Chromeleon pod is more likely to hitch inside ShapeText / bundled-font
 * fallback resolution.
 *
 * Knobs turned up:
 * - 200+ synthetic FontFaces (Theranest ~76)
 * - Many Google + icon webfonts still loading during layout
 * - Dense mixed-script / emoji / symbol text on generic sans-serif
 * - Large mutating clients table (default 80 rows)
 * - Optional nuclear glyph flood + auto-mutate
 */

const TARGET_FONT_FACE_COUNT = 200;
const DEFAULT_ROW_COUNT = 80;
const MAX_ROW_COUNT = 200;
const NUCLEAR_SPAN_COUNT = 240;

const GOOGLE_FONT_FAMILIES = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Source Sans 3",
  "Nunito",
  "Poppins",
  "Inter",
  "Raleway",
  "Work Sans",
  "Oswald",
  "Rubik",
  "Manrope",
  "DM Sans",
  "Noto Sans",
  "Noto Serif",
  "Noto Sans JP",
  "Noto Sans SC",
  "Noto Sans TC",
  "Noto Sans KR",
  "Noto Sans Devanagari",
  "Noto Sans Thai",
  "Noto Sans Arabic",
  "Noto Sans Hebrew",
  "Noto Sans Armenian",
  "Noto Sans Georgian",
  "Noto Sans Ethiopic",
  "Noto Sans Myanmar",
] as const;

const MIXED_SCRIPTS = [
  "Hello world",
  "你好世界",
  "こんにちは",
  "안녕하세요",
  "नमस्ते",
  "สวัสดี",
  "مرحبا",
  "שלום",
  "Привет",
  "Γειά σου",
  "Հայերեն",
  "ქართული",
  "አማርኛ",
  "မြန်မာ",
  "Xin chào",
  "ภาษาไทย + हिन्दी + العربية",
] as const;

const EMOJI_BURST =
  "👨‍👩‍👧 🎉 ✅ ✍️ 🏁 🔍 📋 🗓️ ⭐ 🔄 ⚠ 📁 ✉ ◆ ● ✓ ∞ ≈ 💼 🧠 💊 🏥 📝 📊";

const SYMBOL_BURST = "★ ◆ ● ✓ ⚠ ∞ ≈ § ¶ † ‡ • ‥ … ※ △ ▲ ▼ ◆ ■ □ ○ ●";

type ClientRow = {
  id: number;
  name: string;
  status: string;
  clinician: string;
  notes: string;
  badges: string;
  family: string;
  weight: number;
  style: "normal" | "italic";
};

const SEED_CLIENTS: Array<{
  name: string;
  status: string;
  clinician: string;
  notes: string;
  badges: string;
}> = [
  {
    name: "Alex Rivera",
    status: "Active ✅",
    clinician: "Dr. Kim",
    notes: "Intake complete · follow-up scheduled",
    badges: "📋 🗓️ ★",
  },
  {
    name: "田中 健太 · 李娜",
    status: "Pending ⏳",
    clinician: "佐藤 先生",
    notes: "書類確認中 · 次回: 来週 · 归档中",
    badges: "📄 ✉ ◆ 🎉",
  },
  {
    name: "मुकेश शर्मा",
    status: "Active ✅",
    clinician: "डॉ. पटेल",
    notes: "थेरेपी सत्र पूरा · नोट्स अपडेट · follow-up",
    badges: "📝 ★ ● ✍️",
  },
  {
    name: "สมชาย พรหมมา",
    status: "On Hold ⏸️",
    clinician: "ดร.วิไล",
    notes: "รอเอกสาร · นัดหมายถัดไป · pending forms",
    badges: "📎 ⚠ ◆ 📁",
  },
  {
    name: "Иван Петров",
    status: "Active ✅",
    clinician: "Др. Смирнова",
    notes: "Сессия завершена · отчёт готов · signed",
    badges: "📊 ★ ✓ 🏁",
  },
  {
    name: "فاطمة الحسن",
    status: "Pending ⏳",
    clinician: "د. أحمد",
    notes: "بانتظار الموافقة · ملف ناقص · docs needed",
    badges: "📁 ✉ ● 🔍",
  },
  {
    name: "דניאל כהן",
    status: "Active ✅",
    clinician: "ד״ר לוי",
    notes: "פגישה הושלמה · עדכון תיק · chart updated",
    badges: "📒 ★ ✓ 📋",
  },
  {
    name: "김민수 · 안녕하세요",
    status: "Discharged 🏁",
    clinician: "Dr. Park",
    notes: "종결 처리 · 아카이브 완료 🎉 · closed",
    badges: "🏁 🎉 ◆ ✅",
  },
  {
    name: "Jamie O’Neill + 👨‍👩‍👧",
    status: "Active ✅",
    clinician: "Dr. Brooks",
    notes: "Family session · consent signed ✍️ · ZWJ emoji",
    badges: "👨‍👩‍👧 ✍️ ★ 🧠",
  },
  {
    name: "Symbols ★◆●✓⚠ ∞≈",
    status: "Review 🔍",
    clinician: "QA Bot",
    notes: `Glyph fallback · ${SYMBOL_BURST}`,
    badges: "★ ◆ ● ✓ ⚠",
  },
  {
    name: "Հայերեն · ქართული",
    status: "Active ✅",
    clinician: "Dr. Geo",
    notes: "Armenian + Georgian shaping · mixed notes",
    badges: "📘 ★ ●",
  },
  {
    name: "አማርኛ · မြန်မာ",
    status: "Pending ⏳",
    clinician: "Dr. Eth",
    notes: "Ethiopic + Myanmar fallback pressure",
    badges: "📗 ⚠ ◆",
  },
];

const SHAPE_SAMPLES: Array<{ label: string; family: string; text: string }> = [
  { label: "latin-default", family: "sans-serif", text: "Hello world" },
  {
    label: "missing-family",
    family: '"__NoSuchFontA__", sans-serif',
    text: "Hello world",
  },
  {
    label: "cjk-dense",
    family: "sans-serif",
    text: "你好世界 こんにちは 안녕하세요 中文日本語한국어 繁體字 简体字",
  },
  {
    label: "emoji-zwj",
    family: "sans-serif",
    text: EMOJI_BURST,
  },
  {
    label: "cyrillic-arabic-hebrew",
    family: "sans-serif",
    text: "Привет мир مرحبا بالعالم שלום עולם Γειά σου",
  },
  {
    label: "symbols-dense",
    family: "sans-serif",
    text: SYMBOL_BURST,
  },
  {
    label: "devanagari-thai",
    family: "sans-serif",
    text: "नमस्ते दुनिया · สวัสดีชาวโลก · हिन्दी + ไทย",
  },
  {
    label: "armenian-georgian-ethiopic-myanmar",
    family: "sans-serif",
    text: "Հայերեն ტექსტი አማርኛ မြန်မာစာ",
  },
  {
    label: "kitchen-sink",
    family: "sans-serif",
    text: `${MIXED_SCRIPTS.join(" · ")} · ${EMOJI_BURST}`,
  },
  {
    label: "arial-explicit",
    family: "Arial, sans-serif",
    text: `${MIXED_SCRIPTS.slice(0, 8).join(" ")} ${EMOJI_BURST}`,
  },
];

type FontStats = {
  size: number;
  status: string;
  loading: number;
  loaded: number;
  error: number;
  families: string[];
};

type ShapeResult = {
  label: string;
  coldMs: number;
  warmMs: number;
  width: number;
};

type NuclearSpan = {
  id: number;
  text: string;
  family: string;
  weight: number;
};

function buildGoogleFontsHref(): string {
  const families = GOOGLE_FONT_FAMILIES.map((family) => {
    const encoded = family.replace(/ /g, "+");
    if (family.startsWith("Noto")) {
      return `family=${encoded}:wght@300;400;500;700`;
    }
    return `family=${encoded}:wght@300;400;500;600;700;800`;
  }).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function ensureStylesheet(id: string, href: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function registerSyntheticFontFaces(
  targetCount: number,
): Promise<number> {
  const existingSynthetic = [...document.fonts].filter((face) =>
    face.family.startsWith("TheranestLike"),
  ).length;
  if (existingSynthetic >= targetCount) {
    return existingSynthetic;
  }

  const toAdd = targetCount - existingSynthetic;
  const loads: Promise<FontFace>[] = [];

  for (let i = 0; i < toAdd; i++) {
    const index = existingSynthetic + i;
    // local() sources still register FontFace entries like a SaaS icon/UI kit,
    // without requiring dozens of unique binary downloads.
    const face = new FontFace(
      `TheranestLike${index}`,
      'local("Arial"), local("Segoe UI"), local("Helvetica Neue"), local("Helvetica"), local("sans-serif")',
      {
        weight: String(300 + (index % 6) * 100),
        style: index % 5 === 0 ? "italic" : "normal",
        stretch: index % 11 === 0 ? "condensed" : "normal",
      },
    );
    document.fonts.add(face);
    loads.push(face.load().catch(() => face));
  }

  await Promise.allSettled(loads);
  return [...document.fonts].filter((face) =>
    face.family.startsWith("TheranestLike"),
  ).length;
}

function readFontStats(): FontStats {
  const faces = [...document.fonts];
  const families = [...new Set(faces.map((face) => face.family))].sort();
  return {
    size: document.fonts.size,
    status: document.fonts.status,
    loading: faces.filter((face) => face.status === "loading").length,
    loaded: faces.filter((face) => face.status === "loaded").length,
    error: faces.filter((face) => face.status === "error").length,
    families,
  };
}

function measureOne(
  host: HTMLDivElement,
  family: string,
  text: string,
): { ms: number; width: number } {
  const span = document.createElement("span");
  span.style.fontFamily = family;
  span.style.fontSize = "16px";
  span.style.fontWeight = "400";
  span.textContent = text;
  host.appendChild(span);
  const start = performance.now();
  const width = span.offsetWidth;
  const ms = performance.now() - start;
  host.removeChild(span);
  return { ms, width };
}

function measureShapeSamples(): ShapeResult[] {
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;";
  document.body.appendChild(host);

  const results: ShapeResult[] = [];
  try {
    for (const sample of SHAPE_SAMPLES) {
      // Fresh node each pass so we don't accidentally reshape a growing
      // formatting context (the prod probe's warm-pass confounder).
      const cold = measureOne(host, sample.family, sample.text);
      const warm = measureOne(host, sample.family, sample.text);
      results.push({
        label: sample.label,
        coldMs: cold.ms,
        warmMs: warm.ms,
        width: warm.width,
      });
    }
  } finally {
    host.remove();
  }
  return results;
}

function exaggerateNotes(base: string, index: number): string {
  const script = MIXED_SCRIPTS[index % MIXED_SCRIPTS.length];
  const script2 = MIXED_SCRIPTS[(index + 3) % MIXED_SCRIPTS.length];
  return `${base} · ${script} · ${script2} · ${EMOJI_BURST}`;
}

function makeRows(count: number): ClientRow[] {
  const rows: ClientRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = SEED_CLIENTS[i % SEED_CLIENTS.length];
    const family =
      i % 4 === 0
        ? "sans-serif"
        : i % 4 === 1
          ? `"TheranestLike${i % TARGET_FONT_FACE_COUNT}", Arial, sans-serif`
          : i % 4 === 2
            ? `"${GOOGLE_FONT_FAMILIES[i % GOOGLE_FONT_FAMILIES.length]}", sans-serif`
            : 'Arial, "Segoe UI", sans-serif';
    rows.push({
      id: i + 1,
      family,
      weight: 300 + (i % 6) * 100,
      style: i % 7 === 0 ? "italic" : "normal",
      name: `${seed.name} #${i + 1}`,
      status: `${seed.status} ${MIXED_SCRIPTS[i % MIXED_SCRIPTS.length]}`,
      clinician: `${seed.clinician} · ${MIXED_SCRIPTS[(i + 1) % MIXED_SCRIPTS.length]}`,
      notes: exaggerateNotes(seed.notes, i),
      badges: `${seed.badges} ${EMOJI_BURST}`,
    });
  }
  return rows;
}

function makeNuclearSpans(count: number): NuclearSpan[] {
  const spans: NuclearSpan[] = [];
  for (let i = 0; i < count; i++) {
    const family =
      i % 3 === 0
        ? "sans-serif"
        : i % 3 === 1
          ? "Arial, sans-serif"
          : `"TheranestLike${i % TARGET_FONT_FACE_COUNT}", sans-serif`;
    spans.push({
      id: i,
      family,
      weight: 300 + (i % 6) * 100,
      text: `${MIXED_SCRIPTS[i % MIXED_SCRIPTS.length]} ${EMOJI_BURST} ${SYMBOL_BURST} #${i}`,
    });
  }
  return spans;
}

export const FontStressPage: React.FC = () => {
  const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
  const [rows, setRows] = useState<ClientRow[]>(() =>
    makeRows(DEFAULT_ROW_COUNT),
  );
  const [fontStats, setFontStats] = useState<FontStats | null>(null);
  const [shapeResults, setShapeResults] = useState<ShapeResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [mutationTick, setMutationTick] = useState(0);
  const [autoMutate, setAutoMutate] = useState(true);
  const [nuclearOn, setNuclearOn] = useState(true);
  const [nuclearSpans, setNuclearSpans] = useState<NuclearSpan[]>(() =>
    makeNuclearSpans(NUCLEAR_SPAN_COUNT),
  );
  const [setupNote, setSetupNote] = useState(
    "Bootstrapping exaggerated fonts…",
  );
  const probeHostRef = useRef<HTMLDivElement | null>(null);

  const refreshFontStats = useCallback(() => {
    setFontStats(readFontStats());
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollInterval: number | undefined;

    ensureStylesheet("font-stress-google", buildGoogleFontsHref());
    ensureStylesheet(
      "font-stress-fa",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
    );
    ensureStylesheet(
      "font-stress-material",
      "https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round",
    );

    void (async () => {
      const synthetic = await registerSyntheticFontFaces(
        TARGET_FONT_FACE_COUNT,
      );
      if (cancelled) return;
      setSetupNote(
        `Exaggerated setup: ${synthetic} synthetic FontFaces + Google/FA/Material stylesheets · default ${DEFAULT_ROW_COUNT} rows · nuclear flood on`,
      );
      refreshFontStats();

      pollInterval = window.setInterval(() => {
        if (cancelled) return;
        refreshFontStats();
        if (document.fonts.status === "loaded" && pollInterval !== undefined) {
          window.clearInterval(pollInterval);
        }
      }, 400);
    })();

    return () => {
      cancelled = true;
      if (pollInterval !== undefined) {
        window.clearInterval(pollInterval);
      }
    };
  }, [refreshFontStats]);

  useEffect(() => {
    setRows(makeRows(rowCount));
  }, [rowCount]);

  useEffect(() => {
    if (!autoMutate) return;
    const timer = window.setInterval(() => {
      setMutationTick((tick) => {
        const next = tick + 1;
        setRows((prev) =>
          prev.map((row, index) => {
            // Mutate every row over a short cycle so shaping stays hot.
            if (index % 2 !== tick % 2) return row;
            return {
              ...row,
              notes: `${row.notes} · tick ${next} ${MIXED_SCRIPTS[next % MIXED_SCRIPTS.length]} ✍️`,
              badges: `${row.badges} ${next % 2 === 0 ? "🔄" : "⭐"}`,
              weight: 300 + ((row.weight / 100 + 1) % 6) * 100,
            };
          }),
        );
        if (nuclearOn) {
          setNuclearSpans((prev) =>
            prev.map((span, index) =>
              index % 3 === tick % 3
                ? {
                    ...span,
                    text: `${span.text} · ${MIXED_SCRIPTS[next % MIXED_SCRIPTS.length]} ${next}`,
                  }
                : span,
            ),
          );
        }
        return next;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [autoMutate, nuclearOn]);

  const visibleFamilies = useMemo(() => {
    if (!fontStats) return [];
    return fontStats.families.slice(0, 40);
  }, [fontStats]);

  const runShapeProbe = async () => {
    setBusy(true);
    setShapeResults(null);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
      const results = measureShapeSamples();
      setShapeResults(results);
      refreshFontStats();
      const worst = [...results].sort((a, b) => b.coldMs - a.coldMs)[0];
      if (worst) {
        setSetupNote(
          `Shape probe worst cold=${worst.coldMs.toFixed(1)}ms warm=${worst.warmMs.toFixed(1)}ms (${worst.label})`,
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const forceReflow = () => {
    setBusy(true);
    window.requestAnimationFrame(() => {
      const start = performance.now();
      void document.body.offsetHeight;
      rows.forEach((_, index) => {
        const el = document.getElementById(`font-stress-row-${index}`);
        if (el) void el.offsetWidth;
      });
      if (nuclearOn) {
        for (let i = 0; i < nuclearSpans.length; i++) {
          const el = document.getElementById(`font-stress-nuclear-${i}`);
          if (el) void el.offsetWidth;
        }
      }
      const ms = performance.now() - start;
      setSetupNote(
        `Forced reflow across ${rows.length} rows` +
          (nuclearOn ? ` + ${nuclearSpans.length} nuclear spans` : "") +
          ` in ${ms.toFixed(1)} ms`,
      );
      refreshFontStats();
      setBusy(false);
    });
  };

  const explodeNuclear = () => {
    setNuclearOn(true);
    setNuclearSpans(makeNuclearSpans(NUCLEAR_SPAN_COUNT));
    setSetupNote(
      `Nuclear flood rebuilt: ${NUCLEAR_SPAN_COUNT} mixed-script/emoji spans`,
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8" data-testid="font-stress-page">
      <header className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Font Stress (exaggerated Theranest)
        </h1>
        <p className="text-gray-600 mb-4">
          Turned past production Theranest on purpose: {TARGET_FONT_FACE_COUNT}+
          FontFaces, denser mixed scripts/emoji, {DEFAULT_ROW_COUNT}+ table
          rows, Material/FA icons, and a nuclear glyph flood so
          Chromeleon&apos;s bundled fallback path is more likely to hitch on a
          fresh Windows persona.
        </p>
        <p className="text-sm text-gray-500" data-testid="font-stress-setup">
          {setupNote}
        </p>
      </header>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          document.fonts live stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <Stat
            label="size"
            value={fontStats?.size ?? "—"}
            testId="fonts-size"
          />
          <Stat
            label="status"
            value={fontStats?.status ?? "—"}
            testId="fonts-status"
          />
          <Stat
            label="loading"
            value={fontStats?.loading ?? "—"}
            testId="fonts-loading"
          />
          <Stat
            label="loaded"
            value={fontStats?.loaded ?? "—"}
            testId="fonts-loaded"
          />
          <Stat
            label="error"
            value={fontStats?.error ?? "—"}
            testId="fonts-error"
          />
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Sample families ({visibleFamilies.length} of{" "}
          {fontStats?.families.length ?? 0}):
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleFamilies.map((family) => (
            <span
              key={family}
              className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1"
            >
              {family}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Controls</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-700 flex items-center gap-2">
            Rows
            <input
              type="number"
              min={10}
              max={MAX_ROW_COUNT}
              value={rowCount}
              onChange={(event) =>
                setRowCount(
                  Math.max(
                    10,
                    Math.min(
                      MAX_ROW_COUNT,
                      Number(event.target.value) || DEFAULT_ROW_COUNT,
                    ),
                  ),
                )
              }
              className="w-20 border border-gray-300 rounded px-2 py-1"
              data-testid="font-stress-row-count"
            />
          </label>
          <button
            type="button"
            onClick={runShapeProbe}
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
            data-testid="font-stress-shape-probe"
          >
            Run shape probe
          </button>
          <button
            type="button"
            onClick={forceReflow}
            disabled={busy}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
            data-testid="font-stress-force-reflow"
          >
            Force table reflow
          </button>
          <button
            type="button"
            onClick={() => {
              setRows(makeRows(rowCount));
              refreshFontStats();
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
            data-testid="font-stress-rebuild-rows"
          >
            Rebuild rows
          </button>
          <button
            type="button"
            onClick={explodeNuclear}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            data-testid="font-stress-nuclear"
          >
            Rebuild nuclear flood
          </button>
          <label className="text-sm text-gray-700 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoMutate}
              onChange={(event) => setAutoMutate(event.target.checked)}
              data-testid="font-stress-auto-mutate"
            />
            Auto-mutate (700ms)
          </label>
          <label className="text-sm text-gray-700 flex items-center gap-2">
            <input
              type="checkbox"
              checked={nuclearOn}
              onChange={(event) => setNuclearOn(event.target.checked)}
              data-testid="font-stress-nuclear-toggle"
            />
            Nuclear glyph flood ({NUCLEAR_SPAN_COUNT})
          </label>
        </div>

        {shapeResults && (
          <div
            className="overflow-x-auto"
            data-testid="font-stress-shape-results"
          >
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Sample</th>
                  <th className="py-2 pr-4">cold ms</th>
                  <th className="py-2 pr-4">warm ms</th>
                  <th className="py-2">width</th>
                </tr>
              </thead>
              <tbody>
                {shapeResults.map((result) => (
                  <tr key={result.label} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono">{result.label}</td>
                    <td
                      className={`py-2 pr-4 font-semibold ${
                        result.coldMs > 200 ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {result.coldMs.toFixed(1)}
                    </td>
                    <td
                      className={`py-2 pr-4 font-semibold ${
                        result.warmMs > 200 ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {result.warmMs.toFixed(1)}
                    </td>
                    <td className="py-2">{result.width}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Clients <i className="fa-solid fa-users ml-2 text-blue-600" />
              <span className="material-icons align-middle text-blue-500 ml-2">
                medical_services
              </span>
            </h2>
            <p className="text-sm text-gray-500">
              Every cell carries mixed scripts + emoji/symbols on generic or
              synthetic stacks to force fallback shaping.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <i className="fa-solid fa-filter mr-2" />
            Showing {rows.length} clients
            {autoMutate ? ` · mutate #${mutationTick}` : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className="min-w-full text-sm"
            style={{ fontFamily: "sans-serif" }}
            data-testid="font-stress-clients-table"
          >
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Clinician</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Badges</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  id={`font-stress-row-${index}`}
                  className="border-t border-gray-100 hover:bg-blue-50/40"
                  style={{
                    fontFamily: row.family,
                    fontWeight: row.weight,
                    fontStyle: row.style,
                  }}
                >
                  <td className="px-4 py-3 text-gray-500">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <i className="fa-regular fa-user mr-2 text-blue-500" />
                    <span className="material-icons-outlined text-sm align-middle mr-1">
                      person
                    </span>
                    {row.name}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{row.clinician}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xl">
                    {row.notes}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.badges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {nuclearOn && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">
            Nuclear glyph flood ({nuclearSpans.length})
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Hundreds of simultaneous mixed-script/emoji spans on sans-serif /
            Arial / synthetic families. This is intentionally worse than
            Theranest.
          </p>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-auto"
            data-testid="font-stress-nuclear-grid"
          >
            {nuclearSpans.map((span) => (
              <div
                key={span.id}
                id={`font-stress-nuclear-${span.id}`}
                className="border border-red-100 bg-red-50/40 rounded px-2 py-1 text-xs"
                style={{
                  fontFamily: span.family,
                  fontWeight: span.weight,
                }}
              >
                {span.text}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Visible shaping fixtures</h2>
        <p className="text-sm text-gray-500 mb-4">
          Stay in the DOM so navigation/layout alone can hit fallback paths
          without running the probe.
        </p>
        <div
          ref={probeHostRef}
          className="space-y-2"
          data-testid="font-stress-fixtures"
        >
          {SHAPE_SAMPLES.map((sample) => (
            <div
              key={sample.label}
              className="border border-gray-200 rounded px-3 py-2"
              style={{ fontFamily: sample.family, fontSize: 16 }}
            >
              <div className="text-xs text-gray-400 mb-1 font-mono">
                {sample.label}
              </div>
              <div>{sample.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Stat: React.FC<{
  label: string;
  value: string | number;
  testId: string;
}> = ({ label, value, testId }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className="text-2xl font-semibold text-gray-900" data-testid={testId}>
      {value}
    </div>
  </div>
);
