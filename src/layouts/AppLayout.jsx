import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSystemAdmin } from "../utils/helpers";
import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  Package,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  PackageSearch,
  AlertTriangle,
  Clock3,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menuGroups = [
  {
    title: "Tổng quan",
    icon: LayoutDashboard,
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Danh mục",
    icon: Boxes,
    items: [
      { to: "/warehouses", label: "Kho", icon: Warehouse },
      { to: "/product-groups", label: "Nhóm hàng", icon: Boxes },
      { to: "/products", label: "Sản phẩm", icon: Package },
      { to: "/users", label: "Người dùng", icon: Users, adminOnly: true },
    ],
  },
  {
    title: "Nghiệp vụ kho",
    icon: ShieldCheck,
    items: [
      { to: "/stock-receipts", label: "Nhập kho", icon: ArrowDownToLine },
      { to: "/stock-issues", label: "Xuất kho", icon: ArrowUpFromLine },
      // { to: "/stock-transfers", label: "Điều chuyển", icon: Repeat },
      // { to: "/stocktakes", label: "Kiểm kê", icon: ClipboardCheck },
    ],
  },
  {
    title: "Báo cáo",
    icon: BarChart3,
    items: [
      {
        to: "/reports/inventory-by-warehouse",
        label: "Tồn theo kho",
        icon: Warehouse,
      },
      {
        to: "/reports/in-out-by-period",
        label: "Nhập - xuất theo thời gian",
        icon: BarChart3,
      },
      {
        to: "/reports/low-stock",
        label: "Hàng sắp hết",
        icon: AlertTriangle,
      },
      {
        to: "/reports/slow-moving",
        label: "Hàng tồn lâu",
        icon: Clock3,
      },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const admin = isSystemAdmin(user);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="wp-sidebar">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <Warehouse size={18} />
            </div>
            <div>
              <strong>Warehouse Admin</strong>
              <div className="muted">React + Vite</div>
            </div>
          </div>

          {menuGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.title} className="menu-group">
                <div className="menu-title flex items-center gap-2">
                  <GroupIcon size={16} />
                  <span>{group.title}</span>
                </div>

                {group.items
                  .filter((item) => !item.adminOnly || admin)
                  .map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `menu-item flex items-center justify-between ${isActive ? "active" : ""}`
                        }
                      >
                        <span className="flex items-center gap-3">
                          <span className="menu-item-icon">
                            <ItemIcon size={18} />
                          </span>
                          <span>{item.label}</span>
                        </span>

                        <ChevronRight size={16} className="menu-item-arrow" />
                      </NavLink>
                    );
                  })}
              </div>
            );
          })}
        </aside>
      </div>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>Hệ thống quản lý kho</h1>
            {/* <p className="muted">Bám sát API Laravel Sanctum / Permission / Inventory</p> */}
          </div>

          <div className="topbar-actions">
            <div className="user-badge">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <strong>{user?.name}</strong>
              </div>
              <span>{user?.roles?.map((r) => r.name).join(", ") || "N/A"}</span>
            </div>

            <button className="ghost-btn flex items-center gap-2" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}