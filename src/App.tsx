import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Navigation } from "./components/Navigation";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Import page components (we'll create these next)
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NavigationTestPage } from "./pages/NavigationTestPage";
import { FormsPage } from "./pages/FormsPage";
import { InteractionsPage } from "./pages/InteractionsPage";
import { DataTablesPage } from "./pages/DataTablesPage";
import { DownloadsPage } from "./pages/DownloadsPage";
import { DownloadListsPage } from "./pages/DownloadListsPage";
import { ModalsPage } from "./pages/ModalsPage";
import { DropdownsPage } from "./pages/DropdownsPage";
import { ResponsivePage } from "./pages/ResponsivePage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { TestConfigPage } from "./pages/TestConfigPage";
import { ExecutionLogsPage } from "./pages/ExecutionLogsPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { HeuristicsTestPage } from "./pages/HeuristicsTestPage";
import { MonitoringTestPage } from "./pages/MonitoringTestPage";
import { ApiEndpointTestingPage } from "./pages/ApiEndpointTestingPage";
import { FontStressPage } from "./pages/FontStressPage";
import { FileUploadsPage } from "./pages/FileUploadsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/navigation-test" element={<NavigationTestPage />} />
              <Route path="/forms" element={<FormsPage />} />
              <Route path="/interactions" element={<InteractionsPage />} />
              <Route path="/data-tables" element={<DataTablesPage />} />
              <Route path="/downloads" element={<DownloadsPage />} />
              <Route path="/uploads" element={<FileUploadsPage />} />
              <Route path="/download-lists" element={<DownloadListsPage />} />
              <Route path="/modals" element={<ModalsPage />} />
              <Route path="/dropdowns" element={<DropdownsPage />} />
              <Route path="/responsive" element={<ResponsivePage />} />
              <Route path="/heuristics" element={<HeuristicsTestPage />} />
              <Route path="/monitoring" element={<MonitoringTestPage />} />
              <Route path="/api-testing" element={<ApiEndpointTestingPage />} />
              <Route path="/font-stress" element={<FontStressPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/config"
                element={
                  <ProtectedRoute requireAdmin>
                    <TestConfigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute requireAdmin>
                    <ExecutionLogsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route
                path="*"
                element={
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      404 - Page Not Found
                    </h1>
                    <p className="text-lg text-gray-600">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
