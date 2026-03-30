import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import usePaginatedResource from "../hooks/usePaginatedResource";
import { productGroupService } from "../api/services";
import { formatDate, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

const initialForm = { code: "", name: "", description: "" };

export default function ProductGroupsPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(
    productGroupService,
    { search: "" }
  );

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [removeItem, setRemoveItem] = useState(null);

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
      description: item.description || "",
    });
    setSubmitError("");
    setOpenForm(true);
  };

  const openDetail = (item) => {
    setSelected(item);
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

    try {
      if (editing) {
        await productGroupService.update(editing.id, form);
      } else {
        await productGroupService.create(form);
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
  const totalGroups = data?.total || list.length || 0;

  return (
    <>
      <SectionCard
        title={`Nhóm hàng : ${totalGroups} nhóm`}
        action={
          <button className="primary-btn" onClick={openCreate}>
            Thêm nhóm
          </button>
        }
      >
        <div className="filters">
          <div className="field">
            <label>Tìm kiếm</label>
            <input
              defaultValue={filters.search}
              onChange={(e) =>
                fetchData({ ...filters, page: 1, search: e.target.value })
              }
              placeholder="Tên nhóm / mã nhóm"
            />
          </div>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã nhóm</th>
                <th>Tên nhóm</th>
                <th>Mô tả</th>
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
                    <td>{item.description || "-"}</td>
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
            <EmptyState message="Chưa có nhóm hàng." />
          ) : null}
        </div>

        <Pagination
          meta={data}
          onPageChange={(page) => fetchData({ ...filters, page })}
        />
      </SectionCard>

      <Modal
        open={Boolean(selected)}
        title="Chi tiết nhóm hàng"
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="grid">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Mã nhóm</div>
                <strong>{selected.code || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Tên nhóm</div>
                <strong>{selected.name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Ngày tạo</div>
                <strong>{formatDate(selected.created_at)}</strong>
              </div>
            </div>

            <div className="section-card" style={{ padding: 16 }}>
              <div className="field">
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
                Sửa nhóm
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={openForm}
        title={editing ? "Cập nhật nhóm hàng" : "Thêm nhóm hàng"}
        onClose={closeForm}
      >
        <form className="grid cols-2" onSubmit={handleSubmit}>
          {submitError ? (
            <div className="alert error" style={{ gridColumn: "1 / -1" }}>
              {submitError}
            </div>
          ) : null}

          <div className="field">
            <label>Mã nhóm</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Tên nhóm</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field full">
            <label>Mô tả</label>
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="actions end" style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              className="ghost-btn"
              onClick={closeForm}
            >
              Hủy
            </button>

            <button className="primary-btn" disabled={submitLoading}>
              {submitLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(removeItem)}
        message={`Xóa nhóm hàng ${removeItem?.name}?`}
        onClose={() => setRemoveItem(null)}
        onConfirm={async () => {
          try {
            await productGroupService.remove(removeItem.id);
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