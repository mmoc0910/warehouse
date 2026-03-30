import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import usePaginatedResource from "../hooks/usePaginatedResource";
import { userService } from "../api/services";
import { formatDate, getErrorMessage } from "../utils/helpers";
import SectionCard from "../components/SectionCard";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "warehouse_staff",
  is_active: true,
};

const getRoleLabel = (role) => {
  switch (role) {
    case "system_admin":
      return "Quản trị hệ thống";
    case "warehouse_staff":
      return "Nhân viên kho";
    default:
      return role || "-";
  }
};

export default function UsersPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(
    userService,
    { search: "", role: "" }
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
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.roles?.[0]?.name || "warehouse_staff",
      is_active: Boolean(item.is_active),
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
      const payload = {
        ...form,
        is_active: Boolean(form.is_active),
      };

      if (!payload.password) delete payload.password;

      if (editing) {
        await userService.update(editing.id, payload);
      } else {
        await userService.create(payload);
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
  const totalUsers = data?.total || list.length || 0;

  return (
    <>
      <SectionCard
        title={`Người dùng & phân quyền : ${totalUsers} tài khoản`}
        action={
          <button className="primary-btn" onClick={openCreate}>
            Thêm người dùng
          </button>
        }
      >
        <div className="filters">
          <div className="field">
            <label>Tìm kiếm</label>
            <input
              defaultValue={filters.search}
              placeholder="Tên / email"
              onChange={(e) =>
                fetchData({ ...filters, page: 1, search: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Vai trò</label>
            <select
              value={filters.role || ""}
              onChange={(e) =>
                fetchData({ ...filters, page: 1, role: e.target.value })
              }
            >
              <option value="">Tất cả</option>
              <option value="system_admin">Quản trị hệ thống</option>
              <option value="warehouse_staff">Nhân viên kho</option>
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
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {list.map((item, index) => {
                const rowNumber = (currentPage - 1) * perPage + index + 1;
                const roleName = item.roles?.[0]?.name || "";
                const roleText = item.roles?.length
                  ? item.roles.map((r) => getRoleLabel(r.name)).join(", ")
                  : "-";

                return (
                  <tr
                    key={item.id}
                    className="clickable-row"
                    onClick={() => openDetail(item)}
                    style={{ cursor: "pointer" }}
                    title="Nhấn để xem chi tiết"
                  >
                    <td>{rowNumber}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{roleText}</td>
                    <td>
                      <span
                        className={`badge ${item.is_active ? "success" : "danger"}`}
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
            <EmptyState message="Chưa có người dùng." />
          ) : null}
        </div>

        <Pagination
          meta={data}
          onPageChange={(page) => fetchData({ ...filters, page })}
        />
      </SectionCard>

      <Modal
        open={Boolean(selected)}
        title="Chi tiết người dùng"
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="grid">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="muted">Họ tên</div>
                <strong>{selected.name || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Email</div>
                <strong>{selected.email || "-"}</strong>
              </div>

              <div className="summary-card">
                <div className="muted">Vai trò</div>
                <strong>
                  {selected.roles?.length
                    ? selected.roles.map((r) => getRoleLabel(r.name)).join(", ")
                    : "-"}
                </strong>
              </div>

              <div className="summary-card">
                <div className="muted">Ngày tạo</div>
                <strong>{formatDate(selected.created_at)}</strong>
              </div>
            </div>

            <div className="section-card" style={{ padding: 16 }}>
              <div className="grid cols-2">
                <div className="field">
                  <label>Trạng thái</label>
                  <div>{selected.is_active ? "Hoạt động" : "Khóa"}</div>
                </div>

                <div className="field">
                  <label>ID</label>
                  <div>{selected.id || "-"}</div>
                </div>
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
                Sửa người dùng
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={openForm}
        title={editing ? "Cập nhật người dùng" : "Thêm người dùng"}
        onClose={closeForm}
      >
        <form className="grid cols-2" onSubmit={handleSubmit}>
          {submitError ? (
            <div className="alert error" style={{ gridColumn: "1 / -1" }}>
              {submitError}
            </div>
          ) : null}

          <div className="field">
            <label>Họ tên</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Mật khẩu {editing ? "(để trống nếu không đổi)" : ""}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editing}
            />
          </div>

          <div className="field">
            <label>Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="system_admin">Quản trị hệ thống</option>
              <option value="warehouse_staff">Nhân viên kho</option>
            </select>
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

      <ConfirmDialog
        open={Boolean(removeItem)}
        message={`Xóa người dùng ${removeItem?.name}?`}
        onClose={() => setRemoveItem(null)}
        onConfirm={async () => {
          try {
            await userService.remove(removeItem.id);
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