import { createHash } from 'node:crypto';

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 30_000);

async function waitFor(url) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

await waitFor(`${backendUrl}/api/health`);
await waitFor(frontendUrl);

const content = 'browser-agent-upload-smoke-test\n';
const expectedSha256 = createHash('sha256').update(content).digest('hex');
const formData = new FormData();
formData.append(
  'file',
  new Blob([content], { type: 'text/plain' }),
  'smoke-test.txt',
);

const uploadResponse = await fetch(`${backendUrl}/api/uploads/single`, {
  method: 'POST',
  body: formData,
});
const uploadBody = await uploadResponse.json();

if (!uploadResponse.ok) {
  throw new Error(
    `Upload endpoint returned HTTP ${uploadResponse.status}: ${JSON.stringify(uploadBody)}`,
  );
}

const uploaded = uploadBody.files?.[0];
if (
  uploaded?.originalName !== 'smoke-test.txt' ||
  uploaded?.mimeType !== 'text/plain' ||
  uploaded?.size !== Buffer.byteLength(content) ||
  uploaded?.sha256 !== expectedSha256
) {
  throw new Error(`Unexpected upload response: ${JSON.stringify(uploadBody)}`);
}

process.stdout.write(
  `Smoke test passed: frontend, backend, and multipart upload are healthy.\n`,
);
