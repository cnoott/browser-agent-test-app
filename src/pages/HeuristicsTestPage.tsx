import React, { useState, useEffect } from 'react';

// Delay constants for easy configuration
const DELAYS = {
  SLOW_LOADING_ELEMENT: 15000,
  DELAYED_INTERACTION: 5000,      // 5 seconds
  DYNAMIC_CONTENT: 2000,          // 2 seconds
  NETWORK_DELAY: 3000,            // 3 seconds
  DIALOG_SEQUENCE: {
    ALERT: 500,                   // 0.5 seconds
    CONFIRM: 1500,                // 1.5 seconds
    PROMPT: 2500,                 // 2.5 seconds
  }
};

// Memory stress test configuration - AGGRESSIVE CRASH MODE
const MEMORY_STRESS = {
  CHUNK_SIZE: 100 * 1024 * 1024,  // 100MB chunks - much larger
  MAX_CHUNKS: 1000,               // No realistic limit - keep going until crash
  DOM_ELEMENTS_BATCH: 50000,      // 50k elements per batch
  INTERVAL_MS: 1,                 // As fast as possible
};

export const HeuristicsTestPage: React.FC = () => {
  const [slowLoadingVisible, setSlowLoadingVisible] = useState(false);
  const [delayedInteractionEnabled, setDelayedInteractionEnabled] = useState(false);
  const [dynamicContentLoaded, setDynamicContentLoaded] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [memoryStressActive, setMemoryStressActive] = useState(false);
  const [memoryChunks, setMemoryChunks] = useState<Uint8Array[]>([]);
  const [domStressActive, setDomStressActive] = useState(false);

  // Simulate slow loading element (for wait_and_retry testing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSlowLoadingVisible(true);
    }, DELAYS.SLOW_LOADING_ELEMENT);
    return () => clearTimeout(timer);
  }, []);

  // Simulate delayed interaction enablement
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedInteractionEnabled(true);
    }, DELAYS.DELAYED_INTERACTION);
    return () => clearTimeout(timer);
  }, []);

  // Simulate dynamic content loading
  const loadDynamicContent = () => {
    setTimeout(() => {
      setDynamicContentLoaded(true);
    }, DELAYS.DYNAMIC_CONTENT);
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Browser dialog test functions
  const showAlert = () => {
    alert('This is a test alert dialog that should be dismissed by the browser agent');
    addTestResult('Alert dialog triggered');
  };

  const showConfirm = () => {
    const result = confirm('This is a test confirm dialog. The agent should auto-accept this.');
    addTestResult(`Confirm dialog triggered - Result: ${result}`);
  };

  const showPrompt = () => {
    const result = prompt('This is a test prompt dialog. The agent should handle this.');
    addTestResult(`Prompt dialog triggered - Result: ${result || 'cancelled'}`);
  };

  const showMultipleDialogs = () => {
    setTimeout(() => showAlert(), DELAYS.DIALOG_SEQUENCE.ALERT);
    setTimeout(() => showConfirm(), DELAYS.DIALOG_SEQUENCE.CONFIRM);
    setTimeout(() => showPrompt(), DELAYS.DIALOG_SEQUENCE.PROMPT);
    addTestResult('Multiple dialogs sequence initiated');
  };

  // Network simulation functions
  const simulateNetworkDelay = async () => {
    addTestResult('Simulating network delay...');
    await new Promise(resolve => setTimeout(resolve, DELAYS.NETWORK_DELAY));
    addTestResult('Network delay completed');
  };

  const simulateFailingRequest = async () => {
    try {
      addTestResult('Attempting failing request...');
      await fetch('/api/nonexistent-endpoint');
    } catch {
      addTestResult('Request failed as expected');
    }
  };

  // Memory stress test functions - CRASH MODE
  const startMemoryStress = () => {
    if (memoryStressActive) return;

    setMemoryStressActive(true);
    addTestResult('🚨 STARTING AGGRESSIVE MEMORY CRASH TEST - BROWSER TAB WILL LIKELY CRASH! 🚨');

    const chunks: Uint8Array[] = [];
    let chunkCount = 0;

    const allocateMemory = () => {
      // NO SAFETY LIMITS - keep going until we crash
      try {
        // Allocate multiple chunks at once for faster crash
        for (let i = 0; i < 10; i++) {
          const chunk = new Uint8Array(MEMORY_STRESS.CHUNK_SIZE);
          // Fill entire chunk with data to ensure real memory usage
          for (let j = 0; j < chunk.length; j += 1000) {
            chunk[j] = Math.random() * 255;
          }
          chunks.push(chunk);
          chunkCount++;
        }

        addTestResult(`💥 Allocated ${chunkCount} chunks (~${Math.round(chunkCount * MEMORY_STRESS.CHUNK_SIZE / 1024 / 1024)}MB total) - GOING FOR CRASH!`);

        // Continue immediately - no delay
        setTimeout(allocateMemory, 0);
      } catch (error) {
        addTestResult(`💀 CRASH ATTEMPT: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Even if we catch an error, try again!
        setTimeout(allocateMemory, 0);
      }
    };

    setMemoryChunks(chunks);
    allocateMemory();
  };

  const stopMemoryStress = () => {
    setMemoryStressActive(false);
    setMemoryChunks([]);
    addTestResult('Memory stress test stopped and memory released');
  };

  const startDOMStress = () => {
    if (domStressActive) return;

    setDomStressActive(true);
    addTestResult('🚨 STARTING DOM CRASH TEST - CREATING MASSIVE DOM ELEMENTS! 🚨');

    let elementCount = 0;
    const container = document.getElementById('dom-stress-container');

    const createElements = () => {
      try {
        // Create massive batch of DOM elements with complex content
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < MEMORY_STRESS.DOM_ELEMENTS_BATCH; i++) {
          const div = document.createElement('div');
          div.className = 'stress-element';
          // Create complex nested structure to use more memory
          div.innerHTML = `
            <div class="nested-${i}">
              <span>Element ${elementCount + i}</span>
              <button onclick="console.log('click')">Click ${elementCount + i}</button>
              <div class="deep-nest">
                <p>Deep content ${i}</p>
                <ul>
                  <li>Item 1 - ${Math.random()}</li>
                  <li>Item 2 - ${Math.random()}</li>
                  <li>Item 3 - ${Math.random()}</li>
                </ul>
              </div>
            </div>
          `;
          div.style.cssText = 'padding: 2px; margin: 1px; border: 1px solid #ccc; font-size: 10px;';
          fragment.appendChild(div);
        }

        if (container) {
          container.appendChild(fragment);
        } else {
          // If container is gone, append to body
          document.body.appendChild(fragment);
        }

        elementCount += MEMORY_STRESS.DOM_ELEMENTS_BATCH;

        addTestResult(`💥 Created ${elementCount} DOM elements - GOING FOR CRASH!`);

        // Continue immediately with no delay
        setTimeout(createElements, 0);
      } catch (error) {
        addTestResult(`💀 DOM CRASH ATTEMPT: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Keep trying even after errors
        setTimeout(createElements, 0);
      }
    };

    createElements();
  };

  const stopDOMStress = () => {
    setDomStressActive(false);
    const container = document.getElementById('dom-stress-container');
    if (container) {
      container.innerHTML = '';
    }
    addTestResult('DOM stress test stopped and elements removed');
  };

  const startMemoryLeak = () => {
    addTestResult('🚨 STARTING INFINITE MEMORY LEAK - NO CLEANUP! 🚨');

    // Create tons of intervals that will never be cleaned up
    const leakData: Array<{
      id: number;
      data: number[];
      timestamp: string;
      nested: {
        moreData: Array<{
          value: number;
          string: string;
        }>;
      };
    }> = [];

    // Create 1000 intervals instead of 100
    for (let i = 0; i < 1000; i++) {
      setInterval(() => {
        // Create massive objects that accumulate over time
        leakData.push({
          id: Date.now() + Math.random(),
          data: new Array(10000).fill(0).map(() => Math.random()), // 10x larger arrays
          timestamp: new Date().toISOString(),
          nested: {
            moreData: new Array(5000).fill(0).map(() => ({ // 10x larger nested arrays
              value: Math.random(),
              string: `leak-${i}-${Date.now()}-${Math.random().toString(36)}`
            }))
          }
        });
      }, 10); // Much faster interval
    }

    // NO CLEANUP - let it run forever until crash!
    addTestResult('💀 Memory leak started - NO CLEANUP WILL OCCUR!');
  };

  const startCombinedCrash = () => {
    addTestResult('🚨🚨🚨 STARTING COMBINED CRASH TEST - ALL VECTORS SIMULTANEOUSLY! 🚨🚨🚨');

    // Start all crash tests at once
    startMemoryStress();
    startDOMStress();
    startMemoryLeak();

    // Additional crash vectors
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        // Create recursive functions
        const recursiveCrash = (): never => {
          new Array(1000000).fill(Math.random());
          return recursiveCrash();
        };

        try {
          recursiveCrash();
        } catch {
          // Ignore stack overflow, keep trying
        }
      }, i * 10);
    }
  };

  const triggerSelectorMissing = () => {
    console.log('Attempting to interact with a missing selector');
    (document.querySelector('#non-existent-element') as HTMLElement)?.click();
  };

  const triggerSelectorBlocked = () => {
    console.log('Simulating a blocked selector');
    const blocker = document.createElement('div');
    blocker.style.position = 'absolute';
    blocker.style.top = '0';
    blocker.style.left = '0';
    blocker.style.width = '100%';
    blocker.style.height = '100%';
    blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
    document.body.appendChild(blocker);
    setTimeout(() => document.body.removeChild(blocker), 5000);
  };

  const triggerNavigationTimeout = () => {
    console.log('Simulating a navigation timeout');
    setTimeout(() => {
      window.location.href = '/slow-page';
    }, 10000);
  };

  const triggerUnknownTimeout = () => {
    console.log('Simulating an unknown timeout');
    setTimeout(() => {
      console.log('Random delay completed');
    }, Math.random() * 10000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browser Agent Heuristics Test Page</h1>
        <p className="text-gray-600 mb-6">
          This page contains various scenarios designed to test browser automation agent heuristics,
          specifically focusing on wait_and_retry and dismiss_browser_dialogs strategies.
        </p>
      </div>

      {/* Test Results Panel */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results Log</h2>
        <div className="bg-white rounded border p-4 h-40 overflow-y-auto">
          {testResults.length > 0 ? (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-700 font-mono">
                  {result}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No test results yet...</div>
          )}
        </div>
        <button
          onClick={() => setTestResults([])}
          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {/* Wait and Retry Tests */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Wait and Retry Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Slow Loading Element */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Slow Loading Element</h3>
            <p className="text-sm text-gray-600 mb-4">
              Element appears after {DELAYS.SLOW_LOADING_ELEMENT / 1000} seconds. Agent should wait and retry.
            </p>
            <div className="min-h-20 bg-gray-50 rounded p-4 flex items-center justify-center">
              {slowLoadingVisible ? (
                <button
                  id="slow-loading-button"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => addTestResult('Slow loading button clicked')}
                >
                  I'm Finally Here!
                </button>
              ) : (
                <div className="text-gray-500">Loading... ({DELAYS.SLOW_LOADING_ELEMENT / 1000} seconds)</div>
              )}
            </div>
          </div>

          {/* Delayed Interaction */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Delayed Interaction</h3>
            <p className="text-sm text-gray-600 mb-4">
              Button becomes clickable after {DELAYS.DELAYED_INTERACTION / 1000} seconds. Agent should wait and retry.
            </p>
            <div className="min-h-20 bg-gray-50 rounded p-4 flex items-center justify-center">
              <button
                id="delayed-interaction-button"
                className={`px-4 py-2 rounded ${
                  delayedInteractionEnabled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!delayedInteractionEnabled}
                onClick={() => addTestResult('Delayed interaction button clicked')}
              >
                {delayedInteractionEnabled ? 'Ready to Click!' : `Not Ready Yet... (${DELAYS.DELAYED_INTERACTION / 1000} seconds)`}
              </button>
            </div>
          </div>

          {/* Dynamic Content Loading */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Dynamic Content Loading</h3>
            <p className="text-sm text-gray-600 mb-4">
              Content loads after clicking trigger ({DELAYS.DYNAMIC_CONTENT / 1000} seconds). Agent should wait for content.
            </p>
            <div className="space-y-2">
              <button
                id="load-dynamic-content"
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={loadDynamicContent}
              >
                Load Dynamic Content
              </button>
              <div className="min-h-16 bg-gray-50 rounded p-4 flex items-center justify-center">
                {dynamicContentLoaded ? (
                  <div id="dynamic-content" className="text-green-600 font-semibold">
                    Dynamic content loaded successfully!
                  </div>
                ) : (
                  <div className="text-gray-500">No dynamic content yet...</div>
                )}
              </div>
            </div>
          </div>

          {/* Network Delay Simulation */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Network Delay Simulation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Simulates network delays ({DELAYS.NETWORK_DELAY / 1000} seconds) that might require retry logic.
            </p>
            <div className="space-y-2">
              <button
                id="simulate-network-delay"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                onClick={simulateNetworkDelay}
              >
                Simulate Network Delay
              </button>
              <button
                id="simulate-failing-request"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={simulateFailingRequest}
              >
                Simulate Failing Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Dialog Tests */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser Dialog Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Alert Dialog */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Alert Dialog</h3>
            <p className="text-sm text-gray-600 mb-4">
              Triggers a browser alert dialog. Agent should dismiss automatically.
            </p>
            <button
              id="trigger-alert"
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              onClick={showAlert}
            >
              Show Alert Dialog
            </button>
          </div>

          {/* Confirm Dialog */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Confirm Dialog</h3>
            <p className="text-sm text-gray-600 mb-4">
              Triggers a browser confirm dialog. Agent should auto-accept.
            </p>
            <button
              id="trigger-confirm"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={showConfirm}
            >
              Show Confirm Dialog
            </button>
          </div>

          {/* Prompt Dialog */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Prompt Dialog</h3>
            <p className="text-sm text-gray-600 mb-4">
              Triggers a browser prompt dialog. Agent should handle gracefully.
            </p>
            <button
              id="trigger-prompt"
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              onClick={showPrompt}
            >
              Show Prompt Dialog
            </button>
          </div>

          {/* Multiple Dialogs */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Multiple Dialogs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Triggers multiple dialogs in sequence ({DELAYS.DIALOG_SEQUENCE.ALERT}ms, {DELAYS.DIALOG_SEQUENCE.CONFIRM}ms, {DELAYS.DIALOG_SEQUENCE.PROMPT}ms). Agent should handle all.
            </p>
            <button
              id="trigger-multiple-dialogs"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={showMultipleDialogs}
            >
              Show Multiple Dialogs
            </button>
          </div>
        </div>
      </div>

      {/* Memory Stress Tests */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Memory Stress Tests</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">🚨 EXTREME DANGER WARNING 🚨</h3>
          <p className="text-red-700 text-sm">
            <strong>These tests are designed to CRASH the browser tab as quickly as possible!</strong><br/>
            They will consume ALL available memory with NO safety limits or cleanup mechanisms.<br/>
            <strong>Your tab WILL crash and become unresponsive.</strong> Only use this to test crash recovery.<br/>
            💀 <strong>You have been warned!</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                     {/* Memory Allocation Stress */}
           <div className="border rounded-lg p-4">
             <h3 className="font-semibold mb-2">💥 Memory Allocation Crash</h3>
             <p className="text-sm text-gray-600 mb-4">
               Allocates MASSIVE memory chunks ({MEMORY_STRESS.CHUNK_SIZE / 1024 / 1024}MB each, NO LIMIT) as fast as possible.
               <strong>WILL CRASH THE TAB!</strong> No safety mechanisms.
             </p>
            <div className="space-y-2">
                             <button
                 id="start-memory-stress"
                 className={`px-4 py-2 rounded ${
                   memoryStressActive
                     ? 'bg-red-500 text-white'
                     : 'bg-red-600 text-white hover:bg-red-700'
                 }`}
                 onClick={startMemoryStress}
                 disabled={memoryStressActive}
               >
                 {memoryStressActive ? '💥 CRASHING TAB...' : '🚨 START MEMORY CRASH'}
               </button>
              <button
                id="stop-memory-stress"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={stopMemoryStress}
              >
                Stop Memory Stress
              </button>
              <div className="text-sm text-gray-600">
                Current chunks: {memoryChunks.length} (~{Math.round(memoryChunks.length * MEMORY_STRESS.CHUNK_SIZE / 1024 / 1024)}MB)
              </div>
            </div>
          </div>

                     {/* DOM Stress */}
           <div className="border rounded-lg p-4">
             <h3 className="font-semibold mb-2">💥 DOM Elements Crash</h3>
             <p className="text-sm text-gray-600 mb-4">
               Creates MASSIVE numbers of complex DOM elements ({MEMORY_STRESS.DOM_ELEMENTS_BATCH} per batch) with NO delay.
               <strong>WILL CRASH THE TAB!</strong> No limits or cleanup.
             </p>
            <div className="space-y-2">
                             <button
                 id="start-dom-stress"
                 className={`px-4 py-2 rounded ${
                   domStressActive
                     ? 'bg-red-500 text-white'
                     : 'bg-red-600 text-white hover:bg-red-700'
                 }`}
                 onClick={startDOMStress}
                 disabled={domStressActive}
               >
                 {domStressActive ? '💥 CRASHING TAB...' : '🚨 START DOM CRASH'}
               </button>
              <button
                id="stop-dom-stress"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={stopDOMStress}
              >
                Stop DOM Stress
              </button>
            </div>
          </div>

          {/* Memory Leak Simulation */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Memory Leak Simulation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Creates infinite memory leaks with NO cleanup. Will run until tab crashes.
            </p>
            <button
              id="start-memory-leak"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={startMemoryLeak}
            >
              🚨 START MEMORY LEAK CRASH
            </button>
          </div>

          {/* Combined Crash Test */}
          <div className="border rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold mb-2 text-red-800">💀 ULTIMATE CRASH TEST</h3>
            <p className="text-sm text-red-700 mb-4">
              Combines ALL crash vectors simultaneously: memory allocation + DOM stress + memory leaks + stack overflow.
              <strong>WILL DEFINITELY CRASH THE TAB!</strong>
            </p>
            <button
              id="start-combined-crash"
              className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900 font-bold"
              onClick={startCombinedCrash}
            >
              🚨 CRASH THIS TAB NOW! 🚨
            </button>
          </div>

          {/* DOM Stress Container */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">DOM Stress Container</h3>
            <p className="text-sm text-gray-600 mb-4">
              Container where DOM elements are created during stress test.
            </p>
            <div
              id="dom-stress-container"
              className="bg-gray-50 rounded p-2 max-h-40 overflow-y-auto text-xs"
            >
              <div className="text-gray-500">DOM elements will appear here during stress test...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation and Transition Tests */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Animation and Transition Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CSS Animation */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">CSS Animation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Element with CSS animation. Agent should wait for stability.
            </p>
            <div className="min-h-20 bg-gray-50 rounded p-4 flex items-center justify-center">
              <div
                id="animated-element"
                className="px-4 py-2 bg-pink-500 text-white rounded animate-pulse"
              >
                Animated Element
              </div>
            </div>
          </div>

          {/* Fade In Element */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Fade In Element</h3>
            <p className="text-sm text-gray-600 mb-4">
              Element with fade-in transition. Agent should wait for visibility.
            </p>
            <div className="min-h-20 bg-gray-50 rounded p-4 flex items-center justify-center">
              <div
                id="fade-in-element"
                className="px-4 py-2 bg-teal-500 text-white rounded transition-opacity duration-2000 opacity-0 animate-pulse"
                style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
              >
                Fade In Element
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Testing Instructions</h2>
        <div className="text-blue-800 space-y-2">
          <p><strong>For wait_and_retry testing:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Try clicking elements before they're ready (should trigger retry logic)</li>
            <li>Test with slow loading elements and delayed interactions</li>
            <li>Verify exponential backoff behavior with multiple attempts</li>
          </ul>
          <p><strong>For dismiss_browser_dialogs testing:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Trigger various browser dialog types (alert, confirm, prompt)</li>
            <li>Test multiple dialogs in sequence</li>
            <li>Verify auto-dismissal behavior</li>
          </ul>
          <p><strong>For tab crash testing:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>These tests WILL crash the browser tab immediately</strong></li>
            <li>Test agent's ability to detect and recover from crashed tabs</li>
            <li>Verify crash detection and tab restart mechanisms</li>
            <li>Test agent's handling of unresponsive/frozen browser states</li>
            <li>🚨 <strong>GUARANTEED TAB CRASH:</strong> Use only for crash recovery testing</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manual Test Triggers</h2>
        <div className="text-blue-800 space-y-2">
          <p><strong>For manual testing:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Trigger various test scenarios manually</li>
            <li>Test agent's ability to handle different error conditions</li>
            <li>Verify agent's behavior in various browser states</li>
          </ul>
        </div>
        <button onClick={triggerSelectorMissing}>Trigger Selector Missing</button>
        <button onClick={triggerSelectorBlocked}>Trigger Selector Blocked</button>
        <button onClick={triggerNavigationTimeout}>Trigger Navigation Timeout</button>
        <button onClick={triggerUnknownTimeout}>Trigger Unknown Timeout</button>
      </div>
    </div>
  );
};