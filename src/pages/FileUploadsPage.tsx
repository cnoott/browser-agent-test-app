import React, { useRef, useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

type UploadedFileSummary = {
  fieldName: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
};

type UploadResponse = {
  success: boolean;
  files?: UploadedFileSummary[];
  error?: string;
};

type UploadState = {
  files: File[];
  result: UploadResponse | null;
  loading: boolean;
};

const initialUploadState: UploadState = {
  files: [],
  result: null,
  loading: false,
};

function FileList({ files }: { files: File[] }) {
  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No file selected</p>;
  }

  return (
    <ul className="space-y-1 text-sm text-gray-700" data-testid="selected-files">
      {files.map((file, index) => (
        <li key={`${file.name}-${file.size}-${index}`}>
          {file.name} ({file.size} bytes, {file.type || 'unknown MIME type'})
        </li>
      ))}
    </ul>
  );
}

function Result({ id, result }: { id: string; result: UploadResponse | null }) {
  if (!result) return null;

  return (
    <pre
      id={id}
      data-testid={id}
      className={`mt-4 overflow-x-auto rounded-lg p-3 text-xs ${
        result.success
          ? 'border border-green-200 bg-green-50 text-green-900'
          : 'border border-red-200 bg-red-50 text-red-900'
      }`}
    >
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

async function postFiles(files: File[], multiple: boolean) {
  const formData = new FormData();
  const fieldName = multiple ? 'files' : 'file';

  files.forEach((file) => formData.append(fieldName, file, file.name));

  const response = await fetch(
    `${API_BASE_URL}/api/uploads/${multiple ? 'multiple' : 'single'}`,
    { method: 'POST', body: formData },
  );
  const body = (await response.json()) as UploadResponse;

  if (!response.ok) {
    throw new Error(body.error ?? `Upload failed with HTTP ${response.status}`);
  }

  return body;
}

function useUploadState() {
  const [state, setState] = useState<UploadState>(initialUploadState);

  const selectFiles = (files: File[]) => {
    setState({ files, result: null, loading: false });
  };

  const submit = async (multiple: boolean) => {
    if (state.files.length === 0) {
      setState((current) => ({
        ...current,
        result: { success: false, error: 'Select at least one file.' },
      }));
      return;
    }

    setState((current) => ({ ...current, loading: true, result: null }));
    try {
      const result = await postFiles(state.files, multiple);
      setState((current) => ({ ...current, result, loading: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        result: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  };

  return { state, selectFiles, submit };
}

function ScenarioCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export const FileUploadsPage: React.FC = () => {
  const visible = useUploadState();
  const hidden = useUploadState();
  const multiple = useUploadState();
  const dropzone = useUploadState();
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [dropActive, setDropActive] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          File Upload Test Scenarios
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Deterministic targets for browser automation. Successful uploads return
          the filename, MIME type, byte count, and SHA-256 digest without storing
          the uploaded content.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScenarioCard
          title="Visible native file input"
          description="Use the input element directly, then click Submit upload."
        >
          <input
            id="visible-file-input"
            data-testid="visible-file-input"
            type="file"
            onChange={(event) =>
              visible.selectFiles(Array.from(event.currentTarget.files ?? []))
            }
            className="block w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
          <FileList files={visible.state.files} />
          <button
            id="visible-file-submit"
            data-testid="visible-file-submit"
            type="button"
            disabled={visible.state.loading}
            onClick={() => void visible.submit(false)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {visible.state.loading ? 'Uploading…' : 'Submit upload'}
          </button>
          <Result id="visible-file-result" result={visible.state.result} />
        </ScenarioCard>

        <ScenarioCard
          title="Button-triggered file chooser"
          description="The file input is hidden and opened from a custom button."
        >
          <input
            ref={hiddenInputRef}
            id="hidden-file-input"
            data-testid="hidden-file-input"
            type="file"
            className="hidden"
            onChange={(event) =>
              hidden.selectFiles(Array.from(event.currentTarget.files ?? []))
            }
          />
          <button
            id="hidden-file-trigger"
            data-testid="hidden-file-trigger"
            type="button"
            onClick={() => hiddenInputRef.current?.click()}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700"
          >
            Choose a file
          </button>
          <FileList files={hidden.state.files} />
          <button
            id="hidden-file-submit"
            data-testid="hidden-file-submit"
            type="button"
            disabled={hidden.state.loading}
            onClick={() => void hidden.submit(false)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {hidden.state.loading ? 'Uploading…' : 'Submit upload'}
          </button>
          <Result id="hidden-file-result" result={hidden.state.result} />
        </ScenarioCard>

        <ScenarioCard
          title="Multiple files"
          description="Select up to ten files and submit them in one multipart request."
        >
          <input
            id="multiple-file-input"
            data-testid="multiple-file-input"
            type="file"
            multiple
            onChange={(event) =>
              multiple.selectFiles(Array.from(event.currentTarget.files ?? []))
            }
            className="block w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
          <FileList files={multiple.state.files} />
          <button
            id="multiple-file-submit"
            data-testid="multiple-file-submit"
            type="button"
            disabled={multiple.state.loading}
            onClick={() => void multiple.submit(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {multiple.state.loading ? 'Uploading…' : 'Submit files'}
          </button>
          <Result id="multiple-file-result" result={multiple.state.result} />
        </ScenarioCard>

        <ScenarioCard
          title="Drag-and-drop zone"
          description="Drop one or more files onto the target before submitting."
        >
          <div
            id="file-drop-zone"
            data-testid="file-drop-zone"
            role="button"
            tabIndex={0}
            onDragEnter={(event) => {
              event.preventDefault();
              setDropActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDropActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDropActive(false);
              dropzone.selectFiles(Array.from(event.dataTransfer.files));
            }}
            className={`rounded-xl border-2 border-dashed p-10 text-center text-sm font-medium transition-colors ${
              dropActive
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-300 bg-gray-50 text-gray-600'
            }`}
          >
            Drop files here
          </div>
          <FileList files={dropzone.state.files} />
          <button
            id="dropzone-file-submit"
            data-testid="dropzone-file-submit"
            type="button"
            disabled={dropzone.state.loading}
            onClick={() => void dropzone.submit(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {dropzone.state.loading ? 'Uploading…' : 'Submit dropped files'}
          </button>
          <Result id="dropzone-file-result" result={dropzone.state.result} />
        </ScenarioCard>
      </div>

      <section className="rounded-xl bg-slate-950 p-5 text-sm text-slate-100">
        <h2 className="font-semibold">Upload API</h2>
        <p className="mt-2 font-mono">POST {API_BASE_URL}/api/uploads/single</p>
        <p className="font-mono">POST {API_BASE_URL}/api/uploads/multiple</p>
        <p className="mt-2 text-slate-300">
          Limits: 25 MiB per file, 10 files per request. Content is processed in
          memory and discarded after the response.
        </p>
      </section>
    </div>
  );
};
