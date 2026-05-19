"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, UserPlus, Shield, Trash2, Edit, Eye, Users, GraduationCap, Building2, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock users removed

const roleColors = {
  student: "bg-blue-100 text-blue-800",
  employer: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
}

const roleLabels = {
  student: "Sinh viên",
  employer: "Nhà tuyển dụng",
  admin: "Quản trị viên",
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
}

const statusLabels = {
  active: "Hoạt động",
  pending: "Đang chờ",
  rejected: "Từ chối",
}

export default function UsersManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  })

  useEffect(() => {
    fetchUsers()
  }, [user])

  const adminEmail = "lehoangphuc14122003@gmail.com" // Hardcoded for matching UI, should ideally come from public env if possible

  const fetchUsers = async () => {
    try {
      if (user?.role !== 'admin') {
        setLoading(false)
        return
      }
      setLoading(true)
      const response = await fetch('/api/users', { cache: "no-store", headers: { "Pragma": "no-cache" } })
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }

  const isRootAdmin = user?.email === adminEmail

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/users/${userToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterEmail: user?.email })
      })
      const data = await response.json()

      if (data.success) {
        toast({ title: "Xóa thành công", description: "Tài khoản và toàn bộ dữ liệu liên quan đã được dọn dẹp sạch sẽ." })
        setUsers(prev => prev.filter(u => u._id !== userToDelete))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể xóa người dùng.", variant: "destructive" })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const payload = {
        name: editingUser.name,
        role: editingUser.role,
        requesterEmail: user?.email
      }

      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (data.success) {
        toast({ title: "Cập nhật thành công", description: "Thông tin người dùng đã được cập nhật." })
        setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, ...payload } : u))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể cập nhật thông tin.", variant: "destructive" })
    } finally {
      setEditDialogOpen(false)
      setEditingUser(null)
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', requesterEmail: user?.email })
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Đã duyệt", description: "Tài khoản nhà tuyển dụng đã được kích hoạt." })
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: 'active' } : u))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể duyệt tài khoản.", variant: "destructive" })
    }
  }

  const handleRoleChange = async () => {
    if (!editingUser || !selectedRole) return

    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, requesterEmail: user?.email })
      })
      const data = await response.json()

      if (data.success) {
        toast({ title: "Thành công", description: `Đã đổi vai trò thành ${roleLabels[selectedRole as keyof typeof roleLabels]}.` })
        setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, role: selectedRole } : u))
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể đổi vai trò.", variant: "destructive" })
    } finally {
      setRoleDialogOpen(false)
      setEditingUser(null)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin.", variant: "destructive" })
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          creatorEmail: user?.email // Pass current user email for root admin verification
        })
      })
      const data = await response.json()

      if (data.success) {
        toast({ title: "Thành công", description: "Tài khoản mới đã được tạo." })
        fetchUsers() // Refresh list
        setAddDialogOpen(false)
        setNewUser({ name: "", email: "", password: "", role: "student" })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể tạo tài khoản.", variant: "destructive" })
    }
  }

  if (user?.role !== "admin") {
    // ... existing unauthorized view
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Không có quyền truy cập</h2>
            <p className="text-muted-foreground">Bạn cần quyền quản trị viên để xem trang này.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground truncate">Quản lý người dùng</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setAddDialogOpen(true)}
          disabled={user?.email !== adminEmail} // Only Root Admin can add users directly for now
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-y-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Users size={18} className="sm:size-[20px]" />
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex bg-blue-50 text-blue-700 border-blue-200">
                Tổng cộng
              </Badge>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Tổng tài khoản</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-y-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="sm:size-[20px]" />
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex bg-green-50 text-green-700 border-green-200">
                {roleLabels.student}
              </Badge>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="text-xl sm:text-2xl font-bold">
                {users.filter(u => u.role === 'student').length}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Sinh viên</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-y-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Building2 size={18} className="sm:size-[20px]" />
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex bg-purple-50 text-purple-700 border-purple-200">
                {roleLabels.employer}
              </Badge>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="text-xl sm:text-2xl font-bold">
                {users.filter(u => u.role === 'employer').length}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Nhà tuyển dụng</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-y-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={18} className="sm:size-[20px]" />
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex bg-red-50 text-red-700 border-red-200">
                {roleLabels.admin}
              </Badge>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="text-xl sm:text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Quản trị viên</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Sinh viên</option>
              <option value="employer">Nhà tuyển dụng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto px-1 sm:px-0">
            {/* Desktop Table View */}
            <table className="w-full hidden lg:table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Người dùng</th>
                  <th className="text-left py-3 px-4 font-medium">Vai trò</th>
                  <th className="text-left py-3 px-4 font-medium text-center">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày tạo</th>
                  <th className="text-right py-3 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Không tìm thấy người dùng nào</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium overflow-hidden shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              (u.name?.charAt(0) || "U").toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{u.name || "Chưa có tên"}</p>
                            <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge className={roleColors[u.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
                            {roleLabels[u.role as keyof typeof roleLabels] || u.role}
                          </Badge>
                          {u.email === adminEmail && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                              Quản trị viên gốc
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {u.status === 'pending' && u.role === 'employer' ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 animate-pulse">
                              Cần duyệt
                            </Badge>
                          ) : (
                            <Badge variant="outline" className={u.emailVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                              {u.emailVerified ? "Đã xác minh" : "Chưa xác minh"}
                            </Badge>
                          )}
                          {/* Show explicit status if exists */}
                          {u.status && (
                            <Badge className={`text-[10px] ${statusColors[u.status as keyof typeof statusColors] || "bg-gray-100"}`}>
                              {statusLabels[u.status as keyof typeof statusLabels] || u.status}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(u.email !== adminEmail && (u.role !== 'admin' || isRootAdmin)) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">

                              <DropdownMenuItem onClick={() => {
                                setEditingUser(u)
                                setSelectedRole(u.role)
                                setRoleDialogOpen(true)
                              }}>
                                <Shield className="h-4 w-4 mr-2" />
                                Đổi vai trò
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setUserToDelete(u._id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}

                        {/* Quick Approve Button for Pending Employers */}
                        {u.role === 'employer' && u.status === 'pending' && (
                          <Button
                            size="sm"
                            className="ml-2 bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                            title="Duyệt nhanh"
                            onClick={() => handleApproveUser(u._id)}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-50 px-1">
              {loading ? (
                <div className="py-12 text-center text-gray-500">Đang tải dữ liệu...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-500">Không tìm thấy người dùng nào</div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u._id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            (u.name?.charAt(0) || "U").toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate leading-tight">{u.name || "Chưa có tên"}</h3>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      {u.email !== adminEmail && (u.role !== 'admin' || isRootAdmin) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">

                            <DropdownMenuItem onClick={() => {
                              setEditingUser(u)
                              setSelectedRole(u.role)
                              setRoleDialogOpen(true)
                            }}>
                              <Shield className="h-4 w-4 mr-2" />
                              Đổi vai trò
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setUserToDelete(u._id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${roleColors[u.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"} px-2.5 py-0.5 text-[10px]`}>
                        {roleLabels[u.role as keyof typeof roleLabels] || u.role}
                      </Badge>
                      {u.emailVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[10px] px-2.5">Đã xác minh</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] px-2.5">Chưa xác minh</Badge>
                      )}

                      {u.status && (
                        <Badge className={`text-[10px] ${statusColors[u.status as keyof typeof statusColors] || "bg-gray-100"} px-2.5`}>
                          {statusLabels[u.status as keyof typeof statusLabels] || u.status}
                        </Badge>
                      )}

                      {u.role === 'employer' && u.status === 'pending' && (
                        <Button
                          size="sm"
                          className="ml-auto bg-green-600 hover:bg-green-700 text-white h-6 text-[10px] px-2"
                          onClick={() => handleApproveUser(u._id)}
                        >
                          Duyệt
                        </Button>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium ml-auto self-center">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </span>
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
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa <strong>VĨNH VIỄN</strong> tài khoản này cùng toàn bộ dữ liệu liên quan (tin đăng, hồ sơ ứng tuyển, thông báo, v.v.). Bạn có chắc chắn muốn tiếp tục?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Xóa và dọn dẹp dữ liệu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Họ và tên</label>
              <Input
                value={editingUser?.name || ""}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdateUser}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] p-4 sm:p-6 rounded-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò người dùng</DialogTitle>
            <DialogDescription>
              Chọn vai trò mới cho người dùng <strong>{editingUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {editingUser?.role === "student" && <SelectItem value="student">Sinh viên</SelectItem>}
                {editingUser?.role === "employer" && <SelectItem value="employer">Nhà tuyển dụng</SelectItem>}
                {editingUser?.role === "admin" && <SelectItem value="admin">Quản trị viên</SelectItem>}
              </SelectContent>
            </Select>
            {editingUser?.role !== "admin" && (
              <p className="text-xs text-muted-foreground mt-2">
                * Hiện tại tài khoản này chỉ có 1 vai trò hợp lệ trong luồng sử dụng.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} className="rounded-xl h-11">Hủy</Button>
            <Button onClick={handleRoleChange} className="rounded-xl h-11 bg-primary">Cập nhật vai trò</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới trực tiếp (không cần xác minh OTP).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Họ và tên</label>
              <Input
                placeholder="Nguyễn Văn A"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Vai trò</label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Sinh viên</SelectItem>
                  <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddUser}>Tạo tài khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
