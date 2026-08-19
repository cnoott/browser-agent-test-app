import React, { useState, useEffect, useRef } from 'react';

// ─── Scenario timing constants ────────────────────────────────────────────────
const OVERLAY_RESPAWN_MS = 600; // how quickly the chronic blocker reappears

// ─── Scenario 2 & 3 data ─────────────────────────────────────────────────────
//
// HIGH SKIP RATE LIST  (scenario 2)
//   10 items, items 1/2/4/6/7/9/10 broken (7 of 10 = 70% skip rate)
//   70% > 30% threshold and 7 skipped >= 3 → high_skip_rate anomaly
//
// CONSECUTIVE FAILURES LIST  (scenario 3)
//   8 items, items 1-5 broken, items 6-8 fine
//   5 consecutive failures at the top → loop abort / critical alert

interface WorkItem {
  id: number;
  label: string;
  broken: boolean;
}

const HIGH_SKIP_RATE_ITEMS: WorkItem[] = [
  { id: 1,  label: 'Invoice #1001', broken: true  },
  { id: 2,  label: 'Invoice #1002', broken: true  },
  { id: 3,  label: 'Invoice #1003', broken: false },
  { id: 4,  label: 'Invoice #1004', broken: true  },
  { id: 5,  label: 'Invoice #1005', broken: false },
  { id: 6,  label: 'Invoice #1006', broken: true  },
  { id: 7,  label: 'Invoice #1007', broken: true  },
  { id: 8,  label: 'Invoice #1008', broken: false },
  { id: 9,  label: 'Invoice #1009', broken: true  },
  { id: 10, label: 'Invoice #1010', broken: true  },
];

const CONSECUTIVE_FAILURE_ITEMS: WorkItem[] = [
  { id: 1, label: 'Order #2001', broken: true  },
  { id: 2, label: 'Order #2002', broken: true  },
  { id: 3, label: 'Order #2003', broken: true  },
  { id: 4, label: 'Order #2004', broken: true  },
  { id: 5, label: 'Order #2005', broken: true  },
  { id: 6, label: 'Order #2006', broken: false },
  { id: 7, label: 'Order #2007', broken: false },
  { id: 8, label: 'Order #2008', broken: false },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const Badge: React.FC<{ color: 'red' | 'yellow' | 'green'; label: string }> = ({ color, label }) => {
  const colors = {
    red:    'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green:  'bg-green-100 text-green-800 border-green-300',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export const MonitoringTestPage: React.FC = () => {
  // ── Scenario 1 state ──────────────────────────────────────────────────────
  const [overlayVisible, setOverlayVisible]     = useState(true);
  const [healCount, setHealCount]               = useState(0);
  const [targetClicked, setTargetClicked]       = useState(false);
  const overlayRespawnTimer                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismissOverlay = () => {
    setOverlayVisible(false);
    setHealCount(prev => prev + 1);
    // Overlay re-appears after a short delay, just like a real recurring blocker
    overlayRespawnTimer.current = setTimeout(() => setOverlayVisible(true), OVERLAY_RESPAWN_MS);
  };

  const handleTargetClick = () => {
    setTargetClicked(true);
  };

  const resetScenario1 = () => {
    if (overlayRespawnTimer.current) clearTimeout(overlayRespawnTimer.current);
    setOverlayVisible(true);
    setHealCount(0);
    setTargetClicked(false);
  };

  useEffect(() => {
    return () => {
      if (overlayRespawnTimer.current) clearTimeout(overlayRespawnTimer.current);
    };
  }, []);

  // ── Scenario 2 state ──────────────────────────────────────────────────────
  const [processedItems, setProcessedItems] = useState<Set<number>>(new Set());

  const handleProcessItem = (id: number) => {
    setProcessedItems(prev => new Set([...prev, id]));
  };

  const resetScenario2 = () => setProcessedItems(new Set());

  // ── Scenario 3 state ──────────────────────────────────────────────────────
  const [processedConsec, setProcessedConsec] = useState<Set<number>>(new Set());

  const handleProcessConsec = (id: number) => {
    setProcessedConsec(prev => new Set([...prev, id]));
  };

  const resetScenario3 = () => setProcessedConsec(new Set());

  // ── Scenario 4 state ──────────────────────────────────────────────────────
  const [authExpired, setAuthExpired] = useState(false);
  const [hasToken, setHasToken]       = useState(() => !!localStorage.getItem('authToken'));

  const expireSession = () => {
    localStorage.removeItem('authToken');
    setAuthExpired(true);
    setHasToken(false);
  };

  const restoreSession = () => {
    // Navigating to /login lets the agent (or user) re-authenticate
    window.location.href = '/login';
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Monitoring &amp; Alerting Test Scenarios</h1>
        <p className="text-gray-600">
          Controlled failure scenarios designed to exercise the agent's{' '}
          <strong>HealthMonitor</strong>, <strong>NotificationService</strong>, and{' '}
          <strong>Slack alerting</strong> pipeline. Each section maps to one anomaly or critical alert.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'repeat_healing',  color: 'red'    as const, href: '#repeat-healing'   },
            { label: 'high_skip_rate',  color: 'yellow' as const, href: '#high-skip-rate'   },
            { label: 'loop_aborted',    color: 'red'    as const, href: '#loop-aborted'     },
            { label: 'reauth',          color: 'yellow' as const, href: '#reauth'           },
          ].map(({ label, color, href }) => (
            <a key={label} href={href} className="flex items-center gap-2 hover:opacity-80">
              <Badge color={color} label={label} />
            </a>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SCENARIO 1 — repeat_healing
          An element permanently blocked by a re-appearing overlay.
          Each dismiss increments the heal counter and the overlay returns
          after 600 ms. 3+ heals in one run → HealthMonitor.repeat_healing.
      ════════════════════════════════════════════════════════════════════ */}
      <section id="repeat-healing" className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Scenario 1 — Chronic Blocker</h2>
          <Badge color="red" label="repeat_healing" />
        </div>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Anomaly trigger:</strong> agent heals the same node ≥ 3 times in one run.
        </p>
        <p className="text-gray-600 text-sm mb-4">
          The "Submit Report" button is permanently obstructed by a semi-transparent overlay.
          Whenever the overlay is dismissed it re-appears after{' '}
          <strong>{OVERLAY_RESPAWN_MS} ms</strong>. Run a workflow that clicks{' '}
          <code className="bg-gray-100 px-1 rounded">[data-testid="chronic-target-btn"]</code>.
          The agent will heal the overlay each time, triggering{' '}
          <code className="bg-gray-100 px-1 rounded">repeat_healing</code> after 3 heals.
        </p>

        <div className="border rounded-lg p-6 bg-gray-50 relative">
          {/* Heal counter badge */}
          <div className="absolute top-3 right-3 text-xs text-gray-400">
            Heal count: <strong data-testid="heal-count">{healCount}</strong>
            {healCount >= 3 && (
              <span className="ml-2 text-red-600 font-semibold">⚠ anomaly threshold reached</span>
            )}
          </div>

          {/* The real target button */}
          <div className="relative inline-block">
            <button
              data-testid="chronic-target-btn"
              onClick={handleTargetClick}
              className="px-5 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none"
            >
              Submit Report
            </button>

            {/* Persistent blocking overlay — sits on top of the button */}
            {overlayVisible && !targetClicked && (
              <div
                data-testid="chronic-blocker-overlay"
                className="absolute inset-0 flex items-center justify-center rounded-md"
                style={{
                  background: 'rgba(239,68,68,0.55)',
                  cursor: 'not-allowed',
                  zIndex: 10,
                }}
              >
                <button
                  data-testid="dismiss-chronic-overlay"
                  onClick={handleDismissOverlay}
                  className="text-white text-xs underline px-2 py-0.5 hover:text-red-100"
                  title="Dismiss overlay (heal)"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {targetClicked && (
            <p
              data-testid="chronic-success-msg"
              className="mt-4 text-green-700 font-medium"
            >
              Report submitted successfully.
            </p>
          )}
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <button
            onClick={resetScenario1}
            className="text-sm px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Reset Scenario
          </button>
          <p className="text-xs text-gray-400">
            Workflow instruction: navigate to <code>/monitoring</code>, click{' '}
            <code>[data-testid="chronic-target-btn"]</code>.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SCENARIO 2 — high_skip_rate
          10-item list, 7 broken (70% skip rate).
          skip rate > 30% and skipped ≥ 3 → HealthMonitor.high_skip_rate.
      ════════════════════════════════════════════════════════════════════ */}
      <section id="high-skip-rate" className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Scenario 2 — High-Skip-Rate Loop</h2>
          <Badge color="yellow" label="high_skip_rate" />
        </div>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Anomaly trigger:</strong> skip rate &gt; 30% with ≥ 3 skipped iterations.
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Process all 10 invoices via a loop workflow targeting{' '}
          <code className="bg-gray-100 px-1 rounded">[data-testid="invoice-process-btn-{'{'}id{'}'}"]</code>.
          Items marked <Badge color="red" label="broken" /> have no action button — the agent
          skips them. 7 of 10 are broken (70%), crossing the <strong>30% threshold</strong> and{' '}
          triggering <code className="bg-gray-100 px-1 rounded">high_skip_rate</code>.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Item</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Action</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Result</th>
              </tr>
            </thead>
            <tbody>
              {HIGH_SKIP_RATE_ITEMS.map(item => (
                <tr
                  key={item.id}
                  data-testid={`invoice-row-${item.id}`}
                  className={`border-b last:border-b-0 ${item.broken ? 'bg-red-50' : 'bg-white'}`}
                >
                  <td className="py-2 px-4 font-mono text-gray-800">{item.label}</td>
                  <td className="py-2 px-4">
                    {item.broken
                      ? <Badge color="red" label="broken" />
                      : <Badge color="green" label="ok" />
                    }
                  </td>
                  <td className="py-2 px-4">
                    {item.broken ? (
                      /* No button rendered — agent finds nothing and skips */
                      <span className="text-xs text-gray-400 italic">no action available</span>
                    ) : (
                      <button
                        data-testid={`invoice-process-btn-${item.id}`}
                        onClick={() => handleProcessItem(item.id)}
                        disabled={processedItems.has(item.id)}
                        className={`px-3 py-1 text-xs rounded font-medium ${
                          processedItems.has(item.id)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {processedItems.has(item.id) ? 'Done' : 'Process'}
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {processedItems.has(item.id) && (
                      <span
                        data-testid={`invoice-success-${item.id}`}
                        className="text-xs text-green-700 font-medium"
                      >
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <button
            onClick={resetScenario2}
            className="text-sm px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Reset Scenario
          </button>
          <p className="text-xs text-gray-400">
            7 broken / 10 total = 70% skip rate — well above the 30% anomaly threshold.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SCENARIO 3 — loop_aborted (consecutive failures)
          8-item list, first 5 broken = 5 consecutive failures.
          Agent's consecutive-failure abort threshold fires → critical alert.
      ════════════════════════════════════════════════════════════════════ */}
      <section id="loop-aborted" className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Scenario 3 — Consecutive Failure Abort</h2>
          <Badge color="red" label="loop_aborted" />
        </div>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Critical alert trigger:</strong> N consecutive iteration failures hit the abort threshold.
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Process all 8 orders via a loop workflow targeting{' '}
          <code className="bg-gray-100 px-1 rounded">[data-testid="order-process-btn-{'{'}id{'}'}"]</code>.
          The first <strong>5 orders</strong> have no action button. The agent fails iterations 1–5
          consecutively, triggering the abort threshold and sending a{' '}
          <code className="bg-gray-100 px-1 rounded">loop_aborted</code> critical Slack alert before
          ever reaching the healthy orders at rows 6–8.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Order</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Action</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Result</th>
              </tr>
            </thead>
            <tbody>
              {CONSECUTIVE_FAILURE_ITEMS.map(item => (
                <tr
                  key={item.id}
                  data-testid={`order-row-${item.id}`}
                  className={`border-b last:border-b-0 ${item.broken ? 'bg-red-50' : 'bg-white'}`}
                >
                  <td className="py-2 px-4 font-mono text-gray-800">{item.label}</td>
                  <td className="py-2 px-4">
                    {item.broken
                      ? <Badge color="red" label="action unavailable" />
                      : <Badge color="green" label="ok" />
                    }
                  </td>
                  <td className="py-2 px-4">
                    {item.broken ? (
                      <span className="text-xs text-gray-400 italic">no action available</span>
                    ) : (
                      <button
                        data-testid={`order-process-btn-${item.id}`}
                        onClick={() => handleProcessConsec(item.id)}
                        disabled={processedConsec.has(item.id)}
                        className={`px-3 py-1 text-xs rounded font-medium ${
                          processedConsec.has(item.id)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {processedConsec.has(item.id) ? 'Done' : 'Process'}
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {processedConsec.has(item.id) && (
                      <span
                        data-testid={`order-success-${item.id}`}
                        className="text-xs text-green-700 font-medium"
                      >
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <button
            onClick={resetScenario3}
            className="text-sm px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Reset Scenario
          </button>
          <p className="text-xs text-gray-400">
            Rows 1–5 cause 5 consecutive failures — enough to trip the abort threshold on most
            default configurations.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SCENARIO 4 — reauth
          Clears the JWT from localStorage mid-workflow.
          The agent's next authenticated request returns 401 →
          ReauthService fires → critical Slack alert (failureType: "reauth").
      ════════════════════════════════════════════════════════════════════ */}
      <section id="reauth" className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Scenario 4 — Session Expiry / Reauth</h2>
          <Badge color="yellow" label="reauth" />
        </div>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Critical alert trigger:</strong> auth token evicted mid-workflow; reauth
          fails or is not permitted → ReauthService sends critical notification.
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Design your workflow to: <strong>(1)</strong> navigate here while authenticated,{' '}
          <strong>(2)</strong> click{' '}
          <code className="bg-gray-100 px-1 rounded">[data-testid="expire-session-btn"]</code>,{' '}
          <strong>(3)</strong> then attempt an authenticated action (e.g. visit{' '}
          <code className="bg-gray-100 px-1 rounded">/admin</code>). The missing token causes a
          401 → the agent's reauth flow kicks in → if reauth fails or is blocked, a{' '}
          <code className="bg-gray-100 px-1 rounded">reauth</code> critical alert fires.
        </p>

        <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
          {/* Current token status indicator */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Token status:</span>
            {hasToken ? (
              <span
                data-testid="token-status-active"
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300"
              >
                Active — authToken present in localStorage
              </span>
            ) : (
              <span
                data-testid="token-status-missing"
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300"
              >
                Missing — session expired
              </span>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              data-testid="expire-session-btn"
              onClick={expireSession}
              disabled={authExpired}
              className={`px-4 py-2 rounded-md font-medium text-sm ${
                authExpired
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {authExpired ? 'Session already expired' : 'Expire Session Now'}
            </button>

            <button
              data-testid="go-to-login-btn"
              onClick={restoreSession}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700"
            >
              Go to Login (restore session)
            </button>
          </div>

          {authExpired && (
            <p
              data-testid="session-expired-msg"
              className="text-sm text-red-700 font-medium"
            >
              authToken removed from localStorage. Any subsequent authenticated request will
              receive a 401 — triggering the ReauthService flow.
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          For a harder variant: login, start a long loop workflow, then expire the session
          mid-loop. The reauth critical alert should include the loop context in its payload.
        </p>
      </section>

      {/* ── Reference card ─────────────────────────────────────────────── */}
      <section className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Workflow Authoring Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <p className="font-semibold mb-2">Scenario 1 — repeat_healing</p>
            <ul className="space-y-1 list-disc ml-4">
              <li>Navigate to <code>/monitoring#repeat-healing</code></li>
              <li>Click <code>[data-testid="chronic-target-btn"]</code></li>
              <li>Agent encounters overlay, heals, retries — repeats 3+ times</li>
              <li>HealthMonitor fires <code>repeat_healing</code> → critical Slack alert</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Scenario 2 — high_skip_rate</p>
            <ul className="space-y-1 list-disc ml-4">
              <li>Navigate to <code>/monitoring#high-skip-rate</code></li>
              <li>Loop over <code>[data-testid="invoice-row-*"]</code> (10 rows)</li>
              <li>For each row, click <code>[data-testid="invoice-process-btn-{'{'}id{'}'}"]</code></li>
              <li>7 rows have no button → 70% skip rate → <code>high_skip_rate</code> anomaly</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Scenario 3 — loop_aborted</p>
            <ul className="space-y-1 list-disc ml-4">
              <li>Navigate to <code>/monitoring#loop-aborted</code></li>
              <li>Loop over <code>[data-testid="order-row-*"]</code> (8 rows)</li>
              <li>For each row, click <code>[data-testid="order-process-btn-{'{'}id{'}'}"]</code></li>
              <li>First 5 rows have no button → 5 consecutive failures → abort + critical alert</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Scenario 4 — reauth</p>
            <ul className="space-y-1 list-disc ml-4">
              <li>Login as <code>testuser / user123</code></li>
              <li>Navigate to <code>/monitoring#reauth</code></li>
              <li>Click <code>[data-testid="expire-session-btn"]</code></li>
              <li>Navigate to <code>/admin</code> — 401 triggers reauth flow + critical alert</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};
