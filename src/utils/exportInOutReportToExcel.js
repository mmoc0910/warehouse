// import * as XLSX from 'xlsx-js-style';

// function formatDateRange(fromDate, toDate) {
//   if (fromDate && toDate) return `${fromDate} đến ${toDate}`;
//   if (fromDate) return `Từ ${fromDate}`;
//   if (toDate) return `Đến ${toDate}`;
//   return 'Toàn thời gian';
// }

// const BORDER_ALL = {
//   top: { style: 'medium', color: { rgb: '000000' } },
//   bottom: { style: 'medium', color: { rgb: '000000' } },
//   left: { style: 'medium', color: { rgb: '000000' } },
//   right: { style: 'medium', color: { rgb: '000000' } },
// };

// const TITLE_STYLE = {
//   font: { bold: true, sz: 14 },
//   alignment: { horizontal: 'center', vertical: 'center' },
//   border: BORDER_ALL,
// };

// const HEADER_STYLE = {
//   font: { bold: true },
//   alignment: { horizontal: 'center', vertical: 'center' },
//   border: BORDER_ALL,
// };

// const CELL_STYLE = {
//   alignment: { vertical: 'center' },
//   border: BORDER_ALL,
// };

// const LABEL_STYLE = {
//   font: { bold: true },
//   alignment: { vertical: 'center' },
//   border: BORDER_ALL,
// };

// const NUMBER_STYLE = {
//   alignment: { horizontal: 'right', vertical: 'center' },
//   border: BORDER_ALL,
//   numFmt: '#,##0.000',
// };

// const MONEY_STYLE = {
//   alignment: { horizontal: 'right', vertical: 'center' },
//   border: BORDER_ALL,
//   numFmt: '#,##0.00',
// };

// function applyStyle(ws, range, style) {
//   const decoded = XLSX.utils.decode_range(range);

//   for (let r = decoded.s.r; r <= decoded.e.r; r += 1) {
//     for (let c = decoded.s.c; c <= decoded.e.c; c += 1) {
//       const cellRef = XLSX.utils.encode_cell({ r, c });

//       if (!ws[cellRef]) {
//         ws[cellRef] = { t: 's', v: '' };
//       }

//       ws[cellRef].s = {
//         ...(ws[cellRef].s || {}),
//         ...style,
//         border: style.border || ws[cellRef].s?.border,
//         alignment: style.alignment || ws[cellRef].s?.alignment,
//         font: style.font || ws[cellRef].s?.font,
//         fill: style.fill || ws[cellRef].s?.fill,
//         numFmt: style.numFmt || ws[cellRef].s?.numFmt,
//       };
//     }
//   }
// }

// function buildSummarySheet(report, filters, warehouses) {
//   const warehouseName =
//     warehouses.find((w) => String(w.id) === String(filters.warehouse_id))?.name || 'Tất cả';

//   const data = [
//     ['BÁO CÁO NHẬP - XUẤT THEO THỜI GIAN', ''],
//     ['', ''],
//     ['Khoảng thời gian', formatDateRange(filters.from_date, filters.to_date)],
//     ['Kho', warehouseName],
//     ['', ''],
//     ['Chỉ tiêu', 'Giá trị'],
//     ['Tổng nhập', Number(report?.summary?.total_receipt_quantity || 0)],
//     ['Tổng xuất', Number(report?.summary?.total_issue_quantity || 0)],
//     ['Chênh lệch ròng', Number(report?.summary?.net_quantity || 0)],
//   ];

//   const ws = XLSX.utils.aoa_to_sheet(data);

//   ws['!merges'] = [XLSX.utils.decode_range('A1:B1')];
//   ws['!cols'] = [{ wch: 28 }, { wch: 24 }];

//   applyStyle(ws, 'A1:B1', TITLE_STYLE);
//   applyStyle(ws, 'A3:B4', CELL_STYLE);
//   applyStyle(ws, 'A6:B9', CELL_STYLE);
//   applyStyle(ws, 'A6:B6', HEADER_STYLE);
//   applyStyle(ws, 'A7:A9', LABEL_STYLE);
//   applyStyle(ws, 'B7:B9', NUMBER_STYLE);

//   return ws;
// }

// function buildReceiptsSheet(report) {
//   const rows = [
//     ['LỊCH SỬ NHẬP', '', ''],
//     ['', '', ''],
//     ['Ngày', 'Số lượng', 'Giá trị'],
//     ...(report?.receipts_by_date || []).map((row) => [
//       row.date || '',
//       Number(row.total_quantity || 0),
//       Number(row.total_amount || 0),
//     ]),
//   ];

//   const ws = XLSX.utils.aoa_to_sheet(rows);
//   const lastRow = rows.length;

//   ws['!merges'] = [XLSX.utils.decode_range('A1:C1')];
//   ws['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }];

//   applyStyle(ws, 'A1:C1', TITLE_STYLE);
//   applyStyle(ws, `A3:C${lastRow}`, CELL_STYLE);
//   applyStyle(ws, 'A3:C3', HEADER_STYLE);

//   if (lastRow >= 4) {
//     applyStyle(ws, `B4:B${lastRow}`, NUMBER_STYLE);
//     applyStyle(ws, `C4:C${lastRow}`, MONEY_STYLE);
//   }

//   return ws;
// }

// function buildIssuesSheet(report) {
//   const rows = [
//     ['LỊCH SỬ XUẤT', '', ''],
//     ['', '', ''],
//     ['Ngày', 'Số lượng', 'Giá trị'],
//     ...(report?.issues_by_date || []).map((row) => [
//       row.date || '',
//       Number(row.total_quantity || 0),
//       Number(row.total_amount || 0),
//     ]),
//   ];

//   const ws = XLSX.utils.aoa_to_sheet(rows);
//   const lastRow = rows.length;

//   ws['!merges'] = [XLSX.utils.decode_range('A1:C1')];
//   ws['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }];

//   applyStyle(ws, 'A1:C1', TITLE_STYLE);
//   applyStyle(ws, `A3:C${lastRow}`, CELL_STYLE);
//   applyStyle(ws, 'A3:C3', HEADER_STYLE);

//   if (lastRow >= 4) {
//     applyStyle(ws, `B4:B${lastRow}`, NUMBER_STYLE);
//     applyStyle(ws, `C4:C${lastRow}`, MONEY_STYLE);
//   }

//   return ws;
// }

// export function exportInOutReportToExcel(report, filters, warehouses = []) {
//   const wb = XLSX.utils.book_new();

//   const summarySheet = buildSummarySheet(report, filters, warehouses);
//   const receiptsSheet = buildReceiptsSheet(report);
//   const issuesSheet = buildIssuesSheet(report);

//   XLSX.utils.book_append_sheet(wb, summarySheet, 'Tong hop');
//   XLSX.utils.book_append_sheet(wb, receiptsSheet, 'Lich su nhap');
//   XLSX.utils.book_append_sheet(wb, issuesSheet, 'Lich su xuat');

//   const fileName = `bao-cao-nhap-xuat-${filters.from_date || 'all'}-${filters.to_date || 'all'}.xlsx`;
//   XLSX.writeFile(wb, fileName);
// }

import * as XLSX from "xlsx-js-style";

function formatDateRange(fromDate, toDate) {
  if (fromDate && toDate) return `${fromDate} đến ${toDate}`;
  if (fromDate) return `Từ ${fromDate}`;
  if (toDate) return `Đến ${toDate}`;
  return "Toàn thời gian";
}

const BORDER_ALL = {
  top: { style: "medium", color: { rgb: "000000" } },
  bottom: { style: "medium", color: { rgb: "000000" } },
  left: { style: "medium", color: { rgb: "000000" } },
  right: { style: "medium", color: { rgb: "000000" } },
};

const TITLE_STYLE = {
  font: { bold: true, sz: 14 },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_ALL,
};

const HEADER_STYLE = {
  font: { bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_ALL,
};

const CELL_STYLE = {
  alignment: { vertical: "center" },
  border: BORDER_ALL,
};

const LABEL_STYLE = {
  font: { bold: true },
  alignment: { vertical: "center" },
  border: BORDER_ALL,
};

const NUMBER_STYLE = {
  alignment: { horizontal: "right", vertical: "center" },
  border: BORDER_ALL,
  numFmt: "#,##0",
};

const MONEY_STYLE = {
  alignment: { horizontal: "right", vertical: "center" },
  border: BORDER_ALL,
  numFmt: "#,##0",
};

function toInteger(value) {
  const parsed = Number(value || 0);

  if (Number.isNaN(parsed)) return 0;

  return Math.round(parsed);
}

function applyStyle(ws, range, style) {
  const decoded = XLSX.utils.decode_range(range);

  for (let r = decoded.s.r; r <= decoded.e.r; r += 1) {
    for (let c = decoded.s.c; c <= decoded.e.c; c += 1) {
      const cellRef = XLSX.utils.encode_cell({ r, c });

      if (!ws[cellRef]) {
        ws[cellRef] = { t: "s", v: "" };
      }

      ws[cellRef].s = {
        ...(ws[cellRef].s || {}),
        ...style,
        border: style.border || ws[cellRef].s?.border,
        alignment: style.alignment || ws[cellRef].s?.alignment,
        font: style.font || ws[cellRef].s?.font,
        fill: style.fill || ws[cellRef].s?.fill,
        numFmt: style.numFmt || ws[cellRef].s?.numFmt,
      };
    }
  }
}

function buildSummarySheet(report, filters, warehouses) {
  const warehouseName =
    warehouses.find((w) => String(w.id) === String(filters.warehouse_id))
      ?.name || "Tất cả";

  const data = [
    ["BÁO CÁO NHẬP - XUẤT THEO THỜI GIAN", ""],
    ["", ""],
    ["Khoảng thời gian", formatDateRange(filters.from_date, filters.to_date)],
    ["Kho", warehouseName],
    ["", ""],
    ["Chỉ tiêu", "Giá trị"],
    ["Tổng nhập", toInteger(report?.summary?.total_receipt_quantity)],
    ["Tổng xuất", toInteger(report?.summary?.total_issue_quantity)],
    ["Chênh lệch ròng", toInteger(report?.summary?.net_quantity)],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!merges"] = [XLSX.utils.decode_range("A1:B1")];
  ws["!cols"] = [{ wch: 28 }, { wch: 24 }];

  applyStyle(ws, "A1:B1", TITLE_STYLE);
  applyStyle(ws, "A3:B4", CELL_STYLE);
  applyStyle(ws, "A6:B9", CELL_STYLE);
  applyStyle(ws, "A6:B6", HEADER_STYLE);
  applyStyle(ws, "A7:A9", LABEL_STYLE);
  applyStyle(ws, "B7:B9", NUMBER_STYLE);

  return ws;
}

function buildReceiptsSheet(report) {
  const rows = [
    ["LỊCH SỬ NHẬP", "", ""],
    ["", "", ""],
    ["Ngày", "Số lượng", "Giá trị"],
    ...(report?.receipts_by_date || []).map((row) => [
      row.date || "",
      toInteger(row.total_quantity),
      toInteger(row.total_amount),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const lastRow = rows.length;

  ws["!merges"] = [XLSX.utils.decode_range("A1:C1")];
  ws["!cols"] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }];

  applyStyle(ws, "A1:C1", TITLE_STYLE);
  applyStyle(ws, `A3:C${lastRow}`, CELL_STYLE);
  applyStyle(ws, "A3:C3", HEADER_STYLE);

  if (lastRow >= 4) {
    applyStyle(ws, `B4:B${lastRow}`, NUMBER_STYLE);
    applyStyle(ws, `C4:C${lastRow}`, MONEY_STYLE);
  }

  return ws;
}

function buildIssuesSheet(report) {
  const rows = [
    ["LỊCH SỬ XUẤT", "", ""],
    ["", "", ""],
    ["Ngày", "Số lượng", "Giá trị"],
    ...(report?.issues_by_date || []).map((row) => [
      row.date || "",
      toInteger(row.total_quantity),
      toInteger(row.total_amount),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const lastRow = rows.length;

  ws["!merges"] = [XLSX.utils.decode_range("A1:C1")];
  ws["!cols"] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }];

  applyStyle(ws, "A1:C1", TITLE_STYLE);
  applyStyle(ws, `A3:C${lastRow}`, CELL_STYLE);
  applyStyle(ws, "A3:C3", HEADER_STYLE);

  if (lastRow >= 4) {
    applyStyle(ws, `B4:B${lastRow}`, NUMBER_STYLE);
    applyStyle(ws, `C4:C${lastRow}`, MONEY_STYLE);
  }

  return ws;
}

export function exportInOutReportToExcel(report, filters, warehouses = []) {
  const wb = XLSX.utils.book_new();

  const summarySheet = buildSummarySheet(report, filters, warehouses);
  const receiptsSheet = buildReceiptsSheet(report);
  const issuesSheet = buildIssuesSheet(report);

  XLSX.utils.book_append_sheet(wb, summarySheet, "Tong hop");
  XLSX.utils.book_append_sheet(wb, receiptsSheet, "Lich su nhap");
  XLSX.utils.book_append_sheet(wb, issuesSheet, "Lich su xuat");

  const fileName = `bao-cao-nhap-xuat-${filters.from_date || "all"}-${filters.to_date || "all"}.xlsx`;
  XLSX.writeFile(wb, fileName);
}