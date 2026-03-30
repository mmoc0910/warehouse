import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
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

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const thinBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

function p(text = "", options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: String(text),
        ...options,
      }),
    ],
    spacing: { after: 80 },
  });
}

function cell(text, options = {}) {
  return new TableCell({
    children: [
      new Paragraph({
        alignment: options.alignment || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text == null ? "" : String(text),
            bold: options.bold || false,
            size: options.size || 22,
          }),
        ],
        spacing: { before: 60, after: 60 },
      }),
    ],
    verticalAlign: VerticalAlign.CENTER,
    borders: options.borders || thinBorder,
    columnSpan: options.columnSpan,
    rowSpan: options.rowSpan,
    width: options.width
      ? { size: options.width, type: WidthType.DXA }
      : undefined,
  });
}

function formatMoney(value) {
  const num = Number(value || 0);
  return num.toLocaleString("vi-VN");
}

function formatQty(value) {
  const num = Number(value || 0);
  return num.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

function buildInfoLine(label, value = "") {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label} `, bold: false, size: 24 }),
      new TextRun({ text: value || "................................................", size: 24 }),
    ],
    spacing: { after: 120 },
  });
}

function buildMainTable(detail) {
  const items = detail?.items || [];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("STT", { bold: true, alignment: AlignmentType.CENTER, width: 700 }),
          cell("Tên, nhãn hiệu, quy cách phẩm chất vật tư, dụng cụ, sản phẩm, hàng hoá", {
            bold: true,
            alignment: AlignmentType.CENTER,
            width: 4200,
          }),
          cell("Mã số", { bold: true, alignment: AlignmentType.CENTER, width: 1100 }),
          cell("Đơn vị tính", { bold: true, alignment: AlignmentType.CENTER, width: 1000 }),
          cell("Số lượng", { bold: true, alignment: AlignmentType.CENTER, width: 1500, columnSpan: 2 }),
          cell("Đơn giá", { bold: true, alignment: AlignmentType.CENTER, width: 1400 }),
          cell("Thành tiền", { bold: true, alignment: AlignmentType.CENTER, width: 1700 }),
        ],
      }),
    //   new TableRow({
    //     tableHeader: true,
    //     children: [
    //       cell("A", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("B", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("C", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("D", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("1", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("2", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("3", { bold: true, alignment: AlignmentType.CENTER }),
    //       cell("4", { bold: true, alignment: AlignmentType.CENTER }),
    //     ],
    //   }),
      ...items.map((item, index) => {
        const qty = Number(item.quantity || 0);
        const unitCost = Number(item.unit_cost || 0);
        const lineTotal = Number(item.line_total || qty * unitCost);

        return new TableRow({
          children: [
            cell(index + 1, { alignment: AlignmentType.CENTER }),
            cell(`${item.product?.name || ""}`),
            cell(item.product?.code || "", { alignment: AlignmentType.CENTER }),
            cell(item.product?.unit || "", { alignment: AlignmentType.CENTER }),
            cell(formatQty(qty), { alignment: AlignmentType.CENTER }),
            cell(formatQty(qty), { alignment: AlignmentType.CENTER }), // thực xuất / thực nhập
            cell(formatMoney(unitCost), { alignment: AlignmentType.RIGHT }),
            cell(formatMoney(lineTotal), { alignment: AlignmentType.RIGHT }),
          ],
        });
      }),
      new TableRow({
        children: [
          cell("Tổng cộng", {
            bold: true,
            alignment: AlignmentType.CENTER,
            columnSpan: 7,
          }),
          cell(formatMoney(detail?.total_amount || 0), {
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
    ],
  });
}

export async function exportStockReceiptToWord(detail) {
  const today = new Date(detail?.receipt_date || new Date());
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const doc = new Document({
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
        headers: {
          default: new Header({
            children: [new Paragraph({ text: "" })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({ text: "" })],
          }),
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorder,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      p("Đơn vị: ................................", { bold: true, size: 24 }),
                      p("Bộ phận: ..............................", { bold: true, size: 24 }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorder,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Mẫu số 02 - VT", bold: true, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "(Ban hành theo Thông tư số 200/2014/TT-BTC",
                            italics: true,
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Ngày 22/12/2014 của Bộ Tài chính)",
                            italics: true,
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 120 },
            children: [
              new TextRun({
                text: "PHIẾU NHẬP KHO",
                bold: true,
                size: 30,
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorder,
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: `Ngày ${dd} tháng ${mm} năm ${yyyy}`,
                            italics: true,
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: `Số: ${detail?.code || "........................"}`,
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorder,
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Nợ: ............................", size: 24 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Có: .............................", size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),

          buildInfoLine("- Họ và tên người giao hàng:", detail?.creator?.name || ""),
          buildInfoLine("- Theo:", detail?.note || ""),
          buildInfoLine("- Nhập tại kho:", detail?.warehouse?.name || ""),
          buildInfoLine("- Địa điểm:", detail?.warehouse?.address || ""),

          new Paragraph({ text: "", spacing: { after: 120 } }),

          buildMainTable(detail),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Người lập phiếu", bold: true, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "(Ký, họ tên)", italics: true, size: 22 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Người giao hàng", bold: true, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "(Ký, họ tên)", italics: true, size: 22 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Thủ kho", bold: true, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "(Ký, họ tên)", italics: true, size: 22 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `phieu-nhap-kho-${detail?.code || Date.now()}.docx`;
  saveAs(blob, fileName);
}