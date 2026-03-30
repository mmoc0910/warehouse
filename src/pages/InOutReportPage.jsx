import { useEffect, useState } from "react";
import { reportService, warehouseService } from "../api/services";
import { formatNumber, getErrorMessage } from "../utils/helpers";
import { exportInOutReportToExcel } from "../utils/exportInOutReportToExcel";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";

export default function InOutReportPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    warehouse_id: "",
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    try {
      setError("");
      const params = { ...filters };
      if (!params.warehouse_id) delete params.warehouse_id;
      const res = await reportService.inOutByPeriod(params);
      setReport(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleExportExcel = async () => {
    try {
      if (!report) return;
      setExporting(true);
      exportInOutReportToExcel(report, filters, warehouses);
    } catch (err) {
      setError(getErrorMessage(err) || "Không thể xuất file Excel");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    warehouseService
      .list({ per_page: 100 })
      .then((res) => setWarehouses(res.data.data || []));
  }, []);

  return (
    <SectionCard
      title="Báo cáo nhập - xuất theo thời gian"
      // description="Tổng hợp số lượng nhập, xuất và giá trị theo ngày trong khoảng thời gian chọn."
    >
      <div className="filters">
        <div className="field">
          <label>Từ ngày</label>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              setFilters({ ...filters, from_date: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Đến ngày</label>
          <input
            type="date"
            value={filters.to_date}
            onChange={(e) =>
              setFilters({ ...filters, to_date: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Kho</label>
          <select
            value={filters.warehouse_id}
            onChange={(e) =>
              setFilters({ ...filters, warehouse_id: e.target.value })
            }
          >
            <option value="">Tất cả</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="actions" style={{ display: "flex", gap: 8 }}>
          <button className="primary-btn" onClick={loadData}>
            Xem báo cáo
          </button>

          <button
            type="button"
            className="ghost-btn"
            onClick={handleExportExcel}
            disabled={!report || exporting}
          >
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {!report ? (
        <EmptyState message="Chọn khoảng thời gian rồi bấm Xem báo cáo." />
      ) : (
        <div className="grid" style={{ marginTop: 20 }}>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="muted">Tổng nhập</div>
              <strong>
                {formatNumber(report.summary.total_receipt_quantity, 0)}
              </strong>
            </div>
            <div className="summary-card">
              <div className="muted">Tổng xuất</div>
              <strong>
                {formatNumber(report.summary.total_issue_quantity, 0)}
              </strong>
            </div>
            <div className="summary-card">
              <div className="muted">Chênh lệch ròng</div>
              <strong>{formatNumber(report.summary.net_quantity, 0)}</strong>
            </div>
            <div className="summary-card">
              <div className="muted">Kho</div>
              <strong>
                {warehouses.find(
                  (w) => String(w.id) === String(filters.warehouse_id)
                )?.name || "Tất cả"}
              </strong>
            </div>
          </div>

          <div className="grid cols-2">
            <div className="section-card">
              <h3 style={{ marginTop: 0 }}>Nhập theo ngày</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Số lượng</th>
                      <th>Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.receipts_by_date?.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td>{formatNumber(row.total_quantity, 0)}</td>
                        <td>{formatNumber(row.total_amount, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!report.receipts_by_date?.length ? (
                  <EmptyState message="Không có dữ liệu nhập." />
                ) : null}
              </div>
            </div>

            <div className="section-card">
              <h3 style={{ marginTop: 0 }}>Xuất theo ngày</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Số lượng</th>
                      <th>Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.issues_by_date?.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td>{formatNumber(row.total_quantity, 0)}</td>
                        <td>{formatNumber(row.total_amount, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!report.issues_by_date?.length ? (
                  <EmptyState message="Không có dữ liệu xuất." />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}