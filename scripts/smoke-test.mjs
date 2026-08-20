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

const fixtureResponse = await fetch(
  `${backendUrl}/api/downloads/upload-fixture`,
);
if (!fixtureResponse.ok) {
  throw new Error(
    `Round-trip fixture returned HTTP ${fixtureResponse.status}`,
  );
}

const fixtureBytes = Buffer.from(await fixtureResponse.arrayBuffer());
const fixtureSha256 = createHash('sha256').update(fixtureBytes).digest('hex');
const roundTripFormData = new FormData();
roundTripFormData.append(
  'file',
  new Blob([fixtureBytes], { type: 'text/csv' }),
  'upload-round-trip.csv',
);

const roundTripUploadResponse = await fetch(
  `${backendUrl}/api/uploads/single`,
  { method: 'POST', body: roundTripFormData },
);
const roundTripUploadBody = await roundTripUploadResponse.json();
const roundTripUpload = roundTripUploadBody.files?.[0];

if (
  !roundTripUploadResponse.ok ||
  roundTripUpload?.originalName !== 'upload-round-trip.csv' ||
  roundTripUpload?.mimeType !== 'text/csv' ||
  roundTripUpload?.size !== fixtureBytes.length ||
  roundTripUpload?.sha256 !== fixtureSha256
) {
  throw new Error(
    `Unexpected round-trip upload response: ${JSON.stringify(roundTripUploadBody)}`,
  );
}

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
  `Smoke test passed: frontend, backend, multipart upload, and download/upload round-trip are healthy.\n`,
);
