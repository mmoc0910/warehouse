import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import dayjs from "dayjs";

const itemTemplate = { product_id: "", quantity: "", unit_price: "" };

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateIssueCode = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = `${now.getMonth() + 1}`.padStart(2, "0");
  const dd = `${now.getDate()}`.padStart(2, "0");
  const hh = `${now.getHours()}`.padStart(2, "0");
  const mi = `${now.getMinutes()}`.padStart(2, "0");
  const ss = `${now.getSeconds()}`.padStart(2, "0");
  return `PX-${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
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

const createFormTemplate = () => ({
  code: generateIssueCode(),
  warehouse_id: "",
  issue_date: getTodayString(),
  note: "",
  items: [{ ...itemTemplate }],
});

const mapIssueToForm = (issue) => ({
  code: issue?.code || "",
  warehouse_id: String(issue?.warehouse_id || issue?.warehouse?.id || ""),
  issue_date: issue?.issue_date
    ? String(issue.issue_date).slice(0, 10)
    : getTodayString(),
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

  const resetForm = () => {
    setEditingId(null);
    setForm(createFormTemplate());
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
    resetForm();
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
    setSubmitting(true);

    try {
      const payload = {
        warehouse_id: parseInt(form.warehouse_id, 10),
        issue_date: form.issue_date || getTodayString(),
        note: form.note || null,
        items: form.items.map((item) => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseInt(item.quantity, 10),
          unit_price:
            item.unit_price === "" ? null : parseInt(item.unit_price, 10),
        })),
      };

      const currentEditingId = editingId;
      const shouldReopenDetail = Boolean(currentEditingId && reopenDetailId);

      if (currentEditingId) {
        await stockIssueService.update(currentEditingId, payload);
      } else {
        await stockIssueService.create({
          ...payload,
          code: form.code || generateIssueCode(),
        });
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

  return (
    <>
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
                  {/* <td>{formatDateTimeVN(item.issue_date)}</td> */}
                   <td>{dayjs(item.issue_date).format("DD/MM/YYYY")}</td>
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
        width={960}
      >
        <form className="grid" onSubmit={submit}>
          {submitError ? (
            <div className="alert error">{submitError}</div>
          ) : null}

          <div className="grid cols-3">
            <div className="field">
              <label>Mã phiếu</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Tự động sinh mã phiếu"
                disabled={isEditing}
              />
            </div>

            <div className="field">
              <label>Kho</label>
              <select
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

            <div className="field">
              <label>Ngày xuất</label>
              <input
                type="date"
                value={form.issue_date || getTodayString()}
                onChange={(e) =>
                  setForm({ ...form, issue_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Ghi chú</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng xuất</th>
                  <th>Đơn giá bán</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {form.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          changeItem(index, "product_id", e.target.value)
                        }
                        required
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
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
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => removeFormItem(index)}
                        disabled={form.items.length === 1}
                      >
                        Xóa dòng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions">
            <button type="button" className="ghost-btn" onClick={addItem}>
              Thêm dòng
            </button>

            <div style={{ flex: 1 }} />

            <button type="button" className="ghost-btn" onClick={closeForm}>
              Hủy
            </button>

            <button className="primary-btn" type="submit" disabled={submitting}>
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
      </Modal>

      <Modal
        open={Boolean(detail) || detailLoading}
        title="Chi tiết phiếu xuất"
        onClose={() => {
          setDetail(null);
          setDetailLoading(false);
        }}
        width={960}
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
