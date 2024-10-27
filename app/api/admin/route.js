import prisma from "@/libs/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

async function isAdmin(userId) {
    const user = await clerkClient.users.getUser(userId)
    return user.privateMetadata.role === 'admin'
}