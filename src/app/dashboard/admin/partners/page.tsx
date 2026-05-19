"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Building, Trash2, Edit, ExternalLink, Globe, MapPin, Briefcase, RefreshCw, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Partner {
    _id: string
    name: string
    logo: string
    industry: string
    size: string
    address: string
    description: string
    website: string
    verified: boolean
    benefits: string[]
    createdAt: string
}

export default function PartnerManagementPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [partners, setPartners] = useState<Partner[]>([])
    const [loading, setLoading] = useState(true)
    const [isMigrating, setIsMigrating] = useState(false)

    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null)

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingPartner, setEditingPartner] = useState<any>(null)

    useEffect(() => {
        fetchPartners()
    }, [user])

    const fetchPartners = async () => {
        try {
            if (user?.role !== 'admin') {
                setLoading(false)
                return
            }
            setLoading(true)
            const response = await fetch('/api/admin/partners')
            const data = await response.json()
            if (data.success) {
                setPartners(data.partners)
            }
        } catch (error) {
            console.error("Failed to fetch partners", error)
        } finally {
            setLoading(false)
        }
    }

    const handleMigrate = async () => {
        if (!confirm("Hành động này sẽ reset danh sách đối tác về mặc định. Bạn có chắc chắn?")) return

        setIsMigrating(true)
        try {
            const res = await fetch('/api/companies/seed')
            const data = await res.json()
            if (data.success) {
                toast({ title: "Thành công", description: `Đã khôi phục ${data.count} đối tác mặc định.` })
                fetchPartners()
            }
        } catch (e) {
            toast({ title: "Lỗi", description: "Không thể khôi phục dữ liệu.", variant: "destructive" })
        } finally {
            setIsMigrating(false)
        }
    }

    const handleDeletePartner = async () => {
        if (!partnerToDelete) return

        try {
            const response = await fetch(`/api/admin/partners/${partnerToDelete}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast({ title: "Xóa thành công", description: "Thông tin đối tác đã được gỡ bỏ." })
                setPartners(prev => prev.filter(p => p._id !== partnerToDelete))
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa đối tác.", variant: "destructive" })
        } finally {
            setDeleteDialogOpen(false)
            setPartnerToDelete(null)
        }
    }

    const handleSavePartner = async () => {
        if (!editingPartner.name || !editingPartner.industry) {
            toast({ title: "Lỗi", description: "Vui lòng điền Tên và Ngành nghề.", variant: "destructive" })
            return
        }

        try {
            const isNew = !editingPartner._id
            const url = isNew ? '/api/admin/partners' : `/api/admin/partners/${editingPartner._id}`
            const method = isNew ? 'POST' : 'PATCH'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPartner)
            })
            const data = await response.json()

            if (data.success) {
                toast({
                    title: isNew ? "Thêm thành công" : "Cập nhật thành công",
                    description: "Thông tin đối tác đã được lưu."
                })
                fetchPartners()
                setEditDialogOpen(false)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu thông tin.", variant: "destructive" })
        }
    }

    if (user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-bold mb-2">Không có quyền truy cập</h2>
                        <p className="text-muted-foreground">Bạn cần quyền quản trị viên để xem trang này.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const filteredPartners = partners.filter((p) => {
        return (
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.industry.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground truncate">Quản lý đối tác</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Quản lý các doanh nghiệp liên kết với nhà trường</p>
                </div>
                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleMigrate} disabled={isMigrating} className="w-full sm:w-auto text-xs sm:text-sm">
                        <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isMigrating ? 'animate-spin' : ''}`} />
                        Mặc định
                    </Button>
                    <Button onClick={() => {
                        setEditingPartner({
                            name: "",
                            industry: "",
                            logo: "",
                            size: "",
                            address: "",
                            description: "",
                            website: "",
                            benefits: []
                        })
                        setEditDialogOpen(true)
                    }} className="w-full sm:w-auto text-xs sm:text-sm">
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="p-4 sm:p-6 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm doanh nghiệp..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="rounded-md overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Doanh nghiệp</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Ngành nghề</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Địa điểm</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-500">
                                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : filteredPartners.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-500">Không tìm thấy đối tác nào</td>
                                        </tr>
                                    ) : (
                                        filteredPartners.map((p) => (
                                            <tr key={p._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="py-4 px-4 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
                                                            {p.logo ? (
                                                                <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <Building className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 truncate">{p.name}</p>
                                                            {p.website && (
                                                                <a href={p.website} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                                                    <Globe className="h-3 w-3" />
                                                                    Website
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant="secondary" className="font-medium">{p.industry}</Badge>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1.5 max-w-[200px] truncate">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                                        <span className="truncate">{p.address}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" onClick={() => {
                                                            setEditingPartner(p)
                                                            setEditDialogOpen(true)
                                                        }}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/5" onClick={() => {
                                                            setPartnerToDelete(p._id)
                                                            setDeleteDialogOpen(true)
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile & Tablet Card Layout */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {loading ? (
                                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                    <span>Đang tải...</span>
                                </div>
                            ) : filteredPartners.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">Không tìm thấy đối tác nào</div>
                            ) : (
                                filteredPartners.map((p) => (
                                    <div key={p._id} className="p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-xl border bg-white flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm">
                                                    {p.logo ? (
                                                        <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Building className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate leading-tight">{p.name}</h3>
                                                    <p className="text-xs text-blue-600 font-semibold truncate">{p.industry}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 bg-blue-50/50 hover:bg-blue-50" onClick={() => {
                                                    setEditingPartner(p)
                                                    setEditDialogOpen(true)
                                                }}>
                                                    <Edit className="h-4.5 w-4.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 bg-red-50/50 hover:bg-red-50" onClick={() => {
                                                    setPartnerToDelete(p._id)
                                                    setDeleteDialogOpen(true)
                                                }}>
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                                            <div className="flex items-center gap-1.5 truncate bg-gray-50 rounded-lg py-2 px-3">
                                                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                                <span className="truncate">{p.address || "N/A"}</span>
                                            </div>
                                            {p.website && (
                                                <a href={p.website} target="_blank" className="flex items-center gap-1.5 truncate bg-blue-50 text-blue-600 rounded-lg py-2 px-3 hover:bg-blue-100 transition-colors">
                                                    <Globe className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate font-medium">Website</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa đối tác</DialogTitle>
                        <DialogDescription>
                            Hành động này sẽ gỡ bỏ doanh nghiệp khỏi danh sách liên kết. Bạn có chắc chắn muốn tiếp tục?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDeletePartner}>Xác nhận xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit/Add Partner Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-xl">
                    <DialogHeader>
                        <DialogTitle>{editingPartner?._id ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tên doanh nghiệp <span className="text-destructive">*</span></Label>
                                <Input
                                    value={editingPartner?.name || ""}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                                    placeholder="VD: Techcombank"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ngành nghề <span className="text-destructive">*</span></Label>
                                <Input
                                    value={editingPartner?.industry || ""}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, industry: e.target.value })}
                                    placeholder="VD: Ngân hàng"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Logo URL</Label>
                                <Input
                                    value={editingPartner?.logo || ""}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, logo: e.target.value })}
                                    placeholder="VD: /logos/techcombank.png"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    value={editingPartner?.website || ""}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, website: e.target.value })}
                                    placeholder="VD: https://techcombank.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quy mô</Label>
                                <Input
                                    value={editingPartner?.size || ""}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, size: e.target.value })}
                                    placeholder="VD: 10,000+ nhân viên"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Địa điểm</Label>
                                <Input
                                    value={editingPartner?.address || ""}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, address: e.target.value })}
                                    placeholder="VD: Hà Nội, Việt Nam"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Mô tả doanh nghiệp</Label>
                            <Textarea
                                rows={3}
                                value={editingPartner?.description || ""}
                                onChange={(e) => setEditingPartner({ ...editingPartner, description: e.target.value })}
                                placeholder="Nhập mô tả ngắn về doanh nghiệp..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Phúc lợi (ngăn cách bằng dấu phẩy)</Label>
                            <Input
                                value={Array.isArray(editingPartner?.benefits) ? editingPartner.benefits.join(", ") : ""}
                                onChange={(e) => setEditingPartner({
                                    ...editingPartner,
                                    benefits: e.target.value.split(",").map(b => b.trim()).filter(b => b !== "")
                                })}
                                placeholder="VD: Lương thưởng, Bảo hiểm, Đào tạo"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleSavePartner}>Lưu thông tin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
