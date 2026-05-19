import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

const companies = [
    {
        name: "Techcombank",
        logo: "/logos/techcombank.png",
        industry: "Ngân hàng",
        size: "11,000+ nhân viên",
        location: "Hà Nội, Việt Nam",
        description: "Ngân hàng TMCP Kỹ thương Việt Nam - một trong những ngân hàng thương mại cổ phần lớn nhất Việt Nam, thành lập năm 1993, cung cấp đầy đủ dịch vụ tài chính cho khách hàng cá nhân và doanh nghiệp",
        openPositions: 25,
        rating: 4.2,
        verified: true,
        benefits: ["Lương thưởng hấp dẫn", "Bảo hiểm cao cấp", "Đào tạo chuyên nghiệp", "Môi trường quốc tế"],
        website: "https://techcombank.com/",
    },
    {
        name: "FPT Software",
        logo: "/logos/fpt.png",
        industry: "Công nghệ thông tin",
        size: "33,000+ nhân viên",
        location: "Hà Nội, Việt Nam",
        description: "Công ty dịch vụ công nghệ thông tin toàn cầu thuộc Tập đoàn FPT, chuyên cung cấp chuyển đổi số, phần mềm, AI, cloud & data, tự động hóa và các giải pháp công nghệ cho doanh nghiệp",
        openPositions: 120,
        rating: 4.5,
        verified: true,
        benefits: ["Đào tạo chuyên sâu", "Cơ hội quốc tế", "Lương cạnh tranh", "Team building"],
        website: "https://tuyendung.frt.vn/",
    },
    {
        name: "ITP - ĐHQG-HCM",
        logo: "/logos/itp.png",
        industry: "Công nghệ - Khởi nghiệp",
        size: "35+ nhân viên",
        location: "TP. Thủ Đức, TP. Hồ Chí Minh",
        description: "Khu Công nghệ Phần mềm ĐHQG-HCM hoạt động trong lĩnh vực công nghệ thông tin, đổi mới sáng tạo và hỗ trợ khởi nghiệp, cung cấp hạ tầng và môi trường phát triển cho doanh nghiệp công nghệ",
        openPositions: 8,
        rating: 4.3,
        verified: true,
        benefits: ["Môi trường học thuật", "Hỗ trợ khởi nghiệp", "Networking", "Đào tạo"],
        website: "https://itp.vn/",
    },
    {
        name: "IPS Independent",
        logo: "/logos/ips.png",
        industry: "Quản lý bất động sản",
        size: "400+ nhân viên",
        location: "Bình Chánh, TP. Hồ Chí Minh",
        description: "Công ty CP Dịch vụ Quản lý Bất động sản Independent hoạt động trong lĩnh vực quản lý và vận hành bất động sản với trên 12 năm kinh nghiệm tại Việt Nam",
        openPositions: 15,
        rating: 4.1,
        verified: true,
        benefits: ["Môi trường chuyên nghiệp", "Đào tạo nghiệp vụ", "Phúc lợi tốt", "Thăng tiến rõ ràng"],
        website: "https://firstindependent.vn/",
    },
    {
        name: "TekNix Corporation",
        logo: "/logos/teknix.png",
        industry: "Công nghệ thông tin",
        size: "200+ nhân viên",
        location: "Quận Bình Thạnh, TP. HCM",
        description: "TekNix Corporation là công ty công nghệ thông tin chuyên cung cấp sản phẩm, ứng dụng và giải pháp số hóa cho doanh nghiệp, tập trung vào chuyển đổi số, AI và các giải pháp công nghệ hiện đại",
        openPositions: 18,
        rating: 4.4,
        verified: true,
        benefits: ["Công nghệ mới nhất", "Start-up culture", "Remote work", "Thưởng dự án"],
        website: "https://www.teknixcorp.com/",
    },
    {
        name: "Cohota",
        logo: "/logos/cohota.png",
        industry: "EdTech - Giáo dục",
        size: "50+ nhân viên",
        location: "TP. Thủ Đức, TP. Hồ Chí Minh",
        description: "Cohota là nền tảng công nghệ LMS (Hệ thống Quản lý Học tập trực tuyến) được triển khai cho các đơn vị giáo dục và doanh nghiệp đào tạo",
        openPositions: 10,
        rating: 4.2,
        verified: true,
        benefits: ["Môi trường sáng tạo", "Học hỏi liên tục", "Flexible hours", "Stock options"],
        website: "https://cohota.com/",
    },
    {
        name: "TV MEDIA",
        logo: "/logos/tvmedia.png",
        industry: "Truyền thông - Sự kiện",
        size: "50+ nhân viên",
        location: "Hà Đông, Hà Nội",
        description: "TV Media là đơn vị chuyên cung cấp giải pháp tổ chức sự kiện trọn gói và truyền thông thương hiệu cho doanh nghiệp, bao gồm lập kế hoạch, thiết kế và vận hành các chương trình sự kiện chuyên nghiệp.",
        openPositions: 5,
        rating: 4.5,
        verified: true,
        benefits: ["Môi trường năng động", "Tham gia sự kiện lớn", "Du lịch hàng năm", "Thưởng dự án"],
    },
    {
        name: "KÊNH TÀI TRỢ",
        logo: "/logos/kenhtaitro.png",
        industry: "Truyền thông - Marketing",
        size: "N/A",
        location: "TP.HCM",
        description: "Chuyên cung cấp giải pháp tư vấn chiến lược tài trợ và truyền thông thương hiệu tập trung vào phân khúc học sinh - sinh viên qua các giải pháp Uni-tour, Mini-tour.",
        openPositions: 3,
        rating: 4.0,
        verified: true,
        benefits: ["Làm việc với Gen Z", "Môi trường trẻ trung", "Cơ hội networking", "Phát triển kỹ năng mềm"],
    },
    {
        name: "QUỐC & CỘNG SỰ",
        logo: "/logos/quoclaw.png",
        industry: "Pháp luật",
        size: "10-20 nhân viên",
        location: "TP.HCM",
        description: "Tổ chức hành nghề luật chuyên cung cấp các giải pháp tư vấn pháp lý và tranh tụng cho cá nhân và doanh nghiệp trong các lĩnh vực dân sự, hình sự, đất đai, kinh doanh thương mại.",
        openPositions: 4,
        rating: 4.8,
        verified: true,
        benefits: ["Đào tạo pháp lý chuyên sâu", "Làm việc với luật sư giỏi", "Môi trường chuyên nghiệp", "Cơ hội thăng tiến"],
        website: "https://quoclaw.vn/vi/category/tuyen-dung/",
    },
    {
        name: "NHÂN KIỆT",
        logo: "/logos/nhankiet.png",
        industry: "Nhân sự",
        size: "500+ nhân viên",
        location: "TP.HCM",
        description: "Chuyên cung cấp các giải pháp về nguồn nhân lực, bao gồm cho thuê lại lao động, cung ứng lao động, dịch vụ thầu khoán và quản lý tiền lương cho các lĩnh vực sản xuất, logistics.",
        openPositions: 50,
        rating: 4.2,
        verified: true,
        benefits: ["Quy mô lớn", "Ổn định", "Chế độ đầy đủ", "Đào tạo nghiệp vụ"],
        website: "https://nhankiet.vn/",
    },
    {
        name: "GIA NGUYỄN ADS",
        logo: "/logos/gianguyen.png",
        industry: "Digital Marketing",
        size: "10-50 nhân viên",
        location: "TP.HCM",
        description: "Digital Marketing Agency chuyên cung cấp các giải pháp quảng cáo trực tuyến Facebook, Google, TikTok, Shopee và phát triển thương hiệu trên nền tảng số cho doanh nghiệp SMEs.",
        openPositions: 8,
        rating: 4.3,
        verified: true,
        benefits: ["Tiếp cận công nghệ mới", "Dự án đa dạng", "Thưởng hiệu quả", "Môi trường sáng tạo"],
        website: "https://gianguyenads.com/vi/",
    },
    {
        name: "ALTA GROUP",
        logo: "/logos/alta.png",
        industry: "Đa ngành (CNTT, Truyền thông, Sản xuất)",
        size: "200+ nhân viên",
        location: "TP.HCM",
        description: "Tập đoàn đa ngành công nghệ cao, tập trung vào giải pháp CNTT, truyền thông số và sản xuất công nghiệp nhựa tự hủy. Tiên phong tích hợp công nghệ vào truyền thông và sản xuất.",
        openPositions: 15,
        rating: 4.4,
        verified: true,
        benefits: ["Tập đoàn lớn", "Công nghệ cao", "Đãi ngộ tốt", "Cơ hội đa ngành"],
        website: "https://alta.com.vn/",
    },
    {
        name: "MIA SOLUTION",
        logo: "/logos/miasolution.png",
        industry: "Công nghệ thông tin",
        size: "10-50 nhân viên",
        location: "TP.HCM",
        description: "Chuyên cung cấp giải pháp CNTT và chuyển đổi số toàn diện: phát triển phần mềm, website, mobile app và hệ thống quản trị doanh nghiệp (ERP, CRM).",
        openPositions: 6,
        rating: 4.1,
        verified: true,
        benefits: ["Dự án Tech thú vị", "Học hỏi công nghệ mới", "Môi trường thân thiện", "Thưởng dự án"],
        website: "https://miasolution.vn/",
    }
]

export async function GET() {
    try {
        // Clear existing to avoid duplicates
        await prisma.company.deleteMany({})

        const { count } = await prisma.company.createMany({
            data: companies as any
        })

        return NextResponse.json({
            success: true,
            count: count,
            message: "Seeded partners successfully"
        })
    } catch (error) {
        console.error("Seed error:", error)
        return NextResponse.json({ success: false, error: "Failed to seed partners" }, { status: 500 })
    }
}

