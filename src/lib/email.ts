
import { RequestEmailData } from "@/types/email";
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendOtpEmail(email: string, code: string) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Login Verification Code",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Verification Code</h2>
                <p>Your authentication code is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${code}</h1>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `,
    });
}

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function sendBeneficiary(data: RequestEmailData) {
    await transporter.sendMail({

    })
}