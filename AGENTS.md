# Browser Agent Test App Guide

This repository is a vendor-neutral browser automation fixture. Keep all data synthetic and all scenarios deterministic.

## Setup

```sh
npm run setup
npm run dev:all
```

The setup command installs both dependency trees and seeds the local SQLite database. The frontend runs on port 5173 and the backend runs on port 3001. Before browser testing, run `npm run smoke` in another terminal.

## Validation

Run `npm run check` after changes. When changing an interactive scenario, also start the app and verify the affected route with a real browser.

Interactive elements should have stable, descriptive `id` and `data-testid` attributes. API fixtures should return deterministic machine-readable results. File upload assertions should use the returned filename, MIME type, size, and SHA-256 digest.

## Repository boundaries

- Use only synthetic data.
- Do not add production credentials, private URLs, customer data, or vendor-specific implementation details.
- Keep uploads memory-only unless a test explicitly requires temporary persistence.
- Keep this application independent of the system under test.
