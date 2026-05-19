## ☕ PR: \[Feature/Fix/Chore\] - \[Tên ngắn gọn\]

### 📌 Mục tiêu

Mô tả ngắn gọn PR này làm gì và vì sao cần. - Role/Flow liên 
quan: \[Admin/Employer/Student/Guest] - Link issue/task (nếu có): \#

------------------------------------------------------------------------

## \### ✅ Thay đổi chính

-   
-   

------------------------------------------------------------------------

### 🧩 Phạm vi ảnh hưởng

**UI** - \[ \] Pages / App routes - \[ \] Components - \[ \] Styles
(Tailwind/CSS) - \[ \] i18n / SEO / Metadata

**API / Data** - \[ \] API route / server action - \[ \] Validation
(zod/yup/...) - \[ \] DB/Prisma/Migration - \[ \] Auth/Role/Permission

------------------------------------------------------------------------

### 🧱 Files/Modules chính

-   `app/...`
-   `components/...`
-   `lib/...`
-   `services/...`
-   `prisma/...` (nếu có)

------------------------------------------------------------------------

### 🛠️ Cách kiểm tra (How to Test)

1.  `npm install`

2.  `npm run dev`

3.  Truy cập: `/...`

4.  ## Các bước thao tác:

    -   

**API test (nếu có)** - Endpoint: `GET/POST /api/...` - Headers/Auth:
`Bearer <token>` (nếu cần) - Body mẫu:

``` json
{}
```

------------------------------------------------------------------------

### 🧪 Test Cases

-   [ ] ✅ Case 1:
-   [ ] ✅ Case 2:
-   [ ] ❌ Negative case:

------------------------------------------------------------------------

### 🔍 Notes / Risk

-   Breaking change? \[Yes/No\] - nếu Yes, mô tả migration/ảnh hưởng.
-   Trade-off / giới hạn hiện tại:
-   Follow-up (việc làm sau):

------------------------------------------------------------------------

### ☑️ Checklist

-   [ ] Đã tự test local đầy đủ (happy path + lỗi cơ bản)
-   [ ] Không còn lỗi console / warning
-   [ ] Không để lại code debug / log thừa
-   [ ] UI responsive (nếu có)
-   [ ] Cập nhật env/docs nếu có thay đổi cấu hình
-   [ ] Nếu có auth/role: đã kiểm tra đúng quyền truy cập
