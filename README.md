# Warehouse Management Frontend

Project ReactJS dùng Vite để làm giao diện cho hệ thống quản lý kho Laravel API.

## Chức năng

- Đăng nhập / đăng xuất bằng Sanctum token
- Quản lý kho
- Quản lý nhóm hàng
- Quản lý sản phẩm và xem tồn kho theo từng kho
- Lập phiếu nhập kho
- Lập phiếu xuất kho
- Lập phiếu điều chuyển kho
- Lập biên bản kiểm kê
- Quản lý người dùng và phân quyền
- Báo cáo tồn theo kho
- Báo cáo nhập xuất theo thời gian
- Báo cáo hàng sắp hết
- Báo cáo hàng tồn lâu

## Cài đặt

```bash
npm install
cp .env.example .env
npm run dev
```

## Biến môi trường

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Lưu ý tích hợp backend

- Backend cần bật CORS cho domain frontend.
- Các route cần xác thực phải trả `401` chuẩn khi token hết hạn.
- Form nhập/xuất/chuyển/kiểm kê đã bám theo payload thực tế của controller Laravel.
- Các trang danh sách dùng paginator JSON chuẩn của Laravel.
