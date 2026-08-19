import React, { useMemo, useState } from 'react';

export const DownloadListsPage: React.FC = () => {
  const [jumpValue, setJumpValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSmallFile, setIsSmallFile] = useState<boolean>(false);

  const itemsPerPage = 50;
  const totalItems = 3000;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleDownload = () => {
    if (isSmallFile) {
      // Small file: ~3KB CSV with 50 rows
      const url = 'http://localhost:3001/api/downloads/sample-csv?rows=50';
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-data-3kb.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Large file: 10MB CSV
      const url = 'http://localhost:3001/api/downloads/test-csv';
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-data-10mb.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const items = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
  }, [currentPage]);

  const formatId = (index: number) => `dl-${String(index + 1).padStart(4, '0')}`;

  const jumpToId = () => {
    const trimmed = jumpValue.trim();
    if (!trimmed) return;
    let targetId = trimmed.toLowerCase();
    let targetNumber: number;

    if (/^\d{1,4}$/.test(targetId)) {
      targetNumber = Math.max(1, Math.min(totalItems, parseInt(targetId, 10)));
      targetId = `dl-${String(targetNumber).padStart(4, '0')}`;
    } else if (/^dl-\d{4}$/.test(targetId)) {
      targetNumber = parseInt(targetId.replace('dl-', ''), 10);
    } else {
      return;
    }

    // Calculate which page the target is on
    const targetPage = Math.ceil(targetNumber / itemsPerPage);
    setCurrentPage(targetPage);

    // Wait for page to update, then scroll to element
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.location.hash = targetId;
      }
    }, 100);
  };

  const renderPagination = () => {
    const maxVisiblePages = 7;
    const half = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - half);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Prev
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-2 rounded-md bg-white hover:bg-gray-50 border text-sm font-medium"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-50 border'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-2 rounded-md bg-white hover:bg-gray-50 border text-sm font-medium"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Next
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Download Lists</h1>
        <p className="text-gray-600">
          3,000 download buttons with pagination. IDs: dl-0001 … dl-3000 |
          Page {currentPage} of {totalPages} ({itemsPerPage} items per page)
        </p>

        {/* File Size Toggle */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">File Size:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fileSize"
                checked={!isSmallFile}
                onChange={() => setIsSmallFile(false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Large (10MB CSV)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fileSize"
                checked={isSmallFile}
                onChange={() => setIsSmallFile(true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Small (~3KB CSV)</span>
            </label>
          </div>
        </div>

        {/* Jump to ID */}
        <div className="mt-4 flex items-center gap-2">
          <input
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder="dl-1234 or 1234"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={jumpToId}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Jump to ID
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((i) => {
          const id = formatId(i);
          return (
            <div key={i} id={id} data-id={id} className="bg-white rounded-lg shadow p-4 space-y-2">
              <div className="text-sm text-gray-700 font-medium">{id}</div>
              <button
                id={`btn-${id}`}
                onClick={() => handleDownload()}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-white bg-blue-600 hover:bg-blue-700`}
              >
                Download CSV ({isSmallFile ? '~3KB' : '10MB'})
              </button>
            </div>
          );
        })}
      </div>

      {renderPagination()}
    </div>
  );
};

export default DownloadListsPage;
