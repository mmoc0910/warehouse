export default function Modal({ open, title, onClose, children, width = 720 }) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflow: "hidden",
      }}
    >
      <div
        className="modal-card"
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "min(90vh, calc(100dvh - 32px))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h3 style={{ margin: 0, minWidth: 0 }}>{title}</h3>
          <button type="button" className="ghost-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 12,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}