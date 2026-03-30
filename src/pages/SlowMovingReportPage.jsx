import { useState } from "react";
import { reportService } from "../api/services";
import { formatDate, formatNumber, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";

export default function SlowMovingReportPage() {
  const [days, setDays] = useState(30);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");
      const res = await reportService.slowMoving({ days });
      setPayload(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <SectionCard
      title="Báo cáo hàng tồn lâu"
      // description="Sản phẩm còn tồn nhưng không có biến động trong số ngày đã chọn."
    >
      <div className="filters">
        <div className="field">
          <label>Số ngày</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <div className="actions">
          <button className="primary-btn" onClick={loadData}>
            Xem báo cáo
          </button>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {!payload ? (
        <EmptyState message="Nhập số ngày và bấm Xem báo cáo." />
      ) : (
        <div className="grid">
          <p className="muted">
            Ngưỡng kiểm tra: {payload.threshold_days} ngày.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kho</th>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Đơn vị</th>
                  <th>Tồn</th>
                  <th>Biến động cuối</th>
                </tr>
              </thead>
              <tbody>
                {payload.data?.map((row) => (
                  <tr key={row.id}>
                    <td>{row.warehouse?.name}</td>
                    <td>{row.product?.code}</td>
                    <td>{row.product?.name}</td>
                    <td>{row.product?.unit}</td>
                    <td>{formatNumber(row.quantity, 0)}</td>
                    <td>{formatDate(row.last_movement_at) || "Chưa có"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!payload.data?.length ? (
              <EmptyState message="Không có mặt hàng tồn lâu." />
            ) : null}
          </div>
        </div>
      )}
    </SectionCard>
  );
}