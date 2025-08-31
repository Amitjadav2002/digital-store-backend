import Razorpay from "razorpay";

export default async function handler(req, res) {

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://digital-store-pearl.vercel.app"); // Replace with your frontend URL
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const { customerName, customerEmail, ebookName, amount, purchaseID } = req.body;

        const options = {
            upi_link: true,
            amount: amount * 100, // amount in paise
            currency: "INR",
            accept_partial: false,
            reference_id: `order_${Date.now()}`,
            description: `Payment for ${ebookName}`,
            customer: {
                name: customerName,
                email: customerEmail,
            },
            notify: { email: true, sms: false },
            callback_url: `https://digital-store-pearl.vercel.app/download?purchaseId=${purchaseID}`,
            callback_method: "get",
            expire_by: Math.floor(Date.now() / 1000) + 5 * 60,
        };

        const paymentLink = await razorpay.paymentLink.create(options);

        return res.status(200).json({ url: paymentLink.short_url });
    } catch (error) {
        console.error("Error creating payment link:", error);
        return res.status(500).json({ error: "Payment link creation failed" });
    }
}
