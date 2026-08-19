import React, { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = 'http://localhost:3001';

type CapturedRequest = {
  id: string;
  receivedAt: string;
  method: string;
  path: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[]>;
  body: unknown;
  ip?: string;
};

type RequestsResponse = {
  success: boolean;
  data: CapturedRequest[];
  total: number;
  retained: number;
  displayed: number;
  maxDisplayed: number;
  timestamp: string;
};

type CatalogItem = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
};

type PaginatedPreviewResponse = {
  success: boolean;
  items: CatalogItem[];
  total?: number;
  limit?: number;
  offset?: number;
  nextOffset?: number | null;
  pagination?: {
    nextCursor: string | null;
    limit: number;
  };
  timestamp: string;
};

function JsonBlock(props: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
      {JSON.stringify(props.value, null, 2)}
    </pre>
  );
}

function CodeBlock(props: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
      {props.children}
    </pre>
  );
}

function EndpointBadge(props: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
      {props.children}
    </code>
  );
}

export const ApiEndpointTestingPage: React.FC = () => {
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [requestStats, setRequestStats] = useState({
    total: 0,
    retained: 0,
    displayed: 0,
    maxDisplayed: 10,
  });
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PaginatedPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const incomingUrl = `${API_BASE_URL}/api/endpoint-tests/incoming`;
  const offsetUrl = `${API_BASE_URL}/api/endpoint-tests/paginated/offset`;
  const cursorUrl = `${API_BASE_URL}/api/endpoint-tests/paginated/cursor`;
  const linkUrl = `${API_BASE_URL}/api/endpoint-tests/paginated/link`;

  const incomingRequestConfig = useMemo(
    () => ({
      request: {
        method: 'POST',
        url: incomingUrl,
        headers: {
          Authorization: 'Bearer {{ credentials.apiToken }}',
          'X-Test-Run': '{{ run.key }}',
        },
        query: {
          source: 'agent-endpoint-test',
          external_id: '{{ row.id }}',
        },
        batchSize: 1,
        timeoutMs: 30000,
      },
      response: {
        successStatuses: [200, 201, 202],
        path: 'requestId',
      },
      execution: {
        maxConcurrency: 3,
        requestsPerSecond: 2,
      },
      errorPolicy: {
        onError: 'continue',
      },
    }),
    [incomingUrl],
  );

  const cursorPaginationConfig = useMemo(
    () => ({
      request: {
        method: 'GET',
        url: cursorUrl,
        query: {
          source: 'agent-pagination-test',
        },
      },
      pagination: {
        type: 'cursor',
        itemsPath: 'items',
        cursorParam: 'cursor',
        limitParam: 'limit',
        limitValue: 5,
        nextCursorPath: 'pagination.nextCursor',
        expandItemsToRows: true,
      },
      execution: {
        maxConcurrency: 1,
        requestsPerSecond: 5,
      },
    }),
    [cursorUrl],
  );

  const fetchRequests = async () => {
    try {
      setRequestsError(null);
      const response = await fetch(
        `${API_BASE_URL}/api/endpoint-tests/requests?limit=10`,
      );
      const result = (await response.json()) as RequestsResponse;

      if (!result.success) {
        throw new Error('Request log API returned an error');
      }

      setRequests(result.data);
      setRequestStats({
        total: result.total,
        retained: result.retained,
        displayed: result.displayed,
        maxDisplayed: result.maxDisplayed,
      });
    } catch (error) {
      console.error('Failed to fetch endpoint test requests:', error);
      setRequestsError('Could not load the request log. Is the backend running?');
    } finally {
      setRequestsLoading(false);
    }
  };

  const clearRequests = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/endpoint-tests/requests`, {
        method: 'DELETE',
      });
      await fetchRequests();
    } catch (error) {
      console.error('Failed to clear endpoint test requests:', error);
      setRequestsError('Could not clear the request log.');
    }
  };

  const sendSampleRequest = async () => {
    await fetch(incomingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer local-demo-token',
        'X-Test-Source': 'ui-sample',
      },
      body: JSON.stringify({
        id: `sample-${Date.now()}`,
        email: 'endpoint-test@example.com',
        status: 'ready',
      }),
    });
    await fetchRequests();
  };

  const loadPreview = async (url: string) => {
    try {
      setPreviewError(null);
      const response = await fetch(url);
      const result = (await response.json()) as PaginatedPreviewResponse;
      setPreview(result);
    } catch (error) {
      console.error('Failed to load paginated preview:', error);
      setPreviewError('Could not load paginated preview.');
    }
  };

  useEffect(() => {
    void fetchRequests();
    void loadPreview(`${offsetUrl}?offset=0&limit=5`);

    const intervalId = window.setInterval(() => {
      void fetchRequests();
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [offsetUrl]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="rounded-lg bg-white p-6 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          API endpoint tests
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          API Endpoint Playground
        </h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          Use this page as a visible target for browser automation. It exposes
          a request capture endpoint for delivery tests and paginated APIs for
          source-mode fetch tests.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Incoming Request Capture
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Configure your automation agent to send rows here. The dashboard below refreshes
                every two seconds and shows method, query, headers, and body.
              </p>
            </div>
            <EndpointBadge>POST /incoming</EndpointBadge>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                Endpoint URL
              </p>
              <CodeBlock>{incomingUrl}</CodeBlock>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                Example advanced configuration
              </p>
              <JsonBlock value={incomingRequestConfig} />
            </div>
            <button
              type="button"
              onClick={() => void sendSampleRequest()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Send sample request
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Paginated Data Source
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Use these GET endpoints for source-mode automation nodes.
                The response has an <EndpointBadge>items</EndpointBadge> array
                and stable pagination markers across 37,000 fixture records.
              </p>
            </div>
            <EndpointBadge>GET /paginated/*</EndpointBadge>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void loadPreview(`${offsetUrl}?offset=0&limit=5`)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Preview offset
              </button>
              <button
                type="button"
                onClick={() => void loadPreview(`${cursorUrl}?limit=5`)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Preview cursor
              </button>
              <button
                type="button"
                onClick={() => void loadPreview(`${linkUrl}?limit=5`)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Preview Link header
              </button>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                Cursor pagination example
              </p>
              <JsonBlock value={cursorPaginationConfig} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-800">
                Pagination endpoints
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <EndpointBadge>{`${offsetUrl}?offset=0&limit=5`}</EndpointBadge>
                </li>
                <li>
                  <EndpointBadge>{`${API_BASE_URL}/api/endpoint-tests/paginated/page?page=0&limit=5`}</EndpointBadge>
                </li>
                <li>
                  <EndpointBadge>{`${cursorUrl}?limit=5`}</EndpointBadge>
                </li>
                <li>
                  <EndpointBadge>{`${linkUrl}?limit=5`}</EndpointBadge>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Live Request Log
              </h2>
              <p className="text-sm text-gray-500">
                {requestStats.total.toLocaleString()} total received, showing
                latest {requestStats.displayed.toLocaleString()} of{' '}
                {requestStats.maxDisplayed.toLocaleString()}
              </p>
              {requestStats.total > requestStats.retained ? (
                <p className="text-xs text-gray-400">
                  Older requests are counted but not retained in memory.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void clearRequests()}
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Clear
            </button>
          </div>

          {requestsLoading ? (
            <p className="text-sm text-gray-500">Loading request log...</p>
          ) : requestsError ? (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {requestsError}
            </p>
          ) : requests.length === 0 ? (
            <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
              No requests captured yet. Send a sample request or run a browser automation
              endpoint node against the incoming URL.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                      {request.method}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {request.path}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(request.receivedAt).toLocaleString()}
                    </span>
                  </div>
                  <JsonBlock
                    value={{
                      query: request.query,
                      headers: request.headers,
                      body: request.body,
                    }}
                  />
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            Paginated Preview
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This confirms the fixture endpoint is returning predictable pages
            before you point your automation agent at it.
          </p>

          <div className="mt-4">
            {previewError ? (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {previewError}
              </p>
            ) : preview ? (
              <JsonBlock value={preview} />
            ) : (
              <p className="text-sm text-gray-500">Loading preview...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
