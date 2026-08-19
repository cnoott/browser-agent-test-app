import express, { Request, Response } from 'express';

const router = express.Router();

// Sample data for generating files
const generateSampleCSV = (rows: number = 1000): string => {
  let csv = 'ID,Name,Email,Department,Salary,Date\n';
  for (let i = 1; i <= rows; i++) {
    csv += `${i},User ${i},user${i}@example.com,Department ${(i % 5) + 1},${Math.floor(Math.random() * 50000) + 30000},${new Date().toISOString().split('T')[0]}\n`;
  }
  return csv;
};

const generateSamplePDF = (): Buffer => {
  // Simple PDF content (this is a minimal PDF structure)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Sample PDF Download Test) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000204 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
  return Buffer.from(pdfContent);
};

// Instant download endpoints
router.get('/sample-csv', (req, res) => {
  const rows = parseInt(req.query.rows as string) || 1000;
  const csv = generateSampleCSV(rows);

  res.setHeader('Content-Disposition', `attachment; filename="sample-data-${rows}-rows.csv"`);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Length', Buffer.byteLength(csv));

  res.send(csv);
});

router.get('/sample-pdf', (req, res) => {
  const pdf = generateSamplePDF();

  res.setHeader('Content-Disposition', 'attachment; filename="sample-document.pdf"');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdf.length);

  res.send(pdf);
});

router.get('/view-pdf', (req, res) => {
  const pdf = generateSamplePDF();
  const filename = 'inline-preview.pdf';

  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdf.length);

  res.send(pdf);
});

router.get('/sample-json', (req, res) => {
  const records = parseInt(req.query.records as string) || 100;
  const data = {
    metadata: {
      total: records,
      generated: new Date().toISOString(),
      type: 'sample-data'
    },
    records: Array.from({ length: records }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      category: `Category ${(i % 3) + 1}`,
      active: Math.random() > 0.3
    }))
  };

  const json = JSON.stringify(data, null, 2);

  res.setHeader('Content-Disposition', `attachment; filename="sample-data-${records}-records.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(json));

  res.send(json);
});

// Slow download with progress simulation
router.get('/slow-download', async (req, res) => {
  const type = req.query.type as string || 'csv';
  const delay = parseInt(req.query.delay as string) || 5000; // Default 5 seconds
  const chunkDelay = parseInt(req.query.chunkDelay as string) || 500; // Delay between chunks

  let content: Buffer;
  let filename: string;
  let mimeType: string;

  switch (type) {
    case 'pdf': {
      content = generateSamplePDF();
      filename = 'slow-download.pdf';
      mimeType = 'application/pdf';
      break;
    }
    case 'json': {
      const jsonData = generateSampleCSV(5000); // Large dataset
      content = Buffer.from(jsonData);
      filename = 'slow-download.json';
      mimeType = 'application/json';
      break;
    }
    default: {
      content = Buffer.from(generateSampleCSV(10000)); // Large CSV
      filename = 'slow-download.csv';
      mimeType = 'text/csv';
    }
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', content.length);

  // Send initial delay
  await new Promise(resolve => setTimeout(resolve, delay));

  // Send content in chunks with delays
  const chunkSize = Math.max(1024, Math.floor(content.length / 20)); // Send in ~20 chunks
  let offset = 0;

  while (offset < content.length) {
    const chunk = content.subarray(offset, Math.min(offset + chunkSize, content.length));
    res.write(chunk);
    offset += chunkSize;

    if (offset < content.length) {
      await new Promise(resolve => setTimeout(resolve, chunkDelay));
    }
  }

  res.end();
});

// Download with random failure simulation
router.get('/unreliable-download', async (req: Request, res: Response) => {
  const failureRate = parseFloat(req.query.failureRate as string) || 0.3; // 30% failure rate
  const type = req.query.type as string || 'csv';

  // Simulate random failure
  if (Math.random() < failureRate) {
    res.status(500).json({
      success: false,
      error: 'Download server temporarily unavailable'
    });
    return;
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  let content: Buffer;
  let filename: string;
  let mimeType: string;

  switch (type) {
    case 'pdf': {
      content = generateSamplePDF();
      filename = 'unreliable-download.pdf';
      mimeType = 'application/pdf';
      break;
    }
    case 'json': {
      const jsonData = JSON.stringify({ message: 'This download might fail randomly' }, null, 2);
      content = Buffer.from(jsonData);
      filename = 'unreliable-download.json';
      mimeType = 'application/json';
      break;
    }
    default: {
      content = Buffer.from(generateSampleCSV(1000));
      filename = 'unreliable-download.csv';
      mimeType = 'text/csv';
    }
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', content.length);

  res.send(content);
});

// Large file download (simulated)
router.get('/large-file', async (req, res) => {
  const sizeInMB = parseInt(req.query.size as string) || 10; // Default 10MB
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalSize = sizeInMB * chunkSize;

  res.setHeader('Content-Disposition', `attachment; filename="large-file-${sizeInMB}mb.bin"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', totalSize);

  let sent = 0;
  const chunk = Buffer.alloc(chunkSize, 'A'); // Fill with 'A' characters

  while (sent < totalSize) {
    const remainingSize = totalSize - sent;
    const currentChunkSize = Math.min(chunkSize, remainingSize);

    if (currentChunkSize < chunkSize) {
      res.write(chunk.subarray(0, currentChunkSize));
    } else {
      res.write(chunk);
    }

    sent += currentChunkSize;

    // Small delay to simulate bandwidth limitations
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  res.end();
});

// Simple test files downloads
router.get('/test-csv', (req, res) => {
  // Generate approximately 10MB of CSV data
  // Each row is roughly 70-80 bytes, so ~130,000 rows should give us about 10MB
  const csv = generateSampleCSV(150000);

  res.setHeader('Content-Disposition', 'attachment; filename="test-data-10mb.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Length', Buffer.byteLength(csv));

  res.send(csv);
});

router.get('/test-json', (req, res) => {
  const data = {
    message: "Simple test JSON file",
    timestamp: new Date().toISOString(),
    data: [
      { id: 1, name: "Apple", category: "Fruit", price: 1.20 },
      { id: 2, name: "Banana", category: "Fruit", price: 0.80 },
      { id: 3, name: "Carrot", category: "Vegetable", price: 0.60 },
      { id: 4, name: "Broccoli", category: "Vegetable", price: 2.50 }
    ],
    total_items: 4
  };

  const json = JSON.stringify(data, null, 2);

  res.setHeader('Content-Disposition', 'attachment; filename="test-data.json"');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(json));

  res.send(json);
});

// Get download status/info
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      availableDownloads: [
        {
          id: 'test-csv',
          name: 'Test CSV',
          description: 'Simple test CSV file with sample data'
        },
        {
          id: 'test-json',
          name: 'Test JSON',
          description: 'Simple test JSON file with sample data'
        },
        {
          id: 'sample-csv',
          name: 'Sample CSV',
          description: 'Generate CSV data with customizable row count',
          parameters: ['rows']
        },
        {
          id: 'sample-pdf',
          name: 'Sample PDF',
          description: 'Simple PDF document for testing'
        },
        {
          id: 'sample-json',
          name: 'Sample JSON',
          description: 'JSON data with customizable record count',
          parameters: ['records']
        },
        {
          id: 'slow-download',
          name: 'Slow Download',
          description: 'Simulates slow download with configurable delays',
          parameters: ['type', 'delay', 'chunkDelay']
        },
        {
          id: 'unreliable-download',
          name: 'Unreliable Download',
          description: 'Randomly fails to test error handling',
          parameters: ['type', 'failureRate']
        },
        {
          id: 'large-file',
          name: 'Large File',
          description: 'Generate large binary file for testing',
          parameters: ['size']
        }
      ]
    }
  });
});

export default router;
