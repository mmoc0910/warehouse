import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import usePaginatedResource from "../hooks/usePaginatedResource";
import { warehouseService } from "../api/services";
import { formatDate, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

const initialForm = {
  code: "",
  name: "",
  address: "",
  description: "",
  is_active: true,
};

export default function WarehousesPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(
    warehouseService,
    { search: "" }
  );

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [removeItem, setRemoveItem] = useState(null);

  const handleSearch = (event) => {
    fetchData({ ...filters, page: 1, search: event.target.value });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setSubmitError("");
    setOpenForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      code: item.code || "",
      name: item.name || "",
      address: item.address || "",
      description: item.description || "",
      is_active: Boolean(item.is_active),
    });
    setSubmitError("");
    setOpenForm(true);
  };

  const openDetail = (item) => {
    setSelected(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");

    try {
      const payload = {
        ...form,
        is_active: Boolean(form.is_active),
      };

      if (editing) {
        await warehouseService.update(editing.id, payload);
      } else {
        await warehouseService.create(payload);
      }

      setOpenForm(false);
      setEditing(null);
      setForm(initialForm);
      fetchData();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!removeItem) return;

    try {
      await warehouseService.remove(removeItem.id);
      setRemoveItem(null);
      fetchData();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setRemoveItem(null);
    }
  };

  const list = data?.data || [];
  const currentPage = data?.current_page || 1;
  const perPage = data?.per_page || list.length || 0;
  const totalWarehouses = data?.total || list.length || 0;

  return (
    <>
      <SectionCard
        title={`Quản lý kho : ${totalWarehouses} kho`}
        action={
          <button className="primary-btn" onClick={openCreate}>
            Thêm kho
          </button>
        }
      >
        <div className="filters">
          <div className="field">
            <label>Tìm kiếm</label>
            <input
              placeholder="Tên kho / mã / địa chỉ"
              defaultValue={filters.search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã kho</th>
                <th>Tên kho</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
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
                    <td>{item.address}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.is_active ? "success" : "danger"
                        }`}
                      >
                        {item.is_active ? "Hoạt động" : "Khóa"}
                      </span>
                    </td>
                    <td>{formatDate(item.created_at)}</td>
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
            <EmptyState message="Chưa có kho nào." />
          ) : null}
        </div>

        <Pagination
          meta={data}
          onPageChange={(page) => fetchData({ ...filters, page })}
        />
      </SectionCard>

      <Modal
        open={Boolean(selected)}
        title="Chi tiết kho"
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="grid">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Mã kho</div>
                <strong>{selected.code || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Tên kho</div>
                <strong>{selected.name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Trạng thái</div>
                <strong>{selected.is_active ? "Hoạt động" : "Khóa"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Ngày tạo</div>
                <strong>{formatDate(selected.created_at)}</strong>
              </div>
            </div>

            <div className="section-card" style={{ padding: 16 }}>
              <div className="field">
                <label>Địa chỉ</label>
                <div>{selected.address || "-"}</div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>Mô tả</label>
                <div>{selected.description || "-"}</div>
              </div>
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
                Sửa kho
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={openForm}
        title={editing ? "Cập nhật kho" : "Thêm kho"}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
          setForm(initialForm);
          setSubmitError("");
        }}
      >
        <form className="grid cols-2" onSubmit={handleSubmit}>
          {submitError ? (
            <div className="alert error" style={{ gridColumn: "1 / -1" }}>
              {submitError}
            </div>
          ) : null}

          <div className="field">
            <label>Mã kho</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Tên kho</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field full">
            <label>Địa chỉ</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
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
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setOpenForm(false);
                setEditing(null);
                setForm(initialForm);
                setSubmitError("");
              }}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={submitLoading}
            >
              {submitLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(removeItem)}
        message={`Xóa kho ${removeItem?.name}?`}
        onClose={() => setRemoveItem(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}