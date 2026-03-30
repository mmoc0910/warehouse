import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import usePaginatedResource from "../hooks/usePaginatedResource";
import { productGroupService, productService } from "../api/services";
import { formatDate, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

const initialForm = {
  product_group_id: "",
  code: "",
  name: "",
  unit: "",
  min_stock_alert: "",
  shelf_life_days: "",
  description: "",
  is_active: true,
};

const formatInteger = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return Math.round(num).toLocaleString("vi-VN");
};

export default function ProductsPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(
    productService,
    { search: "", product_group_id: "" }
  );

  const [groups, setGroups] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [removeItem, setRemoveItem] = useState(null);

  useEffect(() => {
    productGroupService
      .list({ per_page: 100 })
      .then((res) => setGroups(res.data.data || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setSubmitError("");
    setOpenForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      product_group_id: item.product_group_id || "",
      code: item.code || "",
      name: item.name || "",
      unit: item.unit || "",
      min_stock_alert:
        item.min_stock_alert === null || item.min_stock_alert === undefined
          ? ""
          : String(Math.round(Number(item.min_stock_alert) || 0)),
      shelf_life_days: item.shelf_life_days || "",
      description: item.description || "",
      is_active: Boolean(item.is_active),
    });
    setSubmitError("");
    setOpenForm(true);
  };

  const openDetail = async (item) => {
    try {
      const res = await productService.detail(item.id);
      setSelected(res.data.data);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditing(null);
    setForm(initialForm);
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");

    const payload = {
      ...form,
      product_group_id: form.product_group_id || null,
      min_stock_alert:
        form.min_stock_alert === "" ? null : parseInt(form.min_stock_alert, 10),
      shelf_life_days:
        form.shelf_life_days === "" ? null : Number(form.shelf_life_days),
      is_active: Boolean(form.is_active),
    };

    try {
      if (editing) {
        await productService.update(editing.id, payload);
      } else {
        await productService.create(payload);
      }

      closeForm();
      fetchData();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const list = data?.data || [];
  const currentPage = data?.current_page || 1;
  const perPage = data?.per_page || list.length || 0;
  const totalProducts = data?.total || list.length || 0;

  return (
    <>
      <SectionCard
        title={`Sản phẩm : ${totalProducts} mặt hàng`}
        action={
          <button className="primary-btn" onClick={openCreate}>
            Thêm sản phẩm
          </button>
        }
      >
        <div className="filters">
          <div className="field">
            <label>Tìm kiếm</label>
            <input
              defaultValue={filters.search}
              placeholder="Tên / mã sản phẩm"
              onChange={(e) =>
                fetchData({ ...filters, page: 1, search: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Nhóm hàng</label>
            <select
              value={filters.product_group_id || ""}
              onChange={(e) =>
                fetchData({
                  ...filters,
                  page: 1,
                  product_group_id: e.target.value,
                })
              }
            >
              <option value="">Tất cả</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error || submitError ? (
          <div className="alert error">{error || submitError}</div>
        ) : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã</th>
                <th>Tên</th>
                <th>Nhóm hàng</th>
                <th>Đơn vị</th>
                <th>Min tồn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {list.map((item, index) => {
                const rowNumber = (currentPage - 1) * perPage + index + 1;

                return (
                  <tr
                    key={item.id}
                    className="clickable-row"
                    onClick={() => openDetail(item)}
                    style={{ cursor: "pointer" }}
                    title="Nhấn để xem chi tiết"
                  >
                    <td>{rowNumber}</td>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.group?.name || "-"}</td>
                    <td>{item.unit}</td>
                    <td>{formatInteger(item.min_stock_alert)}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.is_active ? "success" : "danger"
                        }`}
                      >
                        {item.is_active ? "Hoạt động" : "Khóa"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="icon-btn ghost-btn"
                          title="Sửa"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(item);
                          }}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="icon-btn danger-btn"
                          title="Xóa"
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
                );
              })}
            </tbody>
          </table>

          {!loading && !list.length ? (
            <EmptyState message="Chưa có sản phẩm." />
          ) : null}
        </div>

        <Pagination
          meta={data}
          onPageChange={(page) => fetchData({ ...filters, page })}
        />
      </SectionCard>

      <Modal
        open={openForm}
        title={editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        onClose={closeForm}
      >
        <form className="grid cols-2" onSubmit={handleSubmit}>
          {submitError ? (
            <div className="alert error" style={{ gridColumn: "1 / -1" }}>
              {submitError}
            </div>
          ) : null}

          <div className="field">
            <label>Nhóm hàng</label>
            <select
              value={form.product_group_id}
              onChange={(e) =>
                setForm({ ...form, product_group_id: e.target.value })
              }
            >
              <option value="">Không chọn</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Mã hàng</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Tên hàng</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Đơn vị tính</label>
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Mức cảnh báo tồn</label>
            <input
              type="number"
              step="1"
              min="0"
              value={form.min_stock_alert}
              onChange={(e) =>
                setForm({
                  ...form,
                  min_stock_alert: e.target.value.replace(/[^\d]/g, ""),
                })
              }
            />
          </div>

          <div className="field">
            <label>Hạn dùng (ngày)</label>
            <input
              type="number"
              value={form.shelf_life_days}
              onChange={(e) =>
                setForm({ ...form, shelf_life_days: e.target.value })
              }
            />
          </div>

          <div className="field full">
            <label>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Trạng thái</label>
            <select
              value={String(form.is_active)}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.value === "true" })
              }
            >
              <option value="true">Hoạt động</option>
              <option value="false">Khóa</option>
            </select>
          </div>

          <div className="actions end" style={{ gridColumn: "1 / -1" }}>
            <button type="button" className="ghost-btn" onClick={closeForm}>
              Hủy
            </button>

            <button className="primary-btn" disabled={submitLoading}>
              {submitLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(selected)}
        title="Chi tiết sản phẩm & tồn kho theo kho"
        onClose={() => setSelected(null)}
        width={900}
      >
        {selected ? (
          <div className="grid">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Mã hàng</div>
                <strong>{selected.code || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Tên hàng</div>
                <strong>{selected.name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Đơn vị</div>
                <strong>{selected.unit || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Nhóm</div>
                <strong>{selected.group?.name || "-"}</strong>
              </div>
            </div>

            <div className="section-card" style={{ padding: 16 }}>
              <div className="grid cols-2">
                <div className="field">
                  <label>Min tồn</label>
                  <div>{formatInteger(selected.min_stock_alert)}</div>
                </div>

                <div className="field">
                  <label>Trạng thái</label>
                  <div>{selected.is_active ? "Hoạt động" : "Khóa"}</div>
                </div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>Mô tả</label>
                <div>{selected.description || "-"}</div>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Kho</th>
                    <th>Địa chỉ</th>
                    <th>Số lượng tồn</th>
                    <th>Lần biến động cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.inventories || []).map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.warehouse?.name || "-"}</td>
                      <td>{inv.warehouse?.address || "-"}</td>
                      <td>{formatInteger(inv.quantity)}</td>
                      <td>{formatDate(inv.last_movement_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!(selected.inventories || []).length ? (
                <EmptyState message="Sản phẩm chưa có tồn kho ở kho nào." />
              ) : null}
            </div>

            <div className="actions end">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const current = selected;
                  setSelected(null);
                  openEdit(current);
                }}
              >
                <Pencil size={16} />
                Sửa sản phẩm
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(removeItem)}
        message={`Xóa sản phẩm ${removeItem?.name}?`}
        onClose={() => setRemoveItem(null)}
        onConfirm={async () => {
          try {
            await productService.remove(removeItem.id);
            setRemoveItem(null);
            fetchData();
          } catch (err) {
            setRemoveItem(null);
            setSubmitError(getErrorMessage(err));
          }
        }}
      />
    </>
  );
}