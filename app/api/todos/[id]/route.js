import prisma from "@/libs/prisma";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function DELETE(req, { params }) {
    const { userId } = auth()

    if (!userId) {
        return NextResponse.json({ message: "No UserId found", status: 400 })
    }

    try {
        const todoId = params.id

        const todo = await prisma.todo.findUnique({
            where: {
                id: todoId
            }
        })

        if (!todo) {
            return NextResponse.json({ message: "Todo not found", status: 401 })
        }

        if (todo.userId !== userId) {
            return NextResponse.json({ message: "Forbidden", status: 403 })
        }

        await prisma.todo.delete({
            where: {
                id: todoId
            }
        })

        return NextResponse.json({ message: "Deleted todo", status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Error while delete", status: 400 })
    }
}   

// TODO: complete
export async function PUT(req, { params }) {
    const { userId } = auth()

    if (!userId) {
        return NextResponse.json({ message: "No UserId found", status: 400 })
    }

    
}   