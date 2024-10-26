import { Webhook } from 'svix'
import prisma from '@/libs/prisma'

// we are using svix 
export async function POST(req) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error("Please add webhook sceret");
    }

    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: No svix header")
    }

    // payload data comes from webhook
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // webhook
    const wh = new Webhook(WEBHOOK_SECRET)
    let event;

    try {
        event = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        })
    } catch (error) {
        console.error("error verifying webhook0", error)
        return new Response("Error in webhook", {
            status: 400
        })
    }

    const { id } = event.data;
    const eventType = event.type;

    //logs
    if (eventType === 'user.created') {
        try {
            const { email_addresses, primary_email_address_id } = event.data;
            const primaryEmail = email_addresses.find(
                (email) => email.id === primary_email_address_id
            )

            if(!primaryEmail){
                return new Response("No primary email found", {
                    status: 400
                })
            }

            // DB operation
            const user = await prisma.user.create({
                data: {
                    id: event.data.id,
                    email: primaryEmail.email_address,
                    isSubscribed: false
                }
            });

            console.log("User created", user)

        } catch (error) {
            console.log(error)
            return new Response("Error creating in db", {
                status: 400
            })
        }
    }

    return new Response("webhook received successfully", {
        status: 200
    })
}