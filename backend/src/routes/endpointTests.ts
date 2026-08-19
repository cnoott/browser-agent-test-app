import express from 'express';
import { randomUUID } from 'crypto';

const router = express.Router();

type CapturedRequest = {
  id: string;
  receivedAt: string;
  method: string;
  path: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[]>;
  body: unknown;
  ip: string | undefined;
};

type CatalogItem = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
};

const MAX_CAPTURED_REQUESTS = 10;
const CATALOG_ITEM_COUNT = 37_000;

const capturedRequests: CapturedRequest[] = [];
let totalReceivedRequests = 0;

const catalogItems: CatalogItem[] = Array.from({ length: CATALOG_ITEM_COUNT }, (_, index) => {
  const id = index + 1;
  const categories = ['Hardware', 'Software', 'Services', 'Training'];

  return {
    id,
    sku: `SKU-${String(id).padStart(4, '0')}`,
    name: `Catalog Item ${id}`,
    category: categories[index % categories.length],
    price: 20 + id * 3,
    inStock: id % 5 !== 0,
  };
});

function normalizeHeaders(
  headers: express.Request['headers'],
): Record<string, string | string[]> {
  const normalized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalized[key] = value;
    } else if (value !== undefined) {
      normalized[key] = value;
    }
  }

  return normalized;
}

function normalizeQuery(
  query: express.Request['query'],
): Record<string, string | string[]> {
  const normalized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      normalized[key] = value.map((item) => String(item));
    } else if (value !== undefined) {
      normalized[key] = String(value);
    }
  }

  return normalized;
}

function captureRequest(req: express.Request): CapturedRequest {
  totalReceivedRequests++;

  const captured: CapturedRequest = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    query: normalizeQuery(req.query),
    headers: normalizeHeaders(req.headers),
    body: req.body,
    ip: req.ip,
  };

  capturedRequests.unshift(captured);
  capturedRequests.splice(MAX_CAPTURED_REQUESTS);

  return captured;
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseNonNegativeInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

router.get('/requests', (req, res) => {
  const limit = Math.min(
    parsePositiveInteger(req.query.limit, MAX_CAPTURED_REQUESTS),
    MAX_CAPTURED_REQUESTS,
  );
  const data = capturedRequests.slice(0, limit);

  res.json({
    success: true,
    data,
    total: totalReceivedRequests,
    retained: capturedRequests.length,
    displayed: data.length,
    maxDisplayed: MAX_CAPTURED_REQUESTS,
    timestamp: new Date().toISOString(),
  });
});

router.delete('/requests', (_req, res) => {
  capturedRequests.splice(0, capturedRequests.length);
  totalReceivedRequests = 0;

  res.json({
    success: true,
    data: [],
    total: 0,
    retained: 0,
    displayed: 0,
    maxDisplayed: MAX_CAPTURED_REQUESTS,
    timestamp: new Date().toISOString(),
  });
});

router.all('/incoming', (req, res) => {
  const captured = captureRequest(req);

  res.status(202).json({
    success: true,
    message: 'Request captured by the endpoint testing app.',
    requestId: captured.id,
    receivedAt: captured.receivedAt,
    echo: {
      method: captured.method,
      query: captured.query,
      body: captured.body,
    },
  });
});

router.get('/paginated/offset', (req, res) => {
  const limit = parsePositiveInteger(req.query.limit, 5);
  const offset = parseNonNegativeInteger(req.query.offset, 0);
  const items = catalogItems.slice(offset, offset + limit);
  const nextOffset = offset + items.length;

  res.json({
    success: true,
    items,
    total: catalogItems.length,
    limit,
    offset,
    nextOffset: nextOffset < catalogItems.length ? nextOffset : null,
    timestamp: new Date().toISOString(),
  });
});

router.get('/paginated/page', (req, res) => {
  const limit = parsePositiveInteger(req.query.limit, 5);
  const page = parseNonNegativeInteger(req.query.page, 0);
  const offset = page * limit;
  const items = catalogItems.slice(offset, offset + limit);
  const nextPage = offset + items.length < catalogItems.length ? page + 1 : null;

  res.json({
    success: true,
    items,
    total: catalogItems.length,
    limit,
    page,
    nextPage,
    timestamp: new Date().toISOString(),
  });
});

router.get('/paginated/cursor', (req, res) => {
  const limit = parsePositiveInteger(req.query.limit, 5);
  const cursor = parseNonNegativeInteger(req.query.cursor, 0);
  const items = catalogItems.slice(cursor, cursor + limit);
  const nextCursor = cursor + items.length;

  res.json({
    success: true,
    items,
    pagination: {
      nextCursor: nextCursor < catalogItems.length ? String(nextCursor) : null,
      limit,
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/paginated/link', (req, res) => {
  const limit = parsePositiveInteger(req.query.limit, 5);
  const cursor = parseNonNegativeInteger(req.query.cursor, 0);
  const items = catalogItems.slice(cursor, cursor + limit);
  const nextCursor = cursor + items.length;

  if (nextCursor < catalogItems.length) {
    const origin = `${req.protocol}://${req.get('host')}`;
    const nextUrl = `${origin}/api/endpoint-tests/paginated/link?cursor=${nextCursor}&limit=${limit}`;
    res.setHeader('Link', `<${nextUrl}>; rel="next"`);
  }

  res.json({
    success: true,
    items,
    limit,
    cursor,
    timestamp: new Date().toISOString(),
  });
});

export default router;
