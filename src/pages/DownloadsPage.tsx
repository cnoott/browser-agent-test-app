import React, { useMemo, useState } from 'react';

interface ClientRecord {
  id: string;
  name: string;
  dob: string;
  address: string;
  summary: string;
}

type ScenarioKey =
  | 'scrambleFiles'
  | 'sortLinkMismatch'
  | 'staleTableAddresses'
  | 'filenameMismatch'
  | 'contradictoryPdfSummary'
  | 'nicknameDrift'
  | 'mixedDobFormats'
  | 'zipDrift';

type ScenarioState = Record<ScenarioKey, boolean>;

interface ScenarioDefinition {
  key: ScenarioKey;
  title: string;
  description: string;
  category: 'Higher-value' | 'Subtle';
}

interface RenderedRow {
  id: string;
  displayedClient: ClientRecord;
  boundClient: ClientRecord;
  fileClient: ClientRecord;
  filenameClient: ClientRecord;
  displayName: string;
  displayDob: string;
  displayAddress: string;
}

const clients: ClientRecord[] = [
  {
    id: 'client-1',
    name: 'Avery Thompson',
    dob: '1987-04-12',
    address: '1847 Pine Hollow Rd, Denver, CO 80203',
    summary:
      'Avery enjoys tidy workflows, color-coded folders, and taking weekend trips to mountain towns whenever a long stretch of work wraps up.'
  },
  {
    id: 'client-2',
    name: 'Maya Patel',
    dob: '1992-09-28',
    address: '52 Harbor View Ave, San Diego, CA 92101',
    summary:
      'Maya is a patient planner who likes early morning walks, strong coffee, and keeping every important document exactly where it should be.'
  },
  {
    id: 'client-3',
    name: 'Jordan Ramirez',
    dob: '1979-01-05',
    address: '903 Elm Street, Austin, TX 78702',
    summary:
      'Jordan spends free time restoring old speakers, reading local history, and writing notes about new ideas in a small paper notebook.'
  },
  {
    id: 'client-4',
    name: 'Naomi Brooks',
    dob: '1985-11-16',
    address: '411 Cedar Lane, Portland, OR 97205',
    summary:
      'Naomi prefers calm routines, fresh bakery runs on Fridays, and short handwritten checklists that make busy days feel manageable.'
  },
  {
    id: 'client-5',
    name: 'Ethan Walker',
    dob: '1990-06-21',
    address: '77 Maple Crest Dr, Chicago, IL 60611',
    summary:
      'Ethan likes practical tools, well-labeled files, and quiet afternoons spent comparing travel ideas for his next city break.'
  }
];

const scenarioDefinitions: ScenarioDefinition[] = [
  {
    key: 'scrambleFiles',
    title: 'Scramble file contents',
    description: 'Each row downloads the next client file instead of its own file.',
    category: 'Higher-value'
  },
  {
    key: 'sortLinkMismatch',
    title: 'Sort and bind by old index',
    description: 'Rows are visually resorted, but the click handler still uses the original unsorted record binding.',
    category: 'Higher-value'
  },
  {
    key: 'staleTableAddresses',
    title: 'Stale addresses in table',
    description: 'Displayed addresses come from an older snapshot while the file source stays current.',
    category: 'Higher-value'
  },
  {
    key: 'filenameMismatch',
    title: 'Filename and body disagree',
    description: 'The downloaded filename points to one client while the PDF body can describe another.',
    category: 'Higher-value'
  },
  {
    key: 'contradictoryPdfSummary',
    title: 'Contradictory PDF summary',
    description: 'The PDF paragraph contains a conflicting DOB and mailing address reference.',
    category: 'Higher-value'
  },
  {
    key: 'nicknameDrift',
    title: 'Nickname and legal name drift',
    description: 'The table shows near-match name variants instead of the canonical client name.',
    category: 'Subtle'
  },
  {
    key: 'mixedDobFormats',
    title: 'Mixed DOB formats',
    description: 'Dates stay semantically similar but switch formatting patterns across rows.',
    category: 'Subtle'
  },
  {
    key: 'zipDrift',
    title: 'One-digit ZIP drift',
    description: 'The table address shows a tiny ZIP-code mutation that can be easy to miss.',
    category: 'Subtle'
  }
];

const staleAddressById: Record<string, string> = {
  'client-1': '67 Willow Bend Rd, Boulder, CO 80302',
  'client-2': '905 Seaside Blvd, Chula Vista, CA 91910',
  'client-3': '118 Riverfront Ave, Round Rock, TX 78664',
  'client-4': '214 Alder Street, Beaverton, OR 97005',
  'client-5': '491 Lake Shore Dr, Evanston, IL 60201'
};

const nicknameById: Record<string, string> = {
  'client-1': 'Ava Thompson',
  'client-2': 'May Patel',
  'client-3': 'Jordy Ramirez',
  'client-4': 'N. Brooks',
  'client-5': 'E. Walker'
};

const mixedDobById: Record<string, string> = {
  'client-1': '04/12/1987',
  'client-2': '28 Sep 1992',
  'client-3': '01-05-1979',
  'client-4': '16/11/1985',
  'client-5': '1990/06/21'
};

const initialScenarioState: ScenarioState = {
  scrambleFiles: false,
  sortLinkMismatch: false,
  staleTableAddresses: false,
  filenameMismatch: false,
  contradictoryPdfSummary: false,
  nicknameDrift: false,
  mixedDobFormats: false,
  zipDrift: false
};

const escapePdfText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapPdfText = (value: string, maxLength = 72) => {
  const words = value.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }

    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const createSimplePdfBlob = (title: string, paragraph: string) => {
  const lines = [title, '', ...wrapPdfText(paragraph)];
  const content = [
    'BT',
    '/F1 18 Tf',
    '72 720 Td',
    ...lines.flatMap((line, index) => {
      const prefix = index === 0 ? [] : ['0 -22 Td'];
      return [...prefix, `(${escapePdfText(line)}) Tj`];
    }),
    'ET'
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getClientIndex = (clientId: string) => clients.findIndex((client) => client.id === clientId);

const getShiftedClient = (client: ClientRecord, offset: number) => {
  const index = getClientIndex(client.id);
  return clients[(index + offset + clients.length) % clients.length];
};

const driftZipCode = (address: string) =>
  address.replace(/(\d)(?!.*\d)/, (digit) => `${(Number(digit) + 1) % 10}`);

const slugifyClientName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const buildPdfSummary = (fileClient: ClientRecord, contradictoryPdfSummary: boolean) => {
  if (!contradictoryPdfSummary) {
    return fileClient.summary;
  }

  const conflictingClient = getShiftedClient(fileClient, 2);

  return `${fileClient.summary} Archive note: another source still references DOB ${conflictingClient.dob} and mailing address ${conflictingClient.address}.`;
};

const ToggleSwitch: React.FC<{
  checked: boolean;
  onToggle: () => void;
  label: string;
  description: string;
}> = ({ checked, onToggle, label, description }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </div>
);

export const DownloadsPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioState>(initialScenarioState);

  const activeScenarioCount = useMemo(
    () => Object.values(scenarios).filter(Boolean).length,
    [scenarios]
  );

  const renderedRows = useMemo<RenderedRow[]>(() => {
    const displayedOrder = scenarios.sortLinkMismatch
      ? [...clients].sort((left, right) => left.name.localeCompare(right.name))
      : clients;

    return displayedOrder.map((displayedClient, displayIndex) => {
      const boundClient = scenarios.sortLinkMismatch ? clients[displayIndex] : displayedClient;
      const fileClient = scenarios.scrambleFiles ? getShiftedClient(boundClient, 1) : boundClient;
      const filenameClient = scenarios.filenameMismatch
        ? getShiftedClient(displayedClient, 2)
        : displayedClient;

      let displayAddress = scenarios.staleTableAddresses
        ? staleAddressById[displayedClient.id] ?? displayedClient.address
        : displayedClient.address;

      if (scenarios.zipDrift) {
        displayAddress = driftZipCode(displayAddress);
      }

      return {
        id: displayedClient.id,
        displayedClient,
        boundClient,
        fileClient,
        filenameClient,
        displayName: scenarios.nicknameDrift
          ? nicknameById[displayedClient.id] ?? displayedClient.name
          : displayedClient.name,
        displayDob: scenarios.mixedDobFormats
          ? mixedDobById[displayedClient.id] ?? displayedClient.dob
          : displayedClient.dob,
        displayAddress
      };
    });
  }, [scenarios]);

  const toggleScenario = (key: ScenarioKey) => {
    setScenarios((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };

  const resetScenarios = () => {
    setScenarios(initialScenarioState);
  };

  const handleDownload = (row: RenderedRow) => {
    const pdf = createSimplePdfBlob(
      row.fileClient.name,
      buildPdfSummary(row.fileClient, scenarios.contradictoryPdfSummary)
    );
    const filename = `${slugifyClientName(row.filenameClient.name)}-file.pdf`;
    downloadBlob(pdf, filename);
  };

  const higherValueScenarios = scenarioDefinitions.filter(
    (scenario) => scenario.category === 'Higher-value'
  );
  const subtleScenarios = scenarioDefinitions.filter((scenario) => scenario.category === 'Subtle');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold text-gray-900">Client Download Audit Lab</h1>
              <p className="mt-2 text-sm text-gray-600">
                Combine switches to stress-test whether an audit agent can reconcile table values,
                click bindings, filenames, and PDF contents under realistic quality failures.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
                {activeScenarioCount} active scenario{activeScenarioCount === 1 ? '' : 's'}
              </div>
              <button
                type="button"
                onClick={resetScenarios}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition-colors hover:bg-gray-100"
              >
                Reset all
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Higher-value scenarios
              </h2>
              <div className="space-y-3">
                {higherValueScenarios.map((scenario) => (
                  <ToggleSwitch
                    key={scenario.key}
                    checked={scenarios[scenario.key]}
                    onToggle={() => toggleScenario(scenario.key)}
                    label={scenario.title}
                    description={scenario.description}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Subtle scenarios
              </h2>
              <div className="space-y-3">
                {subtleScenarios.map((scenario) => (
                  <ToggleSwitch
                    key={scenario.key}
                    checked={scenarios[scenario.key]}
                    onToggle={() => toggleScenario(scenario.key)}
                    label={scenario.title}
                    description={scenario.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900">Client download table</h2>
            <p className="mt-1 text-sm text-gray-600">
              The table below is what your audit agent should evaluate against the downloaded PDF artifact.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Client DOB
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Client Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Client File
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {renderedRows.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {row.displayName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {row.displayDob}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.displayAddress}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(row)}
                          className="w-fit rounded-md bg-blue-600 px-3 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Download PDF
                        </button>
                        <span className="text-xs text-gray-500">
                          Expected file label: {slugifyClientName(row.displayedClient.name)}-file.pdf
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};