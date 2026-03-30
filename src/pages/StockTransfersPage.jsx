
import { useEffect, useState } from 'react';
import usePaginatedResource from '../hooks/usePaginatedResource';
import { productService, stockTransferService, warehouseService } from '../api/services';
import { formatNumber, getErrorMessage } from '../utils/helpers';
import SectionCard from '../components/SectionCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';

const itemTemplate = { product_id: '', quantity: '' };
const formTemplate = { code: '', from_warehouse_id: '', to_warehouse_id: '', transfer_date: '', note: '', items: [{ ...itemTemplate }] };

export default function StockTransfersPage() {
  const { filters, data, loading, error, fetchData } = usePaginatedResource(stockTransferService, { from_warehouse_id: '', to_warehouse_id: '', from_date: '', to_date: '' });
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
      await stockTransferService.create({ code: form.code || null, from_warehouse_id: Number(form.from_warehouse_id), to_warehouse_id: Number(form.to_warehouse_id), transfer_date: form.transfer_date, note: form.note || null, items: form.items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })) });
      setOpenForm(false); setForm(formTemplate); fetchData();
    } catch (err) { setSubmitError(getErrorMessage(err)); }
  };

  return (
    <>
      <SectionCard title="Điều chuyển kho" description="Chuyển hàng từ kho A sang kho B, cập nhật tồn hai bên và lưu lịch sử điều chuyển." action={<button className="primary-btn" onClick={() => { setOpenForm(true); setForm(formTemplate); setSubmitError(''); }}>Lập phiếu điều chuyển</button>}>
        <div className="filters">
          <div className="field"><label>Từ kho</label><select value={filters.from_warehouse_id || ''} onChange={(e) => fetchData({ ...filters, from_warehouse_id: e.target.value, page: 1 })}><option value="">Tất cả</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
          <div className="field"><label>Đến kho</label><select value={filters.to_warehouse_id || ''} onChange={(e) => fetchData({ ...filters, to_warehouse_id: e.target.value, page: 1 })}><option value="">Tất cả</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
          <div className="field"><label>Từ ngày</label><input type="date" value={filters.from_date || ''} onChange={(e) => fetchData({ ...filters, from_date: e.target.value, page: 1 })} /></div>
          <div className="field"><label>Đến ngày</label><input type="date" value={filters.to_date || ''} onChange={(e) => fetchData({ ...filters, to_date: e.target.value, page: 1 })} /></div>
        </div>
        {error || submitError ? <div className="alert error">{error || submitError}</div> : null}
        <div className="table-wrap"><table><thead><tr><th>Mã phiếu</th><th>Từ kho</th><th>Đến kho</th><th>Ngày chuyển</th><th>SL dòng</th><th>Người tạo</th><th></th></tr></thead><tbody>
          {data.data.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.from_warehouse?.name}</td><td>{item.to_warehouse?.name}</td><td>{item.transfer_date}</td><td>{item.items_count}</td><td>{item.creator?.name || '-'}</td><td><button className="ghost-btn" onClick={async () => setDetail((await stockTransferService.detail(item.id)).data.data)}>Chi tiết</button></td></tr>)}
        </tbody></table>{!loading && !data.data.length ? <EmptyState message="Chưa có phiếu điều chuyển." /> : null}</div>
        <Pagination meta={data} onPageChange={(page) => fetchData({ ...filters, page })} />
      </SectionCard>
      <Modal open={openForm} title="Lập phiếu điều chuyển" onClose={() => setOpenForm(false)} width={960}>
        <form className="grid" onSubmit={submit}>
          {submitError ? <div className="alert error">{submitError}</div> : null}
          <div className="grid cols-4">
            <div className="field"><label>Mã phiếu</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div className="field"><label>Từ kho</label><select value={form.from_warehouse_id} onChange={(e) => setForm({ ...form, from_warehouse_id: e.target.value })} required><option value="">Chọn kho</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div className="field"><label>Đến kho</label><select value={form.to_warehouse_id} onChange={(e) => setForm({ ...form, to_warehouse_id: e.target.value })} required><option value="">Chọn kho</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div className="field"><label>Ngày chuyển</label><input type="date" value={form.transfer_date} onChange={(e) => setForm({ ...form, transfer_date: e.target.value })} required /></div>
          </div>
          <div className="field"><label>Ghi chú</label><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          <div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Số lượng</th><th></th></tr></thead><tbody>{form.items.map((item, index) => <tr key={index}><td><select value={item.product_id} onChange={(e) => changeItem(index, 'product_id', e.target.value)} required><option value="">Chọn sản phẩm</option>{products.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}</select></td><td><input type="number" step="0.001" value={item.quantity} onChange={(e) => changeItem(index, 'quantity', e.target.value)} required /></td><td><button type="button" className="danger-btn" onClick={() => removeItem(index)} disabled={form.items.length === 1}>Xóa dòng</button></td></tr>)}</tbody></table></div>
          <div className="actions"><button type="button" className="ghost-btn" onClick={addItem}>Thêm dòng</button><div style={{ flex: 1 }} /><button type="button" className="ghost-btn" onClick={() => setOpenForm(false)}>Hủy</button><button className="primary-btn">Lưu phiếu chuyển</button></div>
        </form>
      </Modal>
      <Modal open={Boolean(detail)} title="Chi tiết phiếu điều chuyển" onClose={() => setDetail(null)} width={960}>
        {detail ? <div className="grid"><div className="summary-grid"><div className="summary-card"><div className="muted">Mã phiếu</div><strong>{detail.code}</strong></div><div className="summary-card"><div className="muted">Từ kho</div><strong>{detail.from_warehouse?.name}</strong></div><div className="summary-card"><div className="muted">Đến kho</div><strong>{detail.to_warehouse?.name}</strong></div><div className="summary-card"><div className="muted">Ngày chuyển</div><strong>{detail.transfer_date}</strong></div></div><div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Số lượng</th></tr></thead><tbody>{detail.items?.map((item) => <tr key={item.id}><td>{item.product?.code} - {item.product?.name}</td><td>{formatNumber(item.quantity, 3)}</td></tr>)}</tbody></table></div></div> : null}
      </Modal>
    </>
  );
}
