# Frontend Instructions

Đây là project frontend của Pocket Ledger.

Trước khi sửa các task liên quan đến API hoặc dữ liệu:
- Luôn đọc tài liệu task trong `../docs`.
- Nếu task liên quan màn hình thống kê giao dịch, đọc file:
  `../docs/TASK_TRANSACTION_SUMMARY.md`

Nguyên tắc:
- Không get all transactions nếu backend đã có API filter.
- Không tự tổng hợp dữ liệu lớn ở frontend nếu backend có thể tổng hợp.
- Giữ UI/UX hiện tại nếu user đã xác nhận frontend đúng ý.
- Khi cần field hoặc API mới từ backend, ghi rõ endpoint, params và response mong muốn vào docs.