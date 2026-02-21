
import { AllocationEmailParams, RequestEmailData } from "@/types/email";
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


export async function sendDonationConfirmation(data: RequestEmailData) {
  const formattedDate = data.date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: "Donation Payment Successful with PayMongo",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #16a34a;">Payment Successful 🎉</h2>
        
        <p>Hi,</p>

        <p>Thank you for your generous donation! Your payment has been successfully processed through <strong>PayMongo</strong>.</p>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px;">
          <p><strong>Amount:</strong> ₱${data.amount.toFixed(2)}</p>
          <p><strong>Reference No:</strong> ${data.reference}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
        </div>

        <p style="margin-top: 20px;">
          Your support helps us continue our mission and make a positive impact.
        </p>

        <p>Thank you and God bless! 🙏</p>

        <hr style="margin-top: 30px;" />

        <p style="font-size: 12px; color: gray;">
          This is an automated message. Please do not reply.
        </p>
      </div>
    `
  });
}


export async function sendAllocationNotificationEmail(params: AllocationEmailParams) {
  const { to, donorName, amountUsed, purpose, disbursementDate, isBeneficiary } = params;
  
  const formattedDate = disbursementDate
   ? disbursementDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric"
   })
   : "TBD";

  const subject = isBeneficiary
   ? `Your Request Has Been Approved!`
   : `Your Donation is Making an Impact!`;

  const html = isBeneficiary
   ? `
      <h2>Good News, ${donorName}!</h2>
      <p>Your request has been approved and funds have been allocated.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Amount Approved:</strong> ₱${amountUsed.toLocaleString()}</p>
        <p><strong>Disbursement Date:</strong> ${formattedDate}</p>
      </div>
      <p>Please prepare the necessary documents for receiving the funds.</p>
    `
    : `
      <h2>Dear ${donorName},</h2>
      <p>We're excited to share that your donation is being put to good use!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Your Contribution:</strong> ₱${amountUsed.toLocaleString()}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Scheduled Disbursement:</strong> ${formattedDate}</p>
      </div>
      <p>We'll send you another update once the funds have been disbursed, including proof of how your donation made a difference.</p>
      <p>Thank you for your generosity!</p>
    `;
  
}