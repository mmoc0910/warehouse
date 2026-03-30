export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={meta.current_page <= 1} onClick={() => onPageChange(meta.current_page - 1)}>
        Trước
      </button>
      <span>
        Trang {meta.current_page} / {meta.last_page} — Tổng {meta.total}
      </span>
      <button disabled={meta.current_page >= meta.last_page} onClick={() => onPageChange(meta.current_page + 1)}>
        Sau
      </button>
    </div>
  );
}
