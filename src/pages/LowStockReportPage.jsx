import { useEffect, useState } from "react";
import { reportService, warehouseService } from "../api/services";
import { formatNumber, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";

export default function LowStockReportPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const loadData = async (value = warehouseId) => {
    try {
      setError("");
      const res = await reportService.lowStock(
        value ? { warehouse_id: value } : {}
      );
      setRows(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    warehouseService
      .list({ per_page: 100 })
      .then((res) => setWarehouses(res.data.data || []));
    loadData("");
  }, []);

  return (
    <SectionCard
      title="Báo cáo hàng sắp hết"
      // description="Danh sách sản phẩm có tồn nhỏ hơn hoặc bằng mức cảnh báo tối thiểu."
    >
      <div className="filters">
        <div className="field">
          <label>Kho</label>
          <select
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              loadData(e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kho</th>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Đơn vị</th>
              <th>Tồn hiện tại</th>
              <th>Mức cảnh báo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.warehouse_name}</td>
                <td>{row.product_code}</td>
                <td>{row.product_name}</td>
                <td>{row.product_unit}</td>
                <td>{formatNumber(row.quantity, 0)}</td>
                <td>{formatNumber(row.min_stock_alert, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!rows.length ? (
          <EmptyState message="Không có mặt hàng sắp hết." />
        ) : null}
      </div>
    </SectionCard>
  );
}