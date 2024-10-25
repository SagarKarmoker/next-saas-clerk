import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/", "/api/webhook/register", "/sign-in", "/sign-up"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth()

    if (!userId && !isProtectedRoute(req)) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (userId) {
        try {
            const user = await clerkClient.users.getUser(userId); // Fetch user data from Clerk
            const role = user.publicMetadata.role as string | undefined;

            // Admin role redirection logic
            if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            }

            // Prevent non-admin users from accessing admin routes
            if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }

            // Redirect authenticated users trying to access public routes
            if (isProtectedRoute(req) && userId) {
                return NextResponse.redirect(
                    new URL(
                        role === "admin" ? "/admin/dashboard" : "/dashboard",
                        req.url
                    )
                );
            }
        } catch (error) {
            console.error("Error fetching user data from Clerk:", error);
            return NextResponse.redirect(new URL("/error", req.url));
        }
    }
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};