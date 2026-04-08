import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Search, ChevronDown, X } from "lucide-react";
import dayjs from "dayjs";
import usePaginatedResource from "../hooks/usePaginatedResource";
import {
  productService,
  stockIssueService,
  warehouseService,
} from "../api/services";
import { formatNumber, getErrorMessage } from "../utils/helpers";
import { exportStockIssueToWord } from "../utils/exportStockIssueToWord";
import SectionCard from "../components/SectionCard";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

const itemTemplate = { product_id: "", quantity: "", unit_price: "" };

const modalUiCss = `
.stock-ui {
  --stock-primary: #2563eb;
  --stock-primary-soft: #eff6ff;
  --stock-border: #dbe3f0;
  --stock-border-strong: #c7d2e3;
  --stock-text: #0f172a;
  --stock-muted: #64748b;
  --stock-soft: #f8fafc;
  --stock-soft-2: #f1f5f9;
  --stock-danger: #dc2626;
  --stock-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.stock-ui .stock-form {
  gap: 16px;
}

.stock-ui .stock-card {
  border: 1px solid var(--stock-border);
  border-radius: 18px;
  background: #fff;
  padding: 16px;
  box-shadow: var(--stock-shadow);
}

.stock-ui .stock-card-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--stock-text);
}

.stock-ui .stock-section-note {
  margin-top: -6px;
  margin-bottom: 12px;
  color: var(--stock-muted);
  font-size: 13px;
}

.stock-ui .stock-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stock-ui .stock-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.stock-ui .stock-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stock-ui .stock-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--stock-text);
}

.stock-ui .stock-control,
.stock-ui .stock-search-input,
.stock-ui .stock-textarea {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--stock-border);
  border-radius: 12px;
  background: #fff;
  color: var(--stock-text);
  padding: 10px 14px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.stock-ui .stock-textarea {
  min-height: 92px;
  resize: vertical;
  font-family: inherit;
}

.stock-ui .stock-control:focus,
.stock-ui .stock-search-input:focus,
.stock-ui .stock-textarea:focus {
  border-color: var(--stock-primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.stock-ui .stock-control[readonly],
.stock-ui .stock-search-input.readonly {
  background: var(--stock-soft);
  color: var(--stock-muted);
}

.stock-ui .stock-summary-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  border: 1px solid #bfdbfe;
}

.stock-ui .stock-summary-label {
  font-size: 13px;
  color: var(--stock-muted);
}

.stock-ui .stock-summary-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--stock-primary);
}

.stock-ui .stock-items-wrap {
  overflow: visible;
}

.stock-ui .stock-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.stock-ui .stock-table thead th {
  font-size: 13px;
  font-weight: 700;
  color: var(--stock-text);
  background: var(--stock-soft-2);
  border-top: 1px solid var(--stock-border);
  border-bottom: 1px solid var(--stock-border);
  padding: 12px 10px;
}

.stock-ui .stock-table thead th:first-child {
  border-left: 1px solid var(--stock-border);
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.stock-ui .stock-table thead th:last-child {
  border-right: 1px solid var(--stock-border);
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.stock-ui .stock-table tbody td {
  padding: 0 6px;
  vertical-align: top;
}

.stock-ui .stock-row-shell {
  background: #fff;
  border: 1px solid var(--stock-border);
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  padding: 10px;
}

.stock-ui .stock-line-readonly {
  background: var(--stock-soft);
  font-weight: 700;
}

.stock-ui .stock-inline-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.stock-ui .product-search {
  position: relative;
}

.stock-ui .product-search-box {
  position: relative;
}

.stock-ui .stock-search-input {
  padding-left: 42px;
  padding-right: 42px;
}

.stock-ui .product-search-leading,
.stock-ui .product-search-trailing {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--stock-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-ui .product-search-leading {
  left: 14px;
}

.stock-ui .product-search-trailing {
  right: 12px;
}

.stock-ui .product-search-clear {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: var(--stock-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-ui .product-search-clear:hover {
  color: var(--stock-danger);
}

.stock-ui .product-search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #fff;
  border: 1px solid var(--stock-border-strong);
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
  max-height: 280px;
  overflow-y: auto;
}

.stock-ui .product-search-option {
  width: 100%;
  border: none;
  background: #fff;
  text-align: left;
  cursor: pointer;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background 0.18s ease;
}

.stock-ui .product-search-option:hover,
.stock-ui .product-search-option.active {
  background: var(--stock-primary-soft);
}

.stock-ui .product-option-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--stock-text);
}

.stock-ui .product-option-meta {
  font-size: 12px;
  color: var(--stock-muted);
}

.stock-ui .product-search-empty {
  padding: 14px;
  color: var(--stock-muted);
  font-size: 13px;
  text-align: center;
}

.stock-ui .stock-form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.stock-ui .stock-form-actions .spacer {
  flex: 1;
}

@media (max-width: 960px) {
  .stock-ui .stock-grid-3,
  .stock-ui .stock-grid-2 {
    grid-template-columns: 1fr;
  }

  .stock-ui .stock-table {
    min-width: 860px;
  }
}
`;

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateDraftCode = (prefix) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  const hours = `${now.getHours()}`.padStart(2, "0");
  const minutes = `${now.getMinutes()}`.padStart(2, "0");
  const seconds = `${now.getSeconds()}`.padStart(2, "0");

  return `${prefix}${year}${month}${day}-${hours}${minutes}${seconds}`;
};

const formatDateTimeVN = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const normalizeIntegerInput = (value, min = 0) => {
  if (value === "") return "";

  const parsed = parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return "";

  return String(Math.max(parsed, min));
};

const getProductLabel = (product) =>
  [product?.code, product?.name].filter(Boolean).join(" - ");

const createFormTemplate = (code = "") => ({
  code,
  warehouse_id: "",
  issue_date: getTodayString(),
  receiver_full_name: "",
  delivery_full_name: "",
  note: "",
  items: [{ ...itemTemplate }],
});

const mapIssueToForm = (issue) => ({
  code: issue?.code || "",
  warehouse_id: String(issue?.warehouse_id || issue?.warehouse?.id || ""),
  issue_date: issue?.issue_date
    ? String(issue.issue_date).slice(0, 10)
    : getTodayString(),
  receiver_full_name: issue?.receiver_full_name || "",
  delivery_full_name: issue?.delivery_full_name || "",
  note: issue?.note || "",
  items:
    issue?.items?.length > 0
      ? issue.items.map((item) => ({
          product_id: String(item.product_id || item.product?.id || ""),
          quantity:
            item.quantity === null || item.quantity === undefined
              ? ""
              : String(parseInt(item.quantity, 10)),
          unit_price:
            item.unit_price === null || item.unit_price === undefined
              ? ""
              : String(parseInt(item.unit_price, 10)),
        }))
      : [{ ...itemTemplate }],
});

const validateIssueForm = (form) => {
  if (!form.warehouse_id) return "Vui lòng chọn kho.";
  if (!form.issue_date) return "Vui lòng chọn ngày xuất.";
  if (!String(form.receiver_full_name || "").trim()) {
    return "Vui lòng nhập họ tên người nhận.";
  }
  if (!String(form.delivery_full_name || "").trim()) {
    return "Vui lòng nhập họ tên người giao.";
  }
  if (!Array.isArray(form.items) || form.items.length === 0) {
    return "Phiếu xuất phải có ít nhất 1 sản phẩm.";
  }

  for (let i = 0; i < form.items.length; i += 1) {
    const item = form.items[i];

    if (!item.product_id) {
      return `Dòng ${i + 1}: vui lòng chọn sản phẩm.`;
    }

    if (!item.quantity || Number(item.quantity) <= 0) {
      return `Dòng ${i + 1}: số lượng phải lớn hơn 0.`;
    }

    if (item.unit_price === "" || Number(item.unit_price) < 0) {
      return `Dòng ${i + 1}: vui lòng nhập đơn giá bán hợp lệ.`;
    }
  }

  return "";
};

const buildIssuePayload = (form) => ({
  warehouse_id: parseInt(form.warehouse_id, 10),
  issue_date: form.issue_date || getTodayString(),
  receiver_full_name: String(form.receiver_full_name || "").trim(),
  delivery_full_name: String(form.delivery_full_name || "").trim(),
  note: String(form.note || "").trim() || null,
  items: form.items.map((item) => ({
    product_id: parseInt(item.product_id, 10),
    quantity: parseInt(item.quantity, 10),
    unit_price: parseInt(item.unit_price, 10),
  })),
});

function ProductSearchSelect({
  products,
  value,
  onChange,
  placeholder = "Tìm mã hoặc tên sản phẩm",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!value) {
      setKeyword("");
      return;
    }

    const selected = products.find((p) => String(p.id) === String(value));
    setKeyword(selected ? getProductLabel(selected) : "");
  }, [value, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = String(keyword || "")
      .trim()
      .toLowerCase();

    if (!normalized) return products.slice(0, 30);

    return products
      .filter((product) => {
        const content = [product?.code, product?.name, product?.unit]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return content.includes(normalized);
      })
      .slice(0, 30);
  }, [products, keyword]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setKeyword(nextValue);
    setOpen(true);

    if (!nextValue.trim()) {
      onChange("");
    }
  };

  const handleSelectProduct = (product) => {
    onChange(String(product.id));
    setKeyword(getProductLabel(product));
    setOpen(false);
  };

  const handleClear = () => {
    setKeyword("");
    onChange("");
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && open && filteredProducts.length) {
      event.preventDefault();
      handleSelectProduct(filteredProducts[0]);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="product-search" ref={wrapperRef}>
      <div className="product-search-box">
        <span className="product-search-leading">
          <Search size={16} />
        </span>

        <input
          className="stock-search-input"
          value={keyword}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />

        <span className="product-search-trailing">
          {keyword ? (
            <button
              type="button"
              className="product-search-clear"
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
        <div className="product-search-dropdown">
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`product-search-option ${
                  String(value) === String(product.id) ? "active" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectProduct(product)}
              >
                <span className="product-option-title">
                  {product.name || "Không tên sản phẩm"}
                </span>
                <span className="product-option-meta">
                  {product.code || "Không có mã"} • ĐVT: {product.unit || "-"}
                </span>
              </button>
            ))
          ) : (
            <div className="product-search-empty">
              Không tìm thấy sản phẩm phù hợp
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function StockIssuesPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(
    stockIssueService,
    { warehouse_id: "", from_date: "", to_date: "" },
  );

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [removeItem, setRemoveItem] = useState(null);
  const [reopenDetailId, setReopenDetailId] = useState(null);
  const [form, setForm] = useState(createFormTemplate());
  const [submitError, setSubmitError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    warehouseService
      .list({ per_page: 100 })
      .then((res) => setWarehouses(res.data.data || []))
      .catch(() => {});

    productService
      .list({ per_page: 100 })
      .then((res) => setProducts(res.data.data || []))
      .catch(() => {});
  }, []);

  const resetForm = (code = "") => {
    setEditingId(null);
    setForm(createFormTemplate(code));
    setSubmitError("");
  };

  const closeForm = () => {
    setOpenForm(false);
    resetForm();
  };

  const loadDetail = async (id) => {
    if (!id) return null;

    setDetailLoading(true);
    setSubmitError("");

    try {
      const res = await stockIssueService.detail(id);
      const nextDetail = res.data.data;
      setDetail(nextDetail);
      return nextDetail;
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const changeItem = (index, field, value) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...itemTemplate }],
    }));

  const removeFormItem = (index) =>
    setForm((prev) => {
      const nextItems = prev.items.filter((_, idx) => idx !== index);
      return {
        ...prev,
        items: nextItems.length ? nextItems : [{ ...itemTemplate }],
      };
    });

  const openCreateForm = () => {
    setReopenDetailId(null);
    resetForm(generateDraftCode("PXK-"));
    setOpenForm(true);
  };

  const viewDetail = async (id) => {
    await loadDetail(id);
  };

  const openEditForm = async (issueOrId, options = {}) => {
    setSubmitError("");

    try {
      let issue = issueOrId;

      if (!issue || typeof issue !== "object" || !issue.items) {
        const issueId =
          typeof issueOrId === "object" ? issueOrId?.id : issueOrId;
        const res = await stockIssueService.detail(issueId);
        issue = res.data.data;
      }

      setEditingId(issue.id);
      setForm(mapIssueToForm(issue));
      setReopenDetailId(options.fromDetail ? issue.id : null);

      if (options.fromDetail) {
        setDetail(null);
      }

      setOpenForm(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeItem?.id) return;

    const target = removeItem;
    setSubmitError("");
    setDeletingId(target.id);

    try {
      await stockIssueService.remove(target.id);
      setRemoveItem(null);

      if (detail?.id === target.id) {
        setDetail(null);
      }

      if (editingId === target.id) {
        closeForm();
      }

      setReopenDetailId(null);
      fetchData();
    } catch (err) {
      setRemoveItem(null);
      setSubmitError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationMessage = validateIssueForm(form);
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildIssuePayload(form);
      const currentEditingId = editingId;
      const shouldReopenDetail = Boolean(currentEditingId && reopenDetailId);

      if (currentEditingId) {
        await stockIssueService.update(currentEditingId, payload);
      } else {
        await stockIssueService.create(payload);
      }

      closeForm();
      fetchData();

      if (shouldReopenDetail) {
        await loadDetail(reopenDetailId);
        setReopenDetailId(null);
      } else if (!currentEditingId) {
        setReopenDetailId(null);
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportWord = async () => {
    if (!detail) return;

    try {
      setExporting(true);
      setSubmitError("");
      await exportStockIssueToWord(detail);
    } catch (err) {
      setSubmitError(getErrorMessage(err) || "Không thể xuất file Word");
    } finally {
      setExporting(false);
    }
  };

  const list = data?.data || [];
  const isEditing = Boolean(editingId);

  const formTotalAmount = useMemo(
    () =>
      form.items.reduce((sum, item) => {
        const quantity = parseInt(item.quantity || 0, 10) || 0;
        const unitPrice = parseInt(item.unit_price || 0, 10) || 0;
        return sum + quantity * unitPrice;
      }, 0),
    [form.items],
  );

  return (
    <>
      <style>{modalUiCss}</style>

      <SectionCard
        title="Xuất kho"
        action={
          <button className="primary-btn" onClick={openCreateForm}>
            Lập phiếu xuất
          </button>
        }
      >
        <div className="filters">
          <div className="field">
            <label>Kho</label>
            <select
              value={filters.warehouse_id || ""}
              onChange={(e) =>
                fetchData({ ...filters, warehouse_id: e.target.value, page: 1 })
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

          <div className="field">
            <label>Từ ngày</label>
            <input
              type="date"
              value={filters.from_date || ""}
              onChange={(e) =>
                fetchData({ ...filters, from_date: e.target.value, page: 1 })
              }
            />
          </div>

          <div className="field">
            <label>Đến ngày</label>
            <input
              type="date"
              value={filters.to_date || ""}
              onChange={(e) =>
                fetchData({ ...filters, to_date: e.target.value, page: 1 })
              }
            />
          </div>
        </div>

        {error || submitError ? (
          <div className="alert error">{error || submitError}</div>
        ) : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Kho</th>
                <th>Ngày xuất</th>
                <th>Người nhận</th>
                <th>Người giao</th>
                <th>SL sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Người tạo</th>
                <th style={{ width: 140 }}>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {list.map((item) => (
                <tr
                  key={item.id}
                  className="clickable-row"
                  onClick={() => viewDetail(item.id)}
                  style={{ cursor: "pointer" }}
                  title="Nhấn để xem chi tiết"
                >
                  <td>{item.code}</td>
                  <td>{item.warehouse?.name || "-"}</td>
                  <td>{dayjs(item.issue_date).format("DD/MM/YYYY")}</td>
                  <td>{item.receiver_full_name || "-"}</td>
                  <td>{item.delivery_full_name || "-"}</td>
                  <td>{item.items_count}</td>
                  <td>{formatNumber(item.total_amount, 0)}</td>
                  <td>{item.creator?.name || "-"}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="icon-btn ghost-btn"
                        title="Sửa"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(item.id);
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-btn danger-btn"
                        title="Xóa"
                        disabled={deletingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveItem(item);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && !list.length ? (
            <EmptyState message="Chưa có phiếu xuất." />
          ) : null}
        </div>

        <Pagination
          meta={data}
          onPageChange={(page) => fetchData({ ...filters, page })}
        />
      </SectionCard>

      <Modal
        open={openForm}
        title={isEditing ? "Cập nhật phiếu xuất kho" : "Lập phiếu xuất kho"}
        onClose={closeForm}
        width={1180}
      >
        <div className="stock-ui">
          <form className="grid stock-form" onSubmit={submit}>
            {submitError ? (
              <div className="alert error">{submitError}</div>
            ) : null}

            <div className="stock-card">
              <h3 className="stock-card-title">Thông tin phiếu xuất</h3>

              <div className="stock-grid-3">
                <div className="stock-field">
                  <label className="stock-label">Mã phiếu</label>
                  <input
                    className="stock-control"
                    value={form.code}
                    readOnly
                    placeholder="Mã phiếu tự động"
                  />
                </div>

                <div className="stock-field">
                  <label className="stock-label">Kho</label>
                  <select
                    className="stock-control"
                    value={form.warehouse_id}
                    onChange={(e) =>
                      setForm({ ...form, warehouse_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Chọn kho</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="stock-field">
                  <label className="stock-label">Ngày xuất</label>
                  <input
                    className="stock-control"
                    type="date"
                    value={form.issue_date || getTodayString()}
                    onChange={(e) =>
                      setForm({ ...form, issue_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="stock-grid-2" style={{ marginTop: 14 }}>
                <div className="stock-field">
                  <label className="stock-label">Người nhận</label>
                  <input
                    className="stock-control"
                    value={form.receiver_full_name}
                    onChange={(e) =>
                      setForm({ ...form, receiver_full_name: e.target.value })
                    }
                    placeholder="Nhập họ tên người nhận"
                    required
                  />
                </div>

                <div className="stock-field">
                  <label className="stock-label">Người giao</label>
                  <input
                    className="stock-control"
                    value={form.delivery_full_name}
                    onChange={(e) =>
                      setForm({ ...form, delivery_full_name: e.target.value })
                    }
                    placeholder="Nhập họ tên người giao"
                    required
                  />
                </div>
              </div>

              <div className="stock-field" style={{ marginTop: 14 }}>
                <label className="stock-label">Ghi chú</label>
                <textarea
                  className="stock-textarea"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Nhập ghi chú phiếu xuất"
                />
              </div>
            </div>

            <div className="stock-card">
              <h3 className="stock-card-title">Danh sách sản phẩm xuất</h3>
              <div className="stock-section-note">
                Có thể gõ mã sản phẩm, tên sản phẩm hoặc đơn vị tính để tìm
                nhanh.
              </div>

              <div className="table-wrap stock-items-wrap">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style={{ width: 160 }}>Số lượng xuất</th>
                      <th style={{ width: 180 }}>Đơn giá bán</th>
                      <th style={{ width: 180 }}>Thành tiền</th>
                      <th style={{ width: 130 }}></th>
                    </tr>
                  </thead>

                  <tbody>
                    {form.items.map((item, index) => {
                      const quantity = parseInt(item.quantity || 0, 10) || 0;
                      const unitPrice = parseInt(item.unit_price || 0, 10) || 0;
                      const lineTotal = quantity * unitPrice;

                      return (
                        <tr key={index}>
                          <td>
                            <ProductSearchSelect
                              products={products}
                              value={item.product_id}
                              onChange={(nextValue) =>
                                changeItem(index, "product_id", nextValue)
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="stock-control"
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) =>
                                changeItem(
                                  index,
                                  "quantity",
                                  normalizeIntegerInput(e.target.value, 1),
                                )
                              }
                              required
                            />
                          </td>

                          <td>
                            <input
                              className="stock-control"
                              type="number"
                              min="0"
                              step="1"
                              value={item.unit_price}
                              onChange={(e) =>
                                changeItem(
                                  index,
                                  "unit_price",
                                  normalizeIntegerInput(e.target.value, 0),
                                )
                              }
                              required
                            />
                          </td>

                          <td>
                            <input
                              className="stock-control stock-line-readonly"
                              value={formatNumber(lineTotal, 0)}
                              readOnly
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() => removeFormItem(index)}
                              disabled={form.items.length === 1}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="stock-summary-box">
              <div>
                <div className="stock-summary-label">Tổng tiền tạm tính</div>
                <div className="stock-summary-value">
                  {formatNumber(formTotalAmount, 0)}
                </div>
              </div>

              <button type="button" className="ghost-btn" onClick={addItem}>
                Thêm dòng
              </button>
            </div>

            <div className="stock-form-actions">
              <div className="spacer" />
              <button type="button" className="ghost-btn" onClick={closeForm}>
                Hủy
              </button>

              <button
                className="primary-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? isEditing
                    ? "Đang cập nhật..."
                    : "Đang lưu..."
                  : isEditing
                    ? "Cập nhật phiếu xuất"
                    : "Lưu phiếu xuất"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        open={Boolean(detail) || detailLoading}
        title="Chi tiết phiếu xuất"
        onClose={() => {
          setDetail(null);
          setDetailLoading(false);
        }}
        width={1100}
      >
        {detailLoading && !detail ? (
          <div className="muted">Đang tải chi tiết phiếu xuất...</div>
        ) : detail ? (
          <div className="grid">
            <div className="actions" style={{ marginBottom: 12 }}>
              <button
                type="button"
                className="primary-btn"
                onClick={handleExportWord}
                disabled={exporting}
              >
                {exporting ? "Đang xuất..." : "Xuất Word"}
              </button>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => openEditForm(detail, { fromDetail: true })}
              >
                <Pencil size={16} />
                Sửa phiếu
              </button>

              <button
                type="button"
                className="danger-btn"
                disabled={deletingId === detail.id}
                onClick={() => setRemoveItem(detail)}
              >
                <Trash2 size={16} />
                {deletingId === detail.id ? "Đang xóa..." : "Xóa phiếu"}
              </button>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Mã phiếu</div>
                <strong>{detail.code}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Kho</div>
                <strong>{detail.warehouse?.name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Ngày xuất</div>
                <strong>{formatDateTimeVN(detail.issue_date)}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Tổng tiền</div>
                <strong>{formatNumber(detail.total_amount, 0)}</strong>
              </div>
            </div>

            <div className="grid cols-2">
              <div className="summary-card">
                <div className="muted">Người nhận</div>
                <strong>{detail.receiver_full_name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Người giao</div>
                <strong>{detail.delivery_full_name || "-"}</strong>
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
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>

                <tbody>
                  {detail.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.product?.code} - {item.product?.name}
                      </td>
                      <td>{formatNumber(item.quantity, 0)}</td>
                      <td>{formatNumber(item.unit_price, 0)}</td>
                      <td>{formatNumber(item.line_total, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(removeItem)}
        message={`Xóa phiếu xuất ${removeItem?.code}?`}
        onClose={() => setRemoveItem(null)}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
