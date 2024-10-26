import prisma from "@/libs/prisma";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// pagination
const ITEMS_PER_PAGE = 10

export async function GET(req) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "No UserId found", status: 400 })
    }

    // page
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || 1)
    const search = searchParams.get("search") || ""

    try {
        // search and pagination
        const todos = await prisma.todo.findMany({
            where: {
                id: user,
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            orderBy: {
                createdOn: 'desc'
            },
            take: ITEMS_PER_PAGE,
            skip: (page - 1) * ITEMS_PER_PAGE
        })

        const totalTodos = await prisma.todo.count({
            where: {
                id: userId,
                title: {
                    contains: "search",
                    mode: "insensitive"
                }
            }
        })

        const totolPages = Math.ceil(totalTodos / ITEMS_PER_PAGE)

        return NextResponse.json({
            todos,
            currentPage: page,
            totolPages
        })
    } catch (error) {
        console.error("Error while getting todos", error)
        return NextResponse.json({ message: "Error while subscription", status: 500 })
    }
}

export async function POST(req) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "No UserId found", status: 400 })
    }

    // find the user
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                todos: true
            }
        })

        if (!user) {
            return NextResponse.json({ message: "User Not found", status: 404 })
        }

        if (!user.isSubscribed && user.todos.length >= 3) {
            return NextResponse.json({ message: "Max limit reached", status: 403 })
        }

        const { title } = await req.json()
        await prisma.todo.create({
            data: {
                title, userId
            }
        })

        return NextResponse.json({ message: "Todo created", status: 201 })
    } catch (error) {
        console.error("Error while getting todos", error)
        return NextResponse.json({ message: "Error while subscription", status: 500 })
    }
}