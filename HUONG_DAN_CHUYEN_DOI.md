# Hướng dẫn Chuyển đổi Dữ liệu Thủ công (MongoDB → MySQL)

Tài liệu này hướng dẫn cách thực hiện di chuyển dữ liệu (migration) từ MongoDB sang MySQL bằng tay, tập trung vào các câu lệnh thực tế và những lưu ý kỹ thuật quan trọng.

---

## 1. Chuẩn bị (Setup)

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:
- **MongoDB Database Tools:** Để có lệnh `mongoexport`.
- **MySQL Server:** Đã chạy và có database rỗng (vd: `gdu_career`).
- **Node.js:** Để chạy các script Prisma.

---

## 2. Quy trình thực hiện (Workflow)

Quy trình chuẩn gồm 5 bước:
1. **Trích xuất (Export):** Lấy dữ liệu từ MongoDB ra file JSON.
2. **Làm sạch (Cleanup):** Loại bỏ các định dạng đặc biệt của MongoDB ($oid, $date).
3. **Ánh xạ (Mapping):** Chuyển đổi kiểu dữ liệu sang tương ứng với MySQL/Prisma.
4. **Nạp dữ liệu (Import):** Chạy script để đẩy dữ liệu vào MySQL theo đúng thứ tự.
5. **Kiểm tra (Verify):** Đối chiếu số lượng bản ghi.

---

## 3. Các lệnh thực hiện (Commands)

### Bước 1: Trích xuất từ MongoDB
```bash
# Xuất một collection cụ thể ra file JSON
mongoexport --db=ten_database --collection=users --out=users.json --jsonArray
```

### Bước 2: Nạp dữ liệu vào MySQL thông qua Prisma
Vì MySQL có ràng buộc khóa ngoại (Foreign Key), ta dùng script `Prisma` để đảm bảo logic.

Lệnh chạy script di chuyển (nếu bạn đã soạn file di chuyển):
```bash
npx tsx scripts/restore.ts
```

---

## 4. Ví dụ minh họa Chuyển đổi (Mapping Example)

Dưới đây là sự khác biệt trước và sau khi làm sạch dữ liệu để nạp vào MySQL:

| Trường (Field) | MongoDB (Trước) | MySQL (Sau) |
| :--- | :--- | :--- |
| **ID** | `"_id": { "$oid": "507f1f124b..." }` | `"id": "507f1f124b..."` |
| **Ngày tạo** | `"createdAt": { "$date": "2024-03-24T..." }` | `"createdAt": "2024-03-24T..."` |
| **Boolean** | `"isActive": true` (nhận trực tiếp) | `"isActive": true` (hoặc 1 trong SQL) |
| **JSON** | `"benefits": ["BHYT", "Du lịch"]` | `"benefits": "[\"BHYT\", \"Du lịch\"]"` (Lưu dưới dạng String) |

---

## 5. Thứ tự nạp dữ liệu (Import Order)

Trong MySQL, bạn **BẮT BUỘC** phải nạp theo thứ tự để không bị lỗi khóa ngoại (Foreign Key):

1. **Nhóm 1 (Bảng độc lập):** `Companies`, `News`, `HeroSlides`, `SiteConfigs`, `Visitors`, `DailyUpdates`.
2. **Nhóm 2 (Bảng gốc):** `Users`.
3. **Nhóm 3 (Bảng phụ thuộc cấp 1):** `Jobs` (cần `creatorId` từ `Users`), `UserReviews` (cần `userId` từ `Users`), `Contacts`.
4. **Nhóm 4 (Bảng phụ thuộc cấp 2):** `Applications` (cần `jobId` & `userId`), `SavedJobs`, `ReviewLikes`, `Notifications`.

---

## 6. Các lưu ý quan trọng (Caveats)

### 6.1. Xử lý ID
- Nếu dùng lại ID cũ của MongoDB (24 ký tự), hãy đảm bảo trường `id` trong Prisma là `String`.
- Nếu dùng `cuid()` mới, bạn phải cập nhật lại tất cả `jobId`, `userId` ở các bảng liên quan sao cho khớp với ID mới.

### 6.2. Kiểu dữ liệu (Data Types)
- **Chuỗi dài:** Nếu dữ liệu cũ rất dài (như CV Base64 hoặc nội dung News), hãy đảm bảo schema dùng `@db.Text` hoặc `@db.LongText`.
- **Lỗi phổ biến:** `Data too long for column '...'` -> Cách sửa: Tăng dung lượng cột trong database.

### 6.3. Kiểm tra dữ liệu
Sử dụng câu lệnh SQL sau để kiểm tra nhanh số lượng bản ghi đã nạp:
```sql
SELECT 'Users' as table_name, COUNT(*) FROM users
UNION
SELECT 'Jobs', COUNT(*) FROM jobs
UNION
SELECT 'Applications', COUNT(*) FROM applications;
```

---
*Tài liệu này được soạn thảo đầy đủ cho mục đích giảng dạy và bàn giao hệ thống.*
