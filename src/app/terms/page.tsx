"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Điều khoản sử dụng</h1>
                    <p className="text-gray-500 mb-8">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Giới thiệu</h2>
                            <p>
                                Chào mừng bạn đến với Cổng thông tin việc làm Đại học Gia Định (GDU Career).
                                Khi truy cập và sử dụng trang web này, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.
                                Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngưng sử dụng dịch vụ.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Tài khoản người dùng</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <span className="font-medium">Sinh viên:</span> Cần sử dụng cung cấp thông tin chính xác về Mã số sinh viên (MSSV), Họ tên, và Ngành học để tạo hồ sơ.
                                </li>
                                <li>
                                    <span className="font-medium">Nhà tuyển dụng:</span> Cần cung cấp thông tin doanh nghiệp xác thực. Chúng tôi có quyền yêu cầu giấy phép kinh doanh để xác minh.
                                </li>
                                <li>
                                    Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Quyền và trách nhiệm</h2>
                            <p className="mb-2"><span className="font-medium">Đối với Sinh viên:</span></p>
                            <ul className="list-disc pl-5 space-y-2 mb-4">
                                <li>Ứng tuyển vào các vị trí phù hợp với năng lực.</li>
                                <li>Không spam hồ sơ hoặc cung cấp thông tin CV giả mạo.</li>
                                <li>Hành xử văn minh, chuyên nghiệp khi giao tiếp với Nhà tuyển dụng.</li>
                            </ul>

                            <p className="mb-2"><span className="font-medium">Đối với Nhà tuyển dụng:</span></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Đăng tin tuyển dụng trung thực, rõ ràng về mô tả công việc và mức lương.</li>
                                <li>Không thu phí ứng viên dưới mọi hình thức.</li>
                                <li>Bảo mật thông tin cá nhân của ứng viên.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Nghiêm cấm</h2>
                            <p>Nghiêm cấm các hành vi sau trên nền tảng GDU Career:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Đăng tải nội dung vi phạm pháp luật, thuần phong mỹ tục.</li>
                                <li>Sử dụng tool, bot để thu thập dữ liệu trái phép.</li>
                                <li>Mạo danh Đại học Gia Định hoặc các tổ chức khác.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Miễn trừ trách nhiệm</h2>
                            <p>
                                Đại học Gia Định nỗ lực kiểm duyệt tin đăng nhưng không đảm bảo hoàn toàn tính chính xác tuyệt đối của mọi tin tuyển dụng.
                                Sinh viên cần chủ động tìm hiểu kỹ về doanh nghiệp trước khi nhận việc. Chúng tôi không chịu trách nhiệm về các tranh chấp lao động phát sinh giữa Sinh viên và Nhà tuyển dụng.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Liên hệ</h2>
                            <p>
                                Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
                            </p>
                            <ul className="mt-2 text-sm text-gray-600">
                                <li><strong>Trung tâm Trải nghiệm & Việc làm - Đại học Gia Định</strong></li>
                                <li>Địa chỉ: 371 Nguyễn Kiệm, Phường Hạnh Thông, Quận Gò Vấp, TP.HCM</li>
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
