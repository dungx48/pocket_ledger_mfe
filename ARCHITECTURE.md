# Kiến Trúc Chi Tiết

Tài liệu này mô tả kiến trúc hiện tại của ứng dụng theo code đang chạy.

## 1. Luồng dữ liệu

### 1.1 Luồng xác thực

1. User mở app.
2. `app/page.tsx` gọi `getAuthToken()`.
3. Không có token => `router.push('/login')`.
4. Có token => load danh sách giao dịch.
5. Mọi API call thêm `Authorization: Bearer <token>` trong `lib/api.ts`.

### 1.2 Luồng danh mục

1. `CategoriesProvider` khởi tạo.
2. Đọc cache localStorage:
   - `app_categories`
   - `app_transaction_types`
3. Nếu cache rỗng => gọi `fetchCategories()` (`GET /categories`).
4. Parse tại `lib/categories.ts`:
   - `field_name === 'category_key'` => categories.
   - `field_name === 'transaction_type'` => transactionTypes.
5. Lưu lại cache và cấp dữ liệu qua context `useCategories()`.

### 1.3 Luồng dashboard

1. `app/page.tsx` load giao dịch theo trang: `listTransactions(skip, limit)`.
2. Trang đầu tải `PAGE_SIZE` bản ghi.
3. Nút `Xem thêm` nạp trang kế tiếp và append vào state.
4. Thống kê Thu/Chi/Số dư tính từ danh sách đang tải.

## 2. Data model app đang dùng

```ts
type Transaction = {
  id: string;
  amount: number; // VND
  date: string; // YYYY-MM-DD
  category_key: string;
  transaction_type: string; // ví dụ '1' = thu
  note?: string;
};

type TransactionCreate = {
  amount: number;
  date: string;
  category_key: string;
  transaction_type: string;
  note?: string;
};

type TransactionUpdate = Partial<TransactionCreate>;
```

Ghi chú:

- Một vài API cũ có thể còn `category_id`, UI hiện fallback hỗ trợ đọc cả `category_key` và `category_id` để tránh lỗi hiển thị.
- Quy tắc thu/chi hiện dùng `transaction_type` (không dùng `category_key`).

## 3. Thành phần chính

### 3.1 `app/page.tsx`

Trách nhiệm:

- Quản lý state dashboard.
- Gọi API CRUD giao dịch.
- Tính `totalIncome`, `totalExpense`, `balance`.
- Điều phối phân trang `Load more`.

State chính:

```ts
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(false);
const [offset, setOffset] = useState(0);
```

### 3.2 `app/categories-provider.tsx`

Trách nhiệm:

- Load categories + transaction types.
- Ưu tiên cache, fallback API, fallback mock data khi API lỗi.
- Cấp context `useCategories()` cho form/list.

### 3.3 `components/transaction-form.tsx`

Trách nhiệm:

- Thêm/sửa giao dịch.
- Validate cơ bản và submit payload đúng schema backend.

Field hiện tại:

- `amount` (nhập theo nghìn, có format dấu `.`).
- `date`.
- `transaction_type`.
- `category_key`.
- `note`.

Quy tắc số tiền:

- Người dùng nhập theo nghìn.
- Ví dụ nhập `1.234` => submit `1234000`.

### 3.4 `components/transaction-list.tsx`

Trách nhiệm:

- Render danh sách giao dịch gần đây.
- Hiển thị badge danh mục từ `categories` context (description từ localStorage/API).
- Dấu `+/-` theo `transaction_type`.
- Dòng mô tả dưới badge chỉ hiển thị ghi chú.

## 4. API layer

`lib/api.ts`:

- `setAuthToken`, `getAuthToken`, `clearAuthToken`.
- `login(username, password)`.
- `listTransactions(skip, limit)`.
- `createTransaction(data)`.
- `updateTransaction(id, data)`.
- `deleteTransaction(id)`.
- `fetchCategories()`.

Config base URL lấy từ `lib/config.ts` (`config.apiBaseUrl`), không hard-code trực tiếp trong component.

## 5. Common tasks

### 5.1 Thêm danh mục mới

Không sửa hard-code trong form.

Cách đúng:

1. Thêm record mới tại backend `/categories`.
2. Đảm bảo `field_name = 'category_key'`, `is_active = '1'`.
3. Reload app để provider fetch/cache lại.

### 5.2 Thêm loại giao dịch mới

1. Thêm record tại backend `/categories` với `field_name = 'transaction_type'`.
2. UI tự nhận trong select “Loại giao dịch”.
3. Nếu logic tổng thu/chi thay đổi, cập nhật hàm `isIncomeTransaction` trong:
   - `app/page.tsx`
   - `components/transaction-list.tsx`

### 5.3 Điều chỉnh pagination danh sách gần đây

`app/page.tsx`:

- đổi `PAGE_SIZE`.
- `hasMore = items.length === PAGE_SIZE`.
- UI dùng nút `Xem thêm`.

## 6. Performance notes

Hiện tại đã có:

- phân trang giao dịch (không tải toàn bộ records).
- cache categories trên localStorage.

Có thể nâng cấp tiếp:

- cursor pagination từ backend.
- SWR/React Query cho cache + revalidation.
- virtual list nếu số item render mỗi lần lớn.

## 7. Checklist khi sửa nghiệp vụ

- Có đang dùng đúng cặp field `category_key` + `transaction_type` không.
- Có còn logic cũ theo `category_id === 'income'` không.
- Số tiền có convert đúng từ đơn vị nghìn sang VND khi submit không.
- Danh mục hiển thị lấy từ provider/cache thay vì hard-code không.
- Sau thay đổi có cập nhật README/ARCHITECTURE tương ứng không.
