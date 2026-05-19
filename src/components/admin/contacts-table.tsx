"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Contact {
    _id: string
    name: string
    email: string
    phone: string
    subject: string
    message: string
    createdAt: string
    status?: string
}

interface ContactsTableProps {
    initialContacts: Contact[]
}

export function ContactsTable({ initialContacts }: ContactsTableProps) {
    const { toast } = useToast()
    const [contacts, setContacts] = useState<Contact[]>(initialContacts)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = (id: string) => {
        // This simulates a delete action. In a real app, you'd call an API.
        setContacts(prev => prev.filter(c => c._id !== id))
        toast({
            title: "Đã xóa liên hệ",
            description: "Liên hệ đã được xóa khỏi danh sách (Giả lập).",
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Danh sách liên hệ</h2>
                    <p className="text-gray-500 mt-1">Quản lý các tin nhắn từ người dùng.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm kiếm theo tên, email..."
                        className="w-full sm:w-[300px] pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[150px] font-semibold">Ngày gửi</TableHead>
                                <TableHead className="font-semibold">Họ tên</TableHead>
                                <TableHead className="font-semibold">Email / SĐT</TableHead>
                                <TableHead className="font-semibold">Chủ đề</TableHead>
                                <TableHead className="font-semibold">Trạng thái</TableHead>
                                <TableHead className="font-semibold">Nội dung</TableHead>
                                <TableHead className="text-right font-semibold">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                        {searchQuery ? "Không tìm thấy kết quả nào" : "Không có dữ liệu"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <TableRow key={contact._id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="w-[150px] text-gray-600">
                                            {new Date(contact.createdAt).toLocaleDateString("vi-VN", {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">{contact.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-900">{contact.email}</span>
                                                <span className="text-xs text-gray-500">{contact.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                                {contact.subject}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">
                                                {contact.status || "Mới"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[250px] truncate text-gray-600" title={contact.message}>
                                            {contact.message}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(contact._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
