import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import SectionCard from "../components/SectionCard";
import {
  authService,
  reportService,
  stockIssueService,
  stockReceiptService,
} from "../api/services";

const featureCards = [
  // {
  //   title: "Quản lý kho",
  //   desc: "Thêm/sửa/xóa kho, tìm theo địa chỉ.",
  //   to: "/warehouses",
  // },
  {
    title: "Quản lý hàng hóa",
    desc: "Mã hàng, tên hàng, đơn vị tính, nhóm hàng, tồn kho từng kho.",
    to: "/products",
  },
  // {
  //   title: "Nhập kho",
  //   desc: "Lập phiếu nhập, cập nhật tồn, lưu lịch sử nhập hàng.",
  //   to: "/stock-receipts",
  // },
  // {
  //   title: "Xuất kho",
  //   desc: "Kiểm tra tồn trước khi xuất, tự động trừ tồn.",
  //   to: "/stock-issues",
  // },
  // {
  //   title: "Điều chuyển",
  //   desc: "Điều chuyển kho A sang kho B, cập nhật hai đầu kho.",
  //   to: "/stock-transfers",
  // },
  // {
  //   title: "Kiểm kê",
  //   desc: "So sánh tồn hệ thống với thực tế, lập biên bản chênh lệch.",
  //   to: "/stocktakes",
  // },
  {
    title: "Người dùng",
    desc: "Quản trị hệ thống và nhân viên kho.",
    to: "/users",
  },
  {
    title: "Báo cáo",
    desc: "Tồn theo kho, nhập xuất theo thời gian, sắp hết, tồn lâu.",
    to: "/reports/inventory-by-warehouse",
  },
];

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
};

const mutedText = {
  color: "#6b7280",
  fontSize: 13,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatDate(dateString) {
  if (!dateString) return "--/--";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function getMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);

  const toYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return {
    fromDate: toYMD(first),
    toDate: toYMD(now),
    displayDate: `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}/${now.getFullYear()}`,
  };
}

function sumByAmount(rows = []) {
  return rows.reduce((sum, item) => sum + Number(item?.total_amount || 0), 0);
}

function DashboardMetric({ label, value, color = "#111827", sub }) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: 18,
        minHeight: 116,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 30,
          lineHeight: 1.15,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 8, ...mutedText }}>{sub}</div>
    </div>
  );
}

function RecentVoucherCard({
  title,
  titleColor,
  totalAmount,
  totalCount,
  rows,
  emptyText,
  linkTo,
}) {
  return (
    <div style={{ ...cardStyle, height: "100%" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>
            {title}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 28,
              fontWeight: 800,
              color: titleColor,
            }}
          >
            {formatCurrency(totalAmount)}
          </div>
          <div style={{ marginTop: 4, ...mutedText }}>
            {formatNumber(totalCount)} phiếu - tháng này
          </div>
        </div>

        <Link
          to={linkTo}
          style={{
            alignSelf: "flex-start",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            color: "#2563eb",
          }}
        >
          Xem tất cả
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            marginBottom: 10,
          }}
        >
          Danh sách gần đây
        </div>

        {rows.length === 0 ? (
          <div style={{ ...mutedText }}>{emptyText}</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 12,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#1f2937",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.code}
                    </div>
                    <div
                      style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}
                    >
                      {item?.warehouse?.name || "Chưa có kho"} ·{" "}
                      {item.items_count || 0} mặt hàng
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: titleColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatCurrency(item.total_amount)}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    ...mutedText,
                  }}
                >
                  <span>{item.note || "Không có ghi chú"}</span>
                  <span>
                    {formatDate(item.receipt_date || item.issue_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LowStockCard({ rows }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#92400e" }}>
        Hàng sắp hết
      </div>
      <div style={{ marginTop: 4, ...mutedText }}>
        {rows.length} mặt hàng cần bổ sung
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {rows.length === 0 ? (
          <div style={mutedText}>
            Chưa có mặt hàng dưới ngưỡng tồn tối thiểu.
          </div>
        ) : (
          rows.map((item) => (
            <div
              key={`${item.warehouse_id}-${item.product_id}`}
              style={{
                border: "1px solid #fde68a",
                background: "#fffbeb",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1f2937",
                      lineHeight: 1.25,
                    }}
                  >
                    {item.product_name}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    {item.warehouse_name}
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff7ed",
                    color: "#b45309",
                    border: "1px solid #fdba74",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Còn {formatNumber(item.quantity)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        to="/reports/low-stock"
        style={{
          display: "inline-block",
          marginTop: 12,
          textDecoration: "none",
          color: "#2563eb",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        Xem báo cáo hàng sắp hết
      </Link>
    </div>
  );
}

function WarehouseRatioCard({ rows }) {
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];

  const chartData = rows
    .filter((item) => Number(item.quantity || 0) > 0)
    .map((item) => ({
      name: item.warehouse_name,
      value: Number(item.quantity || 0),
      percent: Number(item.percent || 0),
    }));

  const totalQuantity = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 10,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>
          {data.name}
        </div>
        <div style={{ fontSize: 13, color: "#475569" }}>
          Số lượng: {formatNumber(data.value)}
        </div>
        <div style={{ fontSize: 13, color: "#475569" }}>
          Tỉ lệ: {data.percent}%
        </div>
      </div>
    );
  };

  const renderLabel = ({ percent }) =>
    percent >= 0.08 ? `${(percent).toFixed(0)}%` : "";

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#475569" }}>
        Tỉ lệ tồn theo kho
      </div>

      {chartData.length === 0 ? (
        <div style={{ ...mutedText, marginTop: 16 }}>
          Chưa có dữ liệu tồn kho.
        </div>
      ) : (
        <>
          <div
            style={{
              height: 260,
              marginTop: 16,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  cornerRadius={8}
                  labelLine={false}
                  label={renderLabel}
                  isAnimationActive
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value, entry, index) => {
                    const item = chartData[index];
                    return `${value} (${item?.percent ?? 0}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              Tổng tồn toàn hệ thống
            </span>
            <span style={{ fontSize: 18, color: "#0f172a", fontWeight: 800 }}>
              {formatNumber(totalQuantity)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const monthRange = useMemo(() => getMonthRange(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [receiptRows, setReceiptRows] = useState([]);
  const [issueRows, setIssueRows] = useState([]);
  const [receiptCount, setReceiptCount] = useState(0);
  const [issueCount, setIssueCount] = useState(0);
  const [receiptAmount, setReceiptAmount] = useState(0);
  const [issueAmount, setIssueAmount] = useState(0);
  const [lowStockRows, setLowStockRows] = useState([]);
  const [warehouseRatioRows, setWarehouseRatioRows] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          meRes,
          inOutRes,
          receiptRes,
          issueRes,
          lowStockRes,
          inventoryRes,
        ] = await Promise.all([
          authService.me().catch(() => null),
          reportService
            .inOutByPeriod({
              from_date: monthRange.fromDate,
              to_date: monthRange.toDate,
            })
            .catch(() => null),
          stockReceiptService
            .list({
              from_date: monthRange.fromDate,
              to_date: monthRange.toDate,
              per_page: 4,
            })
            .catch(() => null),
          stockIssueService
            .list({
              from_date: monthRange.fromDate,
              to_date: monthRange.toDate,
              per_page: 4,
            })
            .catch(() => null),
          reportService.lowStock({}).catch(() => null),
          reportService.inventoryByWarehouse({}).catch(() => null),
        ]);

        if (!mounted) return;

        const profileData = meRes?.data?.data || meRes?.data || null;
        const receiptList = receiptRes?.data?.data || [];
        const issueList = issueRes?.data?.data || [];
        const receiptsByDate = inOutRes?.data?.receipts_by_date || [];
        const issuesByDate = inOutRes?.data?.issues_by_date || [];
        const lowStockList = lowStockRes?.data?.data || [];
        const inventoryByWarehouse = inventoryRes?.data?.data || [];

        const totalReceiptAmount = sumByAmount(receiptsByDate);
        const totalIssueAmount = sumByAmount(issuesByDate);

        const totalWarehouseQty = inventoryByWarehouse.reduce(
          (sum, item) => sum + Number(item?.total_quantity || 0),
          0,
        );

        const ratioRows = inventoryByWarehouse.map((item) => {
          const quantity = Number(item?.total_quantity || 0);
          return {
            warehouse_id: item.warehouse_id,
            warehouse_name: item.warehouse_name,
            quantity,
            percent:
              totalWarehouseQty > 0
                ? Math.round((quantity / totalWarehouseQty) * 100)
                : 0,
          };
        });

        setProfile(profileData);
        setReceiptRows(receiptList.slice(0, 3));
        setIssueRows(issueList.slice(0, 3));
        setReceiptCount(Number(receiptRes?.data?.total || 0));
        setIssueCount(Number(issueRes?.data?.total || 0));
        setReceiptAmount(totalReceiptAmount);
        setIssueAmount(totalIssueAmount);
        setLowStockRows(lowStockList.slice(0, 3));
        setWarehouseRatioRows(ratioRows);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message || "Không tải được dữ liệu dashboard.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [monthRange.fromDate, monthRange.toDate]);

  const netAmount = receiptAmount - issueAmount;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionCard>
        {/* <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#1f2937",
                lineHeight: 1.2,
              }}
            >
              Hệ thống quản lý kho
            </div>
            <div style={{ marginTop: 6, ...mutedText }}>
              Tổng quan — {monthRange.displayDate}
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "12px 14px",
              minWidth: 210,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>
              {profile?.name || "Warehouse Admin"}
            </div>
            <div style={{ marginTop: 4, ...mutedText }}>
              {profile?.role || profile?.username || "system_admin"}
            </div>
          </div>
        </div> */}

        <div
          style={{
            marginTop: 16,
            border: "1px solid #dbeafe",
            background: "#f8fbff",
            color: "#334155",
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: netAmount >= 0 ? "#10b981" : "#ef4444",
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            Chênh lệch nhập - xuất
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: netAmount >= 0 ? "#059669" : "#dc2626",
            }}
          >
            {formatCurrency(netAmount)}
          </span>
          <span style={{ ...mutedText, fontWeight: 700 }}>
            Nhập: {formatCurrency(receiptAmount)}
          </span>
          <span style={{ ...mutedText, fontWeight: 700 }}>
            Xuất: {formatCurrency(issueAmount)}
          </span>
        </div>
      </SectionCard>

      {loading ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: 28 }}>
          Đang tải dashboard...
        </div>
      ) : error ? (
        <div
          style={{
            ...cardStyle,
            textAlign: "center",
            padding: 28,
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {/* <DashboardMetric
              label="Tổng giá trị nhập kho"
              value={formatCurrency(receiptAmount)}
              color="#2563eb"
              sub={`${formatNumber(receiptCount)} phiếu trong tháng này`}
            />
            <DashboardMetric
              label="Tổng giá trị xuất kho"
              value={formatCurrency(issueAmount)}
              color="#dc2626"
              sub={`${formatNumber(issueCount)} phiếu trong tháng này`}
            />
            <DashboardMetric
              label="Chênh lệch ròng"
              value={formatCurrency(netAmount)}
              color={netAmount >= 0 ? "#059669" : "#dc2626"}
              sub="Giá trị nhập trừ giá trị xuất"
            /> */}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 1fr) minmax(250px, 1fr) 320px",
              gap: 16,
              alignItems: "start",
            }}
          >
            <RecentVoucherCard
              title="Tổng giá trị nhập kho"
              titleColor="#2563eb"
              totalAmount={receiptAmount}
              totalCount={receiptCount}
              rows={receiptRows}
              emptyText="Chưa có phiếu nhập trong tháng này."
              linkTo="/stock-receipts"
            />

            <RecentVoucherCard
              title="Tổng giá trị xuất kho"
              titleColor="#dc2626"
              totalAmount={issueAmount}
              totalCount={issueCount}
              rows={issueRows}
              emptyText="Chưa có phiếu xuất trong tháng này."
              linkTo="/stock-issues"
            />

            <LowStockCard rows={lowStockRows} />
            <WarehouseRatioCard rows={warehouseRatioRows} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {featureCards.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                style={{
                  ...cardStyle,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#1f2937",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ marginTop: 8, ...mutedText }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
