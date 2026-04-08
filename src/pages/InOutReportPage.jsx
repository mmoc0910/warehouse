// import { useEffect, useState } from "react";
// import { reportService, warehouseService } from "../api/services";
// import { formatNumber, getErrorMessage } from "../utils/helpers";
// import { exportInOutReportToExcel } from "../utils/exportInOutReportToExcel";
// import SectionCard from "../components/SectionCard";
// import EmptyState from "../components/EmptyState";

// export default function InOutReportPage() {
//   const [warehouses, setWarehouses] = useState([]);
//   const [filters, setFilters] = useState({
//     from_date: "",
//     to_date: "",
//     warehouse_id: "",
//   });
//   const [report, setReport] = useState(null);
//   const [error, setError] = useState("");
//   const [exporting, setExporting] = useState(false);

//   const loadData = async () => {
//     try {
//       setError("");
//       const params = { ...filters };
//       if (!params.warehouse_id) delete params.warehouse_id;
//       const res = await reportService.inOutByPeriod(params);
//       setReport(res.data);
//     } catch (err) {
//       setError(getErrorMessage(err));
//     }
//   };

//   const handleExportExcel = async () => {
//     try {
//       if (!report) return;
//       setExporting(true);
//       exportInOutReportToExcel(report, filters, warehouses);
//     } catch (err) {
//       setError(getErrorMessage(err) || "Không thể xuất file Excel");
//     } finally {
//       setExporting(false);
//     }
//   };

//   useEffect(() => {
//     warehouseService
//       .list({ per_page: 100 })
//       .then((res) => setWarehouses(res.data.data || []));
//   }, []);

//   return (
//     <SectionCard
//       title="Báo cáo nhập - xuất theo thời gian"
//       // description="Tổng hợp số lượng nhập, xuất và giá trị theo ngày trong khoảng thời gian chọn."
//     >
//       <div className="filters">
//         <div className="field">
//           <label>Từ ngày</label>
//           <input
//             type="date"
//             value={filters.from_date}
//             onChange={(e) =>
//               setFilters({ ...filters, from_date: e.target.value })
//             }
//           />
//         </div>

//         <div className="field">
//           <label>Đến ngày</label>
//           <input
//             type="date"
//             value={filters.to_date}
//             onChange={(e) =>
//               setFilters({ ...filters, to_date: e.target.value })
//             }
//           />
//         </div>

//         <div className="field">
//           <label>Kho</label>
//           <select
//             value={filters.warehouse_id}
//             onChange={(e) =>
//               setFilters({ ...filters, warehouse_id: e.target.value })
//             }
//           >
//             <option value="">Tất cả</option>
//             {warehouses.map((w) => (
//               <option key={w.id} value={w.id}>
//                 {w.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="actions" style={{ display: "flex", gap: 8 }}>
//           <button className="primary-btn" onClick={loadData}>
//             Xem báo cáo
//           </button>

//           <button
//             type="button"
//             className="ghost-btn"
//             onClick={handleExportExcel}
//             disabled={!report || exporting}
//           >
//             {exporting ? "Đang xuất..." : "Xuất Excel"}
//           </button>
//         </div>
//       </div>

//       {error ? <div className="alert error">{error}</div> : null}

//       {!report ? (
//         <EmptyState message="Chọn khoảng thời gian rồi bấm Xem báo cáo." />
//       ) : (
//         <div className="grid" style={{ marginTop: 20 }}>
//           <div className="summary-grid">
//             <div className="summary-card">
//               <div className="muted">Tổng nhập</div>
//               <strong>
//                 {formatNumber(report.summary.total_receipt_quantity, 0)}
//               </strong>
//             </div>
//             <div className="summary-card">
//               <div className="muted">Tổng xuất</div>
//               <strong>
//                 {formatNumber(report.summary.total_issue_quantity, 0)}
//               </strong>
//             </div>
//             <div className="summary-card">
//               <div className="muted">Chênh lệch ròng</div>
//               <strong>{formatNumber(report.summary.net_quantity, 0)}</strong>
//             </div>
//             <div className="summary-card">
//               <div className="muted">Kho</div>
//               <strong>
//                 {warehouses.find(
//                   (w) => String(w.id) === String(filters.warehouse_id)
//                 )?.name || "Tất cả"}
//               </strong>
//             </div>
//           </div>

//           <div className="grid cols-2">
//             <div className="section-card">
//               <h3 style={{ marginTop: 0 }}>Nhập theo ngày</h3>
//               <div className="table-wrap">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Ngày</th>
//                       <th>Số lượng</th>
//                       <th>Giá trị</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {report.receipts_by_date?.map((row, idx) => (
//                       <tr key={idx}>
//                         <td>{row.date}</td>
//                         <td>{formatNumber(row.total_quantity, 0)}</td>
//                         <td>{formatNumber(row.total_amount, 2)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {!report.receipts_by_date?.length ? (
//                   <EmptyState message="Không có dữ liệu nhập." />
//                 ) : null}
//               </div>
//             </div>

//             <div className="section-card">
//               <h3 style={{ marginTop: 0 }}>Xuất theo ngày</h3>
//               <div className="table-wrap">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Ngày</th>
//                       <th>Số lượng</th>
//                       <th>Giá trị</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {report.issues_by_date?.map((row, idx) => (
//                       <tr key={idx}>
//                         <td>{row.date}</td>
//                         <td>{formatNumber(row.total_quantity, 0)}</td>
//                         <td>{formatNumber(row.total_amount, 2)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {!report.issues_by_date?.length ? (
//                   <EmptyState message="Không có dữ liệu xuất." />
//                 ) : null}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </SectionCard>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import {
  reportService,
  warehouseService,
  stockReceiptService,
} from "../api/services";
import { formatNumber, getErrorMessage } from "../utils/helpers";
import { exportInOutReportToExcel } from "../utils/exportInOutReportToExcel";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import dayjs from "dayjs";

const searchableCss = `
.report-search-select {
  position: relative;
}

.report-search-select-input-wrap {
  position: relative;
}

.report-search-select-input {
  width: 100%;
  min-height: 42px;
  border: 1px solid #dbe3f0;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  padding: 10px 40px 10px 40px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.report-search-select-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.report-search-select-leading,
.report-search-select-trailing {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-search-select-leading {
  left: 12px;
}

.report-search-select-trailing {
  right: 12px;
}

.report-search-select-clear {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-search-select-clear:hover {
  color: #dc2626;
}

.report-search-select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
  max-height: 280px;
  overflow-y: auto;
}

.report-search-select-option {
  width: 100%;
  border: none;
  background: #fff;
  text-align: left;
  cursor: pointer;
  padding: 12px 14px;
  color: #0f172a;
  transition: background 0.18s ease;
}

.report-search-select-option:hover,
.report-search-select-option.active {
  background: #eff6ff;
}

.report-search-select-empty {
  padding: 14px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}
`;

function getListFromResponse(res) {
  const payload = res?.data?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getReceiptItemsCount(receipt) {
  if (receipt?.items_count !== undefined && receipt?.items_count !== null) {
    return Number(receipt.items_count || 0);
  }

  if (Array.isArray(receipt?.items)) {
    return receipt.items.length;
  }

  return 0;
}

function getReceiptTotalQuantity(receipt) {
  if (receipt?.total_quantity !== undefined && receipt?.total_quantity !== null) {
    return Number(receipt.total_quantity || 0);
  }

  if (Array.isArray(receipt?.items)) {
    return receipt.items.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }

  return 0;
}

function formatDateTimeVN(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function SearchableSupplierSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn nhà cung cấp (người giao)",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setKeyword(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = normalizeText(keyword);

    if (!normalized) return options.slice(0, 50);

    return options
      .filter((option) => normalizeText(option).includes(normalized))
      .slice(0, 50);
  }, [options, keyword]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setKeyword(nextValue);
    setOpen(true);

    if (!nextValue.trim()) {
      onChange("");
    }
  };

  const handleSelect = (option) => {
    setKeyword(option);
    onChange(option);
    setOpen(false);
  };

  const handleClear = () => {
    setKeyword("");
    onChange("");
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && open && filteredOptions.length) {
      event.preventDefault();
      handleSelect(filteredOptions[0]);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="report-search-select" ref={wrapperRef}>
      <div className="report-search-select-input-wrap">
        {/* <span className="report-search-select-leading">
          <Search size={16} />
        </span> */}

        <input
          className="report-search-select-input"
          value={keyword}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />

        <span className="report-search-select-trailing">
          {keyword ? (
            <button
              type="button"
              className="report-search-select-clear"
              onClick={handleClear}
              title="Xóa lựa chọn"
            >
              <X size={16} />
            </button>
          ) : (
            <ChevronDown size={16} />
          )}
        </span>
      </div>

      {open ? (
        <div className="report-search-select-dropdown">
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`report-search-select-option ${
                  value === option ? "active" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="report-search-select-empty">
              Không tìm thấy nhà cung cấp phù hợp
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function InOutReportPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);

  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    warehouse_id: "",
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const [receiptFilters, setReceiptFilters] = useState({
    from_date: "",
    to_date: "",
    warehouse_id: "",
    delivery_full_name: "",
  });
  const [receiptList, setReceiptList] = useState([]);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [hasSearchedReceipts, setHasSearchedReceipts] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = async () => {
    try {
      setError("");
      const params = { ...filters };

      if (!params.warehouse_id) delete params.warehouse_id;
      if (!params.from_date) delete params.from_date;
      if (!params.to_date) delete params.to_date;

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

  const loadReceiptsBySupplier = async () => {
    try {
      setReceiptError("");
      setReceiptLoading(true);
      setHasSearchedReceipts(true);

      const params = {
        page: 1,
        per_page: 500,
        from_date: receiptFilters.from_date,
        to_date: receiptFilters.to_date,
        warehouse_id: receiptFilters.warehouse_id,
      };

      if (!params.from_date) delete params.from_date;
      if (!params.to_date) delete params.to_date;
      if (!params.warehouse_id) delete params.warehouse_id;

      const res = await stockReceiptService.list(params);
      const rawList = getListFromResponse(res);

      const keyword = normalizeText(receiptFilters.delivery_full_name);

      const filteredList = keyword
        ? rawList.filter((item) =>
            normalizeText(item?.delivery_full_name).includes(keyword)
          )
        : rawList;

      setReceiptList(filteredList);
    } catch (err) {
      setReceiptList([]);
      setReceiptError(getErrorMessage(err));
    } finally {
      setReceiptLoading(false);
    }
  };

  const openReceiptDetail = async (id) => {
    if (!id) return;

    try {
      setDetailLoading(true);
      const res = await stockReceiptService.detail(id);
      setDetail(res.data.data);
    } catch (err) {
      setReceiptError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeReceiptDetail = () => {
    setDetail(null);
    setDetailLoading(false);
  };

  useEffect(() => {
    warehouseService
      .list({ per_page: 100 })
      .then((res) => setWarehouses(res.data.data || []))
      .catch(() => {});

    stockReceiptService
      .list({ page: 1, per_page: 500 })
      .then((res) => {
        const list = getListFromResponse(res);
        const uniqueNames = [
          ...new Set(
            list
              .map((item) => String(item?.delivery_full_name || "").trim())
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b, "vi"));

        setSupplierOptions(uniqueNames);
      })
      .catch(() => {});
  }, []);

  const receiptSummary = useMemo(() => {
    return receiptList.reduce(
      (acc, item) => {
        acc.totalReceipts += 1;
        acc.totalItems += getReceiptItemsCount(item);
        acc.totalQuantity += getReceiptTotalQuantity(item);
        acc.totalAmount += Number(item?.total_amount || 0);
        return acc;
      },
      {
        totalReceipts: 0,
        totalItems: 0,
        totalQuantity: 0,
        totalAmount: 0,
      }
    );
  }, [receiptList]);

  return (
    <>
      <style>{searchableCss}</style>

      <SectionCard title="Báo cáo nhập - xuất theo thời gian">
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
                          <td>{formatNumber(row.total_amount, 0)}</td>
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
                          <td>{formatNumber(row.total_amount, 0)}</td>
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

      <SectionCard
        title="Danh sách nhập theo nhà cung cấp"
        description="Nhà cung cấp ở đây chính là Người giao trên phiếu nhập."
      >
        <div className="filters">
          <div className="field">
            <label>Nhà cung cấp (người giao)</label>
            <SearchableSupplierSelect
              options={supplierOptions}
              value={receiptFilters.delivery_full_name}
              onChange={(nextValue) =>
                setReceiptFilters({
                  ...receiptFilters,
                  delivery_full_name: nextValue,
                })
              }
              placeholder="Tìm hoặc chọn người giao"
            />
          </div>

          <div className="field">
            <label>Từ ngày</label>
            <input
              type="date"
              value={receiptFilters.from_date}
              onChange={(e) =>
                setReceiptFilters({
                  ...receiptFilters,
                  from_date: e.target.value,
                })
              }
            />
          </div>

          <div className="field">
            <label>Đến ngày</label>
            <input
              type="date"
              value={receiptFilters.to_date}
              onChange={(e) =>
                setReceiptFilters({
                  ...receiptFilters,
                  to_date: e.target.value,
                })
              }
            />
          </div>

          <div className="field">
            <label>Kho</label>
            <select
              value={receiptFilters.warehouse_id}
              onChange={(e) =>
                setReceiptFilters({
                  ...receiptFilters,
                  warehouse_id: e.target.value,
                })
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
            <button className="primary-btn" onClick={loadReceiptsBySupplier}>
              Xem danh sách nhập
            </button>
          </div>
        </div>

        {receiptError ? <div className="alert error">{receiptError}</div> : null}

        {!hasSearchedReceipts ? (
          <EmptyState message="Chọn người giao, khoảng thời gian rồi bấm Xem danh sách nhập." />
        ) : receiptLoading ? (
          <div className="muted" style={{ marginTop: 16 }}>
            Đang tải danh sách phiếu nhập...
          </div>
        ) : !receiptList.length ? (
          <EmptyState message="Không có phiếu nhập phù hợp." />
        ) : (
          <div className="grid" style={{ marginTop: 20 }}>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Số phiếu nhập</div>
                <strong>{formatNumber(receiptSummary.totalReceipts, 0)}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Tổng mặt hàng</div>
                <strong>{formatNumber(receiptSummary.totalItems, 0)}</strong>
              </div>

              {/* <div className="summary-card">
                <div className="muted">Tổng số lượng</div>
                <strong>{formatNumber(receiptSummary.totalQuantity, 0)}</strong>
              </div> */}

              <div className="summary-card">
                <div className="muted">Tổng tiền</div>
                <strong>{formatNumber(receiptSummary.totalAmount, 0)}</strong>
              </div>
            </div>

            <div className="section-card">
              <h3 style={{ marginTop: 0 }}>Danh sách phiếu nhập</h3>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Ngày nhập</th>
                      <th>Nhà cung cấp</th>
                      <th>Kho</th>
                      <th>Người nhận</th>
                      <th>SL mặt hàng</th>
                      {/* <th>Đơn giá</th> */}
                      <th>Tổng tiền</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>

                  <tbody>
                    {receiptList.map((receipt) => (
                      <tr
                        key={receipt.id}
                        className="clickable-row"
                        onClick={() => openReceiptDetail(receipt.id)}
                        style={{ cursor: "pointer" }}
                        title="Nhấn để xem chi tiết phiếu nhập"
                      >
                        <td>{receipt.code || "-"}</td>
                        <td>{dayjs(receipt.receipt_date).format("DD/MM/YYYY")}</td>
                        <td>{receipt.delivery_full_name || "-"}</td>
                        <td>{receipt.warehouse?.name || "-"}</td>
                        <td>{receipt.receiver_full_name || "-"}</td>
                        <td>{formatNumber(getReceiptItemsCount(receipt), 0)}</td>
                        {/* <td>{formatNumber(getReceiptTotalQuantity(receipt), 0)}</td> */}
                        <td>{formatNumber(receipt.total_amount || 0, 0)}</td>
                        <td>{receipt.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        open={Boolean(detail) || detailLoading}
        title="Chi tiết phiếu nhập"
        onClose={closeReceiptDetail}
        width={1100}
      >
        {detailLoading && !detail ? (
          <div className="muted">Đang tải chi tiết phiếu nhập...</div>
        ) : detail ? (
          <div className="grid">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Mã phiếu</div>
                <strong>{detail.code || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Kho</div>
                <strong>{detail.warehouse?.name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Ngày nhập</div>
                <strong>{dayjs(detail.receipt_date).format("DD/MM/YYYY")}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Tổng tiền</div>
                <strong>{formatNumber(detail.total_amount || 0, 0)}</strong>
              </div>
            </div>

            <div className="grid cols-2">
              <div className="summary-card">
                <div className="muted">Nhà cung cấp (người giao)</div>
                <strong>{detail.delivery_full_name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Người nhận</div>
                <strong>{detail.receiver_full_name || "-"}</strong>
              </div>
            </div>

            <div className="summary-card">
              <div className="muted">Ghi chú</div>
              <strong>{detail.note || "-"}</strong>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá nhập</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>

                <tbody>
                  {detail.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.product?.code} - {item.product?.name}
                      </td>
                      <td>{formatNumber(item.quantity || 0, 0)}</td>
                      <td>{formatNumber(item.unit_cost || 0, 0)}</td>
                      <td>{formatNumber(item.line_total || 0, 0)}</td>
                    </tr>
                  ))}

                  {!detail.items?.length ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState message="Không có sản phẩm trong phiếu nhập này." />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}