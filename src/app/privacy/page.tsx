"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 relative">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all group"
                        title="Quay lại"
                    >
                        <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chính sách bảo mật</h1>
                    <p className="text-gray-500 mb-8">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Cam kết bảo mật</h2>
                            <p>
                                Đại học Gia Định (GDU) cam kết bảo vệ sự riêng tư và thông tin cá nhân của tất cả người dùng (Sinh viên, Nhà tuyển dụng) trên hệ thống Cổng thông tin việc làm.
                                Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Thông tin chúng tôi thu thập</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <span className="font-medium">Thông tin cá nhân:</span> Họ tên, MSSV, Email, Số điện thoại, CV (đối với sinh viên).
                                </li>
                                <li>
                                    <span className="font-medium">Thông tin doanh nghiệp:</span> Tên công ty, địa chỉ, email liên hệ, thông tin người đại diện.
                                </li>
                                <li>
                                    <span className="font-medium">Thông tin kỹ thuật:</span> Địa chỉ IP, loại trình duyệt, thời gian truy cập (để cải thiện hiệu năng hệ thống).
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Mục đích sử dụng thông tin</h2>
                            <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Kết nối Sinh viên với Nhà tuyển dụng phù hợp.</li>
                                <li>Gửi thông báo về việc làm mới, trạng thái ứng tuyển.</li>
                                <li>Hỗ trợ giải đáp thắc mắc và xử lý các vấn đề kỹ thuật.</li>
                                <li>Thống kê, báo cáo hoạt động việc làm của sinh viên nhà trường.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Chia sẻ thông tin</h2>
                            <p>
                                Chúng tôi <strong>KHÔNG</strong> bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.
                            </p>
                            <p className="mt-2">Thông tin chỉ được chia sẻ trong các trường hợp:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-1">
                                <li>Khi sinh viên chủ động nộp hồ sơ, thông tin và CV sẽ được gửi đến Nhà tuyển dụng tương ứng.</li>
                                <li>Khi có yêu cầu từ cơ quan pháp luật có thẩm quyền.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Bảo mật dữ liệu</h2>
                            <p>
                                Hệ thống áp dụng các biện pháp kỹ thuật an ninh để ngăn chặn truy cập trái phép, mất mát hoặc phá hủy dữ liệu.
                                Mật khẩu người dùng được mã hóa. Chúng tôi khuyến nghị bạn không chia sẻ mật khẩu với bất kỳ ai.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Quyền của người dùng</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào thông qua trang Quản lý hồ sơ.</li>
                                <li>Bạn có quyền yêu cầu chúng tôi ngừng gửi các email tiếp thị/thông báo không quan trọng.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Liên hệ</h2>
                            <p>
                                Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
                            </p>
                            <ul className="mt-2 text-sm text-gray-600">
                                <li><strong>Trung tâm Trải nghiệm & Việc làm - Đại học Gia Định</strong></li>
                                <li>Email: Studentcentre@giadinh.edu.vn</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
