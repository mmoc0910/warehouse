import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WarehousesPage from './pages/WarehousesPage';
import ProductGroupsPage from './pages/ProductGroupsPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import StockReceiptsPage from './pages/StockReceiptsPage';
import StockIssuesPage from './pages/StockIssuesPage';
import StockTransfersPage from './pages/StockTransfersPage';
import StocktakesPage from './pages/StocktakesPage';
import InventoryByWarehouseReportPage from './pages/InventoryByWarehouseReportPage';
import InOutReportPage from './pages/InOutReportPage';
import LowStockReportPage from './pages/LowStockReportPage';
import SlowMovingReportPage from './pages/SlowMovingReportPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="product-groups" element={<ProductGroupsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="stock-receipts" element={<StockReceiptsPage />} />
        <Route path="stock-issues" element={<StockIssuesPage />} />
        <Route path="stock-transfers" element={<StockTransfersPage />} />
        <Route path="stocktakes" element={<StocktakesPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['system_admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="reports/inventory-by-warehouse" element={<InventoryByWarehouseReportPage />} />
        <Route path="reports/in-out-by-period" element={<InOutReportPage />} />
        <Route path="reports/low-stock" element={<LowStockReportPage />} />
        <Route path="reports/slow-moving" element={<SlowMovingReportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
