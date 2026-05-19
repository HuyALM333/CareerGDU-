import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

// PATCH /api/admin/partners/[id] - Update a partner
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        // Remove ID from body to avoid trying to update it
        const { id: _, _id, ...updateData } = body

        await prisma.company.update({
            where: { id },
            data: { ...updateData, updatedAt: new Date() }
        })

        return NextResponse.json({ success: true, message: "Partner updated successfully" })
    } catch (error) {
        console.error("Error updating partner:", error)
        return NextResponse.json({ success: false, error: "Failed to update partner" }, { status: 500 })
    }
}

// DELETE /api/admin/partners/[id] - Delete a partner
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.company.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: "Partner deleted successfully" })
    } catch (error) {
        console.error("Error deleting partner:", error)
        return NextResponse.json({ success: false, error: "Failed to delete partner" }, { status: 500 })
    }
}

