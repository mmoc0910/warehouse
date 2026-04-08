import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const THIN_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

function money(value) {
  return Number(value || 0).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function qty(value) {
  return Number(value || 0).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

function parseDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function lineParagraph(text = "", options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: options.spacing || { after: 80 },
    border: undefined,
    children: [
      new TextRun({
        text: String(text),
        bold: !!options.bold,
        italics: !!options.italics,
        size: options.size || 24,
      }),
    ],
  });
}

function infoLine(label, value = "") {
  return new Paragraph({
    spacing: { after: 120 },
    border: undefined,
    children: [
      new TextRun({
        text: `${label} `,
        size: 24,
      }),
      new TextRun({
        text:
          value ||
          "..............................................................",
        size: 24,
      }),
    ],
  });
}

function cellText(text = "", options = {}) {
  return new TableCell({
    borders: options.borders || THIN_BORDER,
    width: options.width
      ? { size: options.width, type: WidthType.DXA }
      : undefined,
    columnSpan: options.columnSpan,
    rowSpan: options.rowSpan,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: { before: 50, after: 50 },
        border: undefined,
        children: [
          new TextRun({
            text: text == null ? "" : String(text),
            bold: !!options.bold,
            italics: !!options.italics,
            size: options.size || 22,
          }),
        ],
      }),
    ],
  });
}

function buildHeaderTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDER,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              lineParagraph("Đơn vị: Công ty Thương mại điện tử", {
                bold: true,
                size: 24,
              }),
              lineParagraph("Bộ phận: Kho hàng", {
                bold: true,
                size: 24,
                spacing: { after: 0 },
              }),
            ],
          }),
          new TableCell({
            borders: NO_BORDER,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              lineParagraph("(Ban hành theo Thông tư số 200/2014/TT-BTC", {
                italics: true,
                size: 22,
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
              }),
              lineParagraph("Ngày 22/12/2014 của Bộ Tài chính)", {
                italics: true,
                size: 22,
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildMetaTable(detail) {
  const d = parseDate(detail?.issue_date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDER,
            width: { size: 60, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                border: undefined,
                children: [
                  new TextRun({
                    text: `Ngày ${day} tháng ${month} năm ${year}`,
                    italics: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
                border: undefined,
                children: [
                  new TextRun({
                    text: `Số: ${detail?.code || "............................"}`,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: NO_BORDER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [
              lineParagraph("Nợ ............................", { size: 24 }),
              lineParagraph("Có .............................", {
                size: 24,
                spacing: { after: 0 },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildItemsTable(detail) {
  const items = detail?.items || [];

  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        cellText("S\nT\nT", {
          bold: true,
          alignment: AlignmentType.CENTER,
          width: 700,
        }),
        cellText(
          "Sản phẩm",
          {
            bold: true,
            alignment: AlignmentType.CENTER,
            width: 4300,
          },
        ),
        cellText("Mã số", {
          bold: true,
          alignment: AlignmentType.CENTER,
          width: 1000,
        }),
        cellText("Đơn vị tính", {
          bold: true,
          alignment: AlignmentType.CENTER,
          width: 1000,
        }),
        cellText("Số lượng", {
          bold: true,
          alignment: AlignmentType.CENTER,
          // columnSpan: 2,
          width: 1600,
        }),
        cellText("Đơn giá", {
          bold: true,
          alignment: AlignmentType.CENTER,
          width: 1300,
        }),
        cellText("Thành tiền", {
          bold: true,
          alignment: AlignmentType.CENTER,
          width: 1600,
        }),
      ],
    }),
  ];

  items.forEach((item, index) => {
    const quantity = Number(item?.quantity || 0);
    const unitPrice = Number(item?.unit_price || 0);
    const lineTotal = Number(item?.line_total || quantity * unitPrice);

    rows.push(
      new TableRow({
        children: [
          cellText(index + 1, { alignment: AlignmentType.CENTER }),
          cellText(item?.product?.name || ""),
          cellText(item?.product?.code || "", {
            alignment: AlignmentType.CENTER,
          }),
          cellText(item?.product?.unit || "", {
            alignment: AlignmentType.CENTER,
          }),
          cellText(qty(quantity), { alignment: AlignmentType.CENTER }),
          // cellText(qty(quantity), { alignment: AlignmentType.CENTER }),
          cellText(money(unitPrice), { alignment: AlignmentType.RIGHT }),
          cellText(money(lineTotal), { alignment: AlignmentType.RIGHT }),
        ],
      }),
    );
  });

  rows.push(
    new TableRow({
      children: [
        cellText("Tổng cộng", {
          bold: true,
          alignment: AlignmentType.CENTER,
          columnSpan: 6,
        }),
        cellText(money(detail?.total_amount || 0), {
          bold: true,
          alignment: AlignmentType.RIGHT,
        }),
      ],
    }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function buildSignatureCell(title) {
  return new TableCell({
    borders: NO_BORDER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        border: undefined,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 900 },
        border: undefined,
        children: [
          new TextRun({
            text: "(Ký, họ tên)",
            italics: true,
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        border: undefined,
        children: [
          new TextRun({
            text: "",
            bold: true,
            size: 22,
          }),
        ],
      }),
    ],
  });
}

function buildSignatureTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      new TableRow({
        children: [
          buildSignatureCell("Người lập phiếu"),
          buildSignatureCell("Người giao hàng"),
          buildSignatureCell("Người nhận hàng"),
          buildSignatureCell("Thủ kho"),
        ],
      }),
    ],
  });
}

export async function exportStockIssueToWord(detail) {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24,
          },
          paragraph: {
            spacing: {
              after: 0,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900,
            },
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
          },
        },
        children: [
          buildHeaderTable(),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 120 },
            border: undefined,
            children: [
              new TextRun({
                text: "PHIẾU XUẤT KHO",
                bold: true,
                size: 30,
              }),
            ],
          }),

          buildMetaTable(detail),

          new Paragraph({
            spacing: { after: 120 },
            border: undefined,
            children: [],
          }),

          infoLine(
            "- Họ và tên người giao hàng:",
            detail?.delivery_full_name || "",
          ),
          infoLine(
            "- Họ và tên người nhận hàng:",
            detail?.receiver_full_name || "",
          ),
          infoLine("- Lý do xuất kho:", detail?.note || ""),
          infoLine("- Xuất tại kho (ngăn lô):", detail?.warehouse?.name || ""),
          infoLine("- Địa điểm:", detail?.warehouse?.address || ""),

          new Paragraph({
            spacing: { after: 120 },
            border: undefined,
            children: [],
          }),

          buildItemsTable(detail),

          new Paragraph({
            spacing: { after: 220 },
            border: undefined,
            children: [],
          }),

          buildSignatureTable(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `phieu-xuat-kho-${detail?.code || Date.now()}.docx`;
  saveAs(blob, fileName);
}
