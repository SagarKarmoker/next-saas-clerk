'use client'
import React, { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Link } from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'

export default function SignUp() {
    const { isLoaded, setActive, signUp } = useSignUp()
    const [emailAddress, setEmailAddress] = useState("")
    const [password, setPassword] = useState("")
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [showPass, setShowPass] = useState("")

    //  ROUTER  
    const router = useRouter();

    // if not loaded all js
    if (!isLoaded) {
        return null; // user loader to show loading
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoaded) {
            return;
        }

        try {
            // user create on clerk
            await signUp.create({
                emailAddress,
                password
            })

            // email send to user
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })

            // not verified yet
            setPendingVerification(true)
        } catch (error) {
            setError(error)
            console.error(error.errors[0])
        }
    }

    const verifyCodeBtn = async () => {
        e.preventDefault();

        if (!isLoaded) {
            return;
        }

        try {
            const completeSignup = await signUp.attemptEmailAddressVerification({
                code
            })

            // if code is wrong or any other problem
            if (completeSignup.status !== 'complete') {
                setError("Verification Code Not Valid")
            }

            // if complete verification
            if (completeSignup.status === 'complete') {
                await setActive(completeSignup.createdSessionId)
                router.push("/dashboard")
            }

        } catch (error) {
            setError(error.errors[0].message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
                    <CardDescription>Create your account to get started</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Sign Up</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
