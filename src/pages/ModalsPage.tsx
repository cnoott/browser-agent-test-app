import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  size?: 'default' | 'large';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = 'default',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    default: 'max-w-md',
    large: 'max-w-2xl max-h-[80vh]'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={closeOnOverlay ? onClose : undefined}
      data-testid="modal-overlay"
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 transform transition-all flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-content"
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                data-testid="modal-close-button"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div
      className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
      data-testid={`toast-${type}`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
        data-testid="toast-close"
      >
        ×
      </button>
    </div>
  );
};

export const ModalsPage: React.FC = () => {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [noOverlayModalOpen, setNoOverlayModalOpen] = useState(false);
  const [noEscapeModalOpen, setNoEscapeModalOpen] = useState(false);
  const [stackedModal1Open, setStackedModal1Open] = useState(false);
  const [stackedModal2Open, setStackedModal2Open] = useState(false);
  const [scrollableModalOpen, setScrollableModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' | 'warning' }>>([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [confirmResult, setConfirmResult] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleConfirm = (result: boolean) => {
    setConfirmResult(result ? 'Confirmed' : 'Cancelled');
    setConfirmModalOpen(false);
    addToast(result ? 'Action confirmed!' : 'Action cancelled', result ? 'success' : 'info');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      addToast(`Form submitted: ${formData.name} (${formData.email})`, 'success');
      setFormModalOpen(false);
      setFormData({ name: '', email: '' });
    } else {
      addToast('Please fill in all fields', 'error');
    }
  };

  const toggleOption = (id: number) => {
    setSelectedOptions(prev =>
      prev.includes(id)
        ? prev.filter(optionId => optionId !== id)
        : [...prev, id]
    );
  };

  const selectAllOptions = () => {
    const allIds = Array.from({ length: 20 }, (_, i) => i + 1);
    setSelectedOptions(allIds);
  };

  const clearAllOptions = () => {
    setSelectedOptions([]);
  };

  const handleScrollableSubmit = () => {
    addToast(`Selected ${selectedOptions.length} options: [${selectedOptions.join(', ')}]`, 'success');
    setScrollableModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Modals & Popups Tests</h1>
        <p className="text-lg text-gray-600">
          Test modal interactions, popup handling, and overlay scenarios.
        </p>
      </header>

      {/* Basic Modals Section */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Modals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setBasicModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            data-testid="open-basic-modal"
          >
            Open Basic Modal
          </button>

          <button
            onClick={() => setConfirmModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            data-testid="open-confirm-modal"
          >
            Open Confirmation Dialog
          </button>

          <button
            onClick={() => setFormModalOpen(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            data-testid="open-form-modal"
          >
            Open Form Modal
          </button>

          <button
            onClick={() => {
              setStackedModal1Open(true);
            }}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            data-testid="open-stacked-modals"
          >
            Open Stacked Modals
          </button>

          <button
            onClick={() => setScrollableModalOpen(true)}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            data-testid="open-scrollable-modal"
          >
            Open Scrollable Modal
          </button>
        </div>

        {confirmResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded" data-testid="confirm-result">
            Last confirmation result: <strong>{confirmResult}</strong>
          </div>
        )}
      </section>

      {/* Modal Behaviors Section */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Modal Behaviors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setNoOverlayModalOpen(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            data-testid="open-no-overlay-close"
          >
            Modal (No Overlay Close)
          </button>

          <button
            onClick={() => setNoEscapeModalOpen(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            data-testid="open-no-escape-close"
          >
            Modal (No Escape Close)
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notification Toasts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => addToast('Success message!', 'success')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            data-testid="show-success-toast"
          >
            Success Toast
          </button>

          <button
            onClick={() => addToast('Error occurred!', 'error')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            data-testid="show-error-toast"
          >
            Error Toast
          </button>

          <button
            onClick={() => addToast('Info message', 'info')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            data-testid="show-info-toast"
          >
            Info Toast
          </button>

          <button
            onClick={() => addToast('Warning!', 'warning')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            data-testid="show-warning-toast"
          >
            Warning Toast
          </button>
        </div>

        <button
          onClick={() => {
            addToast('Toast 1', 'info');
            setTimeout(() => addToast('Toast 2', 'success'), 500);
            setTimeout(() => addToast('Toast 3', 'warning'), 1000);
          }}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="show-multiple-toasts"
        >
          Show Multiple Toasts
        </button>
      </section>

      {/* Instructions Section */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Click outside modals to close them (unless disabled)</li>
          <li>• Press Escape key to close modals (unless disabled)</li>
          <li>• Toasts auto-dismiss after 3 seconds or can be manually closed</li>
          <li>• Test form validation in the form modal</li>
          <li>• Try opening multiple stacked modals</li>
          <li>• Check that page scrolling is disabled when modals are open</li>
        </ul>
      </section>

      {/* Basic Modal */}
      <Modal
        isOpen={basicModalOpen}
        onClose={() => setBasicModalOpen(false)}
        title="Basic Modal"
      >
        <p className="text-gray-600 mb-4">
          This is a basic modal with standard features. You can close it by:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4">
          <li>Clicking the X button</li>
          <li>Clicking outside the modal</li>
          <li>Pressing the Escape key</li>
        </ul>
        <button
          onClick={() => setBasicModalOpen(false)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close Modal
        </button>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => handleConfirm(false)}
        title="Confirm Action"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to proceed with this action?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleConfirm(true)}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            data-testid="confirm-yes"
          >
            Yes, Confirm
          </button>
          <button
            onClick={() => handleConfirm(false)}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            data-testid="confirm-no"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setFormData({ name: '', email: '' });
        }}
        title="Form Modal"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              data-testid="form-name-input"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              data-testid="form-email-input"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              data-testid="form-submit"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setFormModalOpen(false);
                setFormData({ name: '', email: '' });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* No Overlay Close Modal */}
      <Modal
        isOpen={noOverlayModalOpen}
        onClose={() => setNoOverlayModalOpen(false)}
        title="No Overlay Close"
        closeOnOverlay={false}
      >
        <p className="text-gray-600 mb-4">
          This modal cannot be closed by clicking outside. You must use the X button or Escape key.
        </p>
        <button
          onClick={() => setNoOverlayModalOpen(false)}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Close Modal
        </button>
      </Modal>

      {/* No Escape Close Modal */}
      <Modal
        isOpen={noEscapeModalOpen}
        onClose={() => setNoEscapeModalOpen(false)}
        title="No Escape Close"
        closeOnEscape={false}
      >
        <p className="text-gray-600 mb-4">
          This modal cannot be closed with the Escape key. You must use the X button or click outside.
        </p>
        <button
          onClick={() => setNoEscapeModalOpen(false)}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close Modal
        </button>
      </Modal>

      {/* Stacked Modal 1 */}
      <Modal
        isOpen={stackedModal1Open}
        onClose={() => setStackedModal1Open(false)}
        title="First Modal"
      >
        <p className="text-gray-600 mb-4">
          This is the first modal. Click the button below to open another modal on top.
        </p>
        <button
          onClick={() => setStackedModal2Open(true)}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          data-testid="open-second-modal"
        >
          Open Second Modal
        </button>
      </Modal>

      {/* Stacked Modal 2 */}
      <Modal
        isOpen={stackedModal2Open}
        onClose={() => setStackedModal2Open(false)}
        title="Second Modal"
      >
        <p className="text-gray-600 mb-4">
          This is the second modal stacked on top of the first one. Close this to return to the first modal.
        </p>
        <button
          onClick={() => setStackedModal2Open(false)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Close This Modal
        </button>
      </Modal>

      {/* Scrollable Modal */}
      <Modal
        isOpen={scrollableModalOpen}
        onClose={() => setScrollableModalOpen(false)}
        title="Scrollable Modal with Checkboxes"
        size="large"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Select from the options below. This modal is scrollable and contains 20 checkboxes.
            </p>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {selectedOptions.length}/20 selected
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAllOptions}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              data-testid="select-all-options"
            >
              Select All
            </button>
            <button
              onClick={clearAllOptions}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              data-testid="clear-all-options"
            >
              Clear All
            </button>
          </div>

          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {Array.from({ length: 20 }, (_, i) => {
                const optionId = i + 1;
                const isChecked = selectedOptions.includes(optionId);
                return (
                  <label
                    key={optionId}
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                      isChecked ? 'bg-blue-100 border-blue-200' : 'bg-white hover:bg-gray-100'
                    } border`}
                    data-testid={`checkbox-option-${optionId}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOption(optionId)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-gray-900 font-medium">
                        Option {optionId}
                      </span>
                      <p className="text-sm text-gray-500">
                        Description for option {optionId} - this is some additional text to make the content longer
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setScrollableModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleScrollableSubmit}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              data-testid="submit-scrollable-modal"
            >
              Submit Selected ({selectedOptions.length})
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50" data-testid="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};