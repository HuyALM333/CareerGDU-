# CareerGDU

CareerGDU – Hệ thống quản lý nghề nghiệp trên nền tảng web dành cho sinh viên GDU, nhà tuyển dụng và quản trị viên. Hệ thống hỗ trợ đăng tin tuyển dụng, quản lý ứng tuyển, quy trình phê duyệt, gửi email thông báo và xác thực OTP.

## Các cập nhật gần đây (Tháng 05/2026)

* Đã bổ sung và cập nhật dữ liệu cho các trường thời gian của bài tuyển dụng (`approvedAt`, `publishAt`, `expiredAt`) thông qua script SQL.
* Cập nhật logic hiển thị việc làm công khai:

  * Bài tuyển dụng đã xuất bản sẽ hiển thị ngay lập tức.
  * Bài đã hết hạn vẫn tiếp tục hiển thị thêm 7 ngày.
  * Sau 7 ngày kể từ khi hết hạn, bài tuyển dụng sẽ tự động bị ẩn.
* Đồng bộ trạng thái và nhãn hiển thị công việc giữa trang chủ và trang danh sách việc làm (phân biệt rõ “Hết hạn” và “Đã đủ số lượng”), đồng thời ẩn nút ứng tuyển khi tuyển đủ.
* Đã sửa bộ lọc mức lương:

  * Giá trị “Thỏa thuận” sẽ không còn bị tính vào các khoảng lương số.
  * Xử lý riêng cho trường hợp lương thỏa thuận.
* Form chỉnh sửa bài tuyển dụng hiện đã giữ lại được các trường tùy chỉnh (ví dụ: “Other”) và bổ sung trường “HR”.
* Đã sửa lỗi đăng bài tuyển dụng phía Admin khi sử dụng tính năng lên lịch (`publishAt`).

## Các file đã chỉnh sửa

* prisma/schema.prisma
* scripts/db/add-job-scheduling.sql
* scripts/db/README.md
* src/app/api/jobs/route.ts
* src/app/api/jobs/[id]/route.ts
* src/app/api/jobs/[id]/status/route.ts
* src/app/jobs/page.tsx
* src/lib/data-service.ts
* src/components/jobs/jobs-list-client.tsx
* src/components/jobs/apply-button.tsx
* src/components/home/featured-jobs.tsx
