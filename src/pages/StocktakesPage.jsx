
import { useEffect, useState } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource';
import { productService, stocktakeService, warehouseService } from '../api/services';
import { formatNumber, getErrorMessage } from '../utils/helpers';
import SectionCard from '../components/SectionCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';

const itemTemplate = { product_id: '', actual_qty: '' };
const formTemplate = { code: '', warehouse_id: '', checked_at: '', note: '', apply_adjustment: true, items: [{ ...itemTemplate }] };

export default function StocktakesPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(stocktakeService, { warehouse_id: '', from_date: '', to_date: '' });
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(formTemplate);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    warehouseService.list({ per_page: 100 }).then((res) => setWarehouses(res.data.data || []));
    productService.list({ per_page: 100 }).then((res) => setProducts(res.data.data || []));
  }, []);

  const changeItem = (index, field, value) => setForm((prev) => ({ ...prev, items: prev.items.map((item, idx) => idx === index ? { ...item, [field]: value } : item) }));
  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...itemTemplate }] }));
  const removeItem = (index) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) || [{ ...itemTemplate }] }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await stocktakeService.create({ code: form.code || null, warehouse_id: Number(form.warehouse_id), checked_at: form.checked_at, note: form.note || null, apply_adjustment: Boolean(form.apply_adjustment), items: form.items.map((item) => ({ product_id: Number(item.product_id), actual_qty: Number(item.actual_qty) })) });
      setOpenForm(false); setForm(formTemplate); fetchData();
    } catch (err) { setSubmitError(getErrorMessage(err)); }
  };

  return (
    <>
      <SectionCard title="Kiểm kê kho" description="So sánh tồn hệ thống và tồn thực tế, lập biên bản chênh lệch." action={<button className="primary-btn" onClick={() => { setOpenForm(true); setForm(formTemplate); setSubmitError(''); }}>Lập biên bản kiểm kê</button>}>
        <div className="filters">
          <div className="field"><label>Kho</label><select value={filters.warehouse_id || ''} onChange={(e) => fetchData({ ...filters, warehouse_id: e.target.value, page: 1 })}><option value="">Tất cả</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
          <div className="field"><label>Từ ngày</label><input type="date" value={filters.from_date || ''} onChange={(e) => fetchData({ ...filters, from_date: e.target.value, page: 1 })} /></div>
          <div className="field"><label>Đến ngày</label><input type="date" value={filters.to_date || ''} onChange={(e) => fetchData({ ...filters, to_date: e.target.value, page: 1 })} /></div>
        </div>
        {error || submitError ? <div className="alert error">{error || submitError}</div> : null}
        <div className="table-wrap"><table><thead><tr><th>Mã biên bản</th><th>Kho</th><th>Ngày kiểm kê</th><th>SL dòng</th><th>Điều chỉnh tồn</th><th>Người tạo</th><th></th></tr></thead><tbody>
          {data.data.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.warehouse?.name}</td><td>{item.checked_at}</td><td>{item.items_count}</td><td><span className={`badge ${item.apply_adjustment ? 'success' : 'warn'}`}>{item.apply_adjustment ? 'Có' : 'Không'}</span></td><td>{item.creator?.name || '-'}</td><td><button className="ghost-btn" onClick={async () => setDetail((await stocktakeService.detail(item.id)).data.data)}>Chi tiết</button></td></tr>)}
        </tbody></table>{!loading && !data.data.length ? <EmptyState message="Chưa có biên bản kiểm kê." /> : null}</div>
        <Pagination meta={data} onPageChange={(page) => fetchData({ ...filters, page })} />
      </SectionCard>
      <Modal open={openForm} title="Lập biên bản kiểm kê" onClose={() => setOpenForm(false)} width={960}>
        <form className="grid" onSubmit={submit}>
          {submitError ? <div className="alert error">{submitError}</div> : null}
          <div className="grid cols-4">
            <div className="field"><label>Mã biên bản</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div className="field"><label>Kho</label><select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} required><option value="">Chọn kho</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div className="field"><label>Ngày kiểm kê</label><input type="date" value={form.checked_at} onChange={(e) => setForm({ ...form, checked_at: e.target.value })} required /></div>
            <div className="field"><label>Áp dụng điều chỉnh</label><select value={String(form.apply_adjustment)} onChange={(e) => setForm({ ...form, apply_adjustment: e.target.value === 'true' })}><option value="true">Có</option><option value="false">Không</option></select></div>
          </div>
          <div className="field"><label>Ghi chú</label><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          <div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Số lượng thực tế</th><th></th></tr></thead><tbody>{form.items.map((item, index) => <tr key={index}><td><select value={item.product_id} onChange={(e) => changeItem(index, 'product_id', e.target.value)} required><option value="">Chọn sản phẩm</option>{products.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}</select></td><td><input type="number" step="0.001" value={item.actual_qty} onChange={(e) => changeItem(index, 'actual_qty', e.target.value)} required /></td><td><button type="button" className="danger-btn" onClick={() => removeItem(index)} disabled={form.items.length === 1}>Xóa dòng</button></td></tr>)}</tbody></table></div>
          <div className="actions"><button type="button" className="ghost-btn" onClick={addItem}>Thêm dòng</button><div style={{ flex: 1 }} /><button type="button" className="ghost-btn" onClick={() => setOpenForm(false)}>Hủy</button><button className="primary-btn">Lưu biên bản</button></div>
        </form>
      </Modal>
      <Modal open={Boolean(detail)} title="Chi tiết biên bản kiểm kê" onClose={() => setDetail(null)} width={980}>
        {detail ? <div className="grid"><div className="summary-grid"><div className="summary-card"><div className="muted">Mã biên bản</div><strong>{detail.code}</strong></div><div className="summary-card"><div className="muted">Kho</div><strong>{detail.warehouse?.name}</strong></div><div className="summary-card"><div className="muted">Ngày kiểm kê</div><strong>{detail.checked_at}</strong></div><div className="summary-card"><div className="muted">Điều chỉnh tồn</div><strong>{detail.apply_adjustment ? 'Có' : 'Không'}</strong></div></div><div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Tồn hệ thống</th><th>Tồn thực tế</th><th>Chênh lệch</th></tr></thead><tbody>{detail.items?.map((item) => <tr key={item.id}><td>{item.product?.code} - {item.product?.name}</td><td>{formatNumber(item.system_qty, 3)}</td><td>{formatNumber(item.actual_qty, 3)}</td><td>{formatNumber(item.variance_qty, 3)}</td></tr>)}</tbody></table></div></div> : null}
      </Modal>
    </>
  );
}
