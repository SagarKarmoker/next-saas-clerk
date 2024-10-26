import prisma from "@/libs/prisma";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "No UserId found", status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            return NextResponse.json({ message: "User not found", status: 400 })
        }

        // time calculation
        const subsEnds = new Date();
        subsEnds.setMonth(subsEnds.getMonth() + 1)

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isSubscribed: true,
                subscribedOn: subsEnds
            }
        })

        return NextResponse.json({ message: "Subscribed user", subEndsOn: updatedUser.subscribedOn, status: 200 })
    } catch (error) {
        console.error("Error while subscription", error)
        return NextResponse.json({ message: "Error while subscription", status: 500 })
    }
}


export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "No UserId found", status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                isSubscribed: true,
                subscribedOn: true
            }
        })

        if (!user) {
            return NextResponse.json({ message: "User not found", status: 400 })
        }

        // time calculation
        const today = new Date();

        if (user.subscribedOn && user.subscribedOn < today) {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    isSubscribed: false,
                    subscribedOn: null
                }
            })

            return NextResponse.json({ message: "Subscription Ends", isSubscribed: false, subEndsOn: user.isSubscribed, status: 200 })
        }

        return NextResponse.json({ message: "Subscription Ends", isSubscribed: user.isSubscribed, subEndsOn: user.isSubscribed, status: 200 })
    } catch (error) {
        console.error("Error while subscription", error)
        return NextResponse.json({ message: "Error while subscription", status: 500 })
    }
}