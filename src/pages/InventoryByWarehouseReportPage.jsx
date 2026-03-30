import { useEffect, useState } from "react";
import { reportService, warehouseService } from "../api/services";
import { formatNumber, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";

export default function InventoryByWarehouseReportPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const loadData = async (value = warehouseId) => {
    try {
      setError("");
      const res = await reportService.inventoryByWarehouse(
        value ? { warehouse_id: value } : {}
      );
      setData(res.data.data || []);
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
      title="Báo cáo tồn kho theo từng kho"
      // description="Xem tổng số SKU, tổng tồn và chi tiết từng mặt hàng trong mỗi kho."
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

      {!data.length ? (
        <EmptyState message="Không có dữ liệu tồn kho." />
      ) : (
        data.map((warehouse) => (
          <div
            key={warehouse.warehouse_id}
            className="section-card"
            style={{ marginTop: 12 }}
          >
            <h3 style={{ marginTop: 0 }}>{warehouse.warehouse_name}</h3>
            <p className="muted">
              SKU: {warehouse.total_items} — Tổng lượng:{" "}
              {formatNumber(warehouse.total_quantity, 0)}
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Đơn vị</th>
                    <th>Tồn</th>
                    <th>Cảnh báo tối thiểu</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouse.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product?.code}</td>
                      <td>{item.product?.name}</td>
                      <td>{item.product?.unit}</td>
                      <td>{formatNumber(item.quantity, 0)}</td>
                      <td>{formatNumber(item.product?.min_stock_alert, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </SectionCard>
  );
}