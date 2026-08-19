import React, { useState } from 'react';

export const DropdownsPage: React.FC = () => {
  // State to track which items are checked
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  // State to enable automation failure mode
  const [enableAutomationFailure, setEnableAutomationFailure] = useState(false);

  // Generate 30 items
  const items = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    description: `This is description for item number ${index + 1}`
  }));

  // Toggle checked state for an item
  const toggleItem = (itemId: number) => {
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(itemId)) {
        newChecked.delete(itemId);
      } else {
        newChecked.add(itemId);
      }
      return newChecked;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dropdowns & Selects Tests</h1>
        <p className="text-lg text-gray-600">
          Test dropdown interactions, select elements, and option selection.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Scrollable Item List</h2>
        <p className="text-gray-600 mb-4">
          Click on any item to mark it as checked. Scroll through all 30 items.
        </p>

        {/* Automation Test Control */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableAutomationFailure}
              onChange={(e) => setEnableAutomationFailure(e.target.checked)}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Enable Automation Failure Mode
              </span>
              <p className="text-xs text-gray-600">
                When enabled, Item 15 will have a different selector structure to test automation robustness
              </p>
            </div>
          </label>
        </div>

        {/* Scroll Container */}
        <div className="border rounded-lg">
          <div className="h-64 overflow-y-auto p-4 space-y-2" data-testid="scroll-container">
            {items.map((item) => {
              // Item 15 gets special treatment when automation failure is enabled
              const isFailureItem = item.id === 15 && enableAutomationFailure;

              if (isFailureItem) {
                // This item will have no data-testid and nested structure to confuse automation
                return (
                  <div key={item.id} className="relative">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        checkedItems.has(item.id)
                          ? 'bg-red-50 border-red-300 shadow-sm'
                          : 'bg-white border-gray-200'
                      }`}
                      onClick={() => toggleItem(item.id)}
                      // Deliberately no data-testid here
                    >
                      <div className="flex-1">
                        <div className="relative">
                          <h3 className="font-medium text-gray-900">{item.name} ⚠️</h3>
                          <p className="text-sm text-gray-500">{item.description} (Modified structure)</p>
                          {/* Invisible overlay that might interfere with clicks */}
                          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}></div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="relative">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              checkedItems.has(item.id)
                                ? 'bg-red-500 border-red-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {checkedItems.has(item.id) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal items
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    checkedItems.has(item.id)
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => toggleItem(item.id)}
                  data-testid={`list-item-${item.id}`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        checkedItems.has(item.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {checkedItems.has(item.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Display */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected items: <span className="font-medium">{checkedItems.size}</span> of {items.length}
          </p>
          {checkedItems.size > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Checked items: </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.from(checkedItems).sort((a, b) => a - b).map(itemId => (
                  <span
                    key={itemId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    Item {itemId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};