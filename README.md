# Bếp Nhà — Digital Menu

Ứng dụng thực đơn điện tử cho **Bếp Nhà**, giúp khách xem món, tìm kiếm theo tên, chọn món và size, quản lý giỏ hàng rồi tạo bill thanh toán. Giao diện hỗ trợ máy tính và điện thoại, có tiếng Việt, tiếng Anh, tiếng Nhật cùng giao diện sáng/tối.

Ứng dụng hiện chạy hoàn toàn ở phía trình duyệt, không cần backend. Menu và thông tin chủ quán được cấu hình trong mã nguồn; giỏ hàng chỉ tồn tại trong phiên đang mở. Chức năng đặt món tạo bill để khách xác nhận và thanh toán qua mã VietQR/Zalo, chưa gửi đơn đến máy chủ hay xử lý giao dịch trực tuyến.

## Chức năng

- **Duyệt thực đơn:** xem danh sách món, ảnh, mô tả, giá, khuyến mãi và thông tin chi tiết.
- **Lọc và tìm kiếm:** lọc món theo danh mục, tìm theo tên hoặc mô tả.
- **Chọn món và size:** xem chi tiết, chọn size và số lượng trước khi thêm vào giỏ.
- **Quản lý giỏ hàng:** thay đổi số lượng, xem tạm tính và tổng tiền.
- **Tạo bill:** hiển thị món, size, số lượng, đơn giá, thành tiền, tổng cộng và thông tin thanh toán VietQR/Zalo.
- **Tải DOCX:** điền dữ liệu đơn hàng vào mẫu DOCX ngay trên trình duyệt.
- **Xuất PDF từ DOCX:** render DOCX đã điền và mở hộp thoại in của trình duyệt. Chọn **Lưu dưới dạng PDF** để lưu file; ứng dụng không cần backend để thực hiện bước này.
- **Tải mẫu DOCX:** tải mẫu trống để chỉnh sửa bằng Word.
- **Đa ngôn ngữ:** giao diện tiếng Việt, English và 日本語.
- **Giao diện:** hỗ trợ sáng/tối và bố cục thích ứng với màn hình nhỏ.

## Công nghệ

- React 19 và TypeScript
- Vite 7
- Tailwind CSS 4
- `docxtemplater` và `pizzip` để điền biến vào DOCX
- `docx-preview` để render DOCX trong trình duyệt trước khi xuất PDF
- `docx` để tạo file mẫu DOCX

## Yêu cầu

- Node.js 20 trở lên (khuyến nghị)
- npm

## Cài đặt và chạy

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal để sử dụng ứng dụng.

## Quy trình tạo bill và PDF

1. Thêm món vào giỏ, chọn **Đặt món** để mở bill.
2. Chọn **Tải hóa đơn DOCX** để tải DOCX đã được điền thông tin đơn hàng.
3. Hoặc chọn **Xuất PDF từ DOCX** để mở hộp thoại in của trình duyệt.
4. Trong hộp thoại in, chọn máy in PDF hoặc **Lưu dưới dạng PDF**.

PDF được tạo từ chính mẫu DOCX đã điền, không phải từ bản xem trước HTML. Kích thước và bố cục in được khai báo trong mẫu; trình duyệt có thể áp dụng thêm thiết lập khổ giấy, lề hoặc tỷ lệ in của người dùng.

## Mẫu DOCX và biến

Mẫu dùng trong ứng dụng nằm tại [`public/receipt-template.docx`](./public/receipt-template.docx). Mẫu sử dụng cú pháp của Docxtemplater, ví dụ:

| Biến | Dữ liệu |
| --- | --- |
| `{storeName}` | Tên quán |
| `{receiptTitle}` | Tiêu đề bill |
| `{date}` | Ngày giờ tạo bill |
| `{itemNumberLabel}`, `{itemNameLabel}` | Nhãn cột STT và tên món |
| `{quantityLabel}`, `{unitPriceLabel}`, `{lineTotalLabel}` | Nhãn số lượng, đơn giá và thành tiền |
| `{totalLabel}`, `{total}` | Nhãn và giá trị tổng cộng |
| `{paymentTitle}`, `{scanToPay}` | Tiêu đề và hướng dẫn thanh toán |
| `{ownerName}`, `{ownerAddress}`, `{zalo}` | Thông tin liên hệ của chủ quán |
| `{#items}...{/items}` | Vùng lặp một lần cho mỗi món trong đơn |
| `{number}`, `{name}`, `{quantity}` | STT, tên và số lượng của một món |
| `{unitPrice}`, `{lineTotal}` | Đơn giá và thành tiền của một món |

Khi chỉnh mẫu trong Word, cần giữ nguyên tên biến và cặp thẻ lặp món để ứng dụng có thể điền dữ liệu. Nếu thay đổi mã tạo mẫu [`scripts/create-receipt-template.mjs`](./scripts/create-receipt-template.mjs), tạo lại file DOCX bằng:

```bash
npm run create:receipt-template
```

Mẫu được tạo với QR thanh toán lấy từ [`public/payment-qr.png`](./public/payment-qr.png).

## Cấu trúc dự án

```text
public/
  payment-qr.png             Mã QR thanh toán
  receipt-template.docx      Mẫu DOCX có biến để tạo bill
scripts/
  create-receipt-template.mjs Mã tạo mẫu DOCX
src/
  components/ui/             Thành phần giao diện dùng chung
  data/menu.ts               Danh mục và dữ liệu món
  features/menu/             Thẻ món và cửa sổ chi tiết món
  utils/order-document.ts    Điền mẫu DOCX và render để in PDF
  utils/localization.ts      Dịch dữ liệu món ăn
  i18n.ts                    Nội dung giao diện và định dạng tiền
  App.tsx                    Luồng menu, giỏ hàng và bill
  index.css                  Kiểu giao diện
```

## Lệnh phát triển

```bash
npm run dev                   # Chạy máy chủ phát triển
npm run build                 # Kiểm tra TypeScript và tạo bản production
npm run lint                  # Chạy ESLint
npm run preview               # Xem thử bản production
npm run create:receipt-template # Tạo lại mẫu DOCX
```

## Giới hạn hiện tại

- Menu, QR thanh toán và thông tin liên hệ là dữ liệu tĩnh trong dự án.
- Giỏ hàng không được lưu khi tải lại trang hoặc đóng trình duyệt.
- Đơn hàng chưa được gửi/lưu ở hệ thống quản trị; chủ quán xác nhận đơn qua thông tin bill.
- PDF được lưu thông qua hộp thoại in của trình duyệt. Kết quả có thể khác đôi chút tùy trình duyệt và thiết lập in.
