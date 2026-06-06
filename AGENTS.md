# Frontend Instructions

Day la project frontend cua Pocket Ledger.

Truoc khi sua cac task lien quan den API hoac du lieu:
- Luon doc tai lieu task trong `../docs`.
- Neu task lien quan man hinh thong ke giao dich, doc `../docs/TASK_TRANSACTION_SUMMARY.md`.
- Neu task lien quan tab thong ke/phan tich tieu dung hoac app shell, doc `../docs/TASK_ANALYTICS_APP_SHELL.md`.

Nguyen tac:
- Khong get all transactions neu backend da co API filter.
- Khong tu tong hop du lieu lon o frontend neu backend co the tong hop.
- Giu UI/UX hien tai neu user da xac nhan frontend dung y.
- Khi can field hoac API moi tu backend, ghi ro endpoint, params va response mong muon vao docs.

Analytics/app shell:
- `/` la man hinh giao dich hien tai.
- `/analytics` la man hinh thong ke va phan tich tieu dung.
- Man hinh `/analytics` phai dung API analytics cua backend, khong get all transactions de tong hop.
- Filter analytics dung contract backend, gom `date_from`, `date_to`, `transaction_type` va `category_key` khi can.
