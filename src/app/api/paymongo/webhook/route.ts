/**
 * /api/paymongo/webhook/route.ts
 * PayMongo Webhook Handler
 * Receives payment events from PayMongo
 */

import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paymongo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("=== WEBHOOK RECEIVED ===");
  
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paymongo-signature");

    console.log("Raw body length:", rawBody.length);
    console.log("Has signature:", !!signature);

    // TEMPORARILY DISABLED for debugging - re-enable in production!
    // if (signature && process.env.PAYMONGO_WEBHOOK_SECRET) {
    //   const isValid = verifyWebhookSignature(
    //     rawBody, 
    //     signature, 
    //     process.env.PAYMONGO_WEBHOOK_SECRET
    //   );
    //   
    //   if (!isValid) {
    //     console.error("Invalid webhook signature");
    //     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    //   }
    // }

    const event = JSON.parse(rawBody);
    console.log("Full event:", JSON.stringify(event, null, 2));
    
    const eventType = event.data.attributes.type;

    console.log("PayMongo webhook received:", eventType);
    console.log("Webhook payload:", JSON.stringify(event, null, 2));

    if (eventType === "checkout_session.payment.paid") {
      const checkoutSession = event.data.attributes.data;
      const referenceCode = checkoutSession.attributes.reference_number;
      const checkoutSessionId = checkoutSession.id;
      
      // Extract payment details from the payments array
      const payments = checkoutSession.attributes.payments || [];
      const payment = payments[0]; // First payment
      
      // Get payment method and fee info
      const paymentMethod = checkoutSession.attributes.payment_method_used || 
                           payment?.attributes?.source?.type || 
                           "unknown";
      
      // PayMongo fee is typically in the payment object
      // Fee is in centavos, convert to PHP
      const feeInCentavos = payment?.attributes?.fee || 0;
      const paymentFee = feeInCentavos / 100;
      
      // Net amount = donation amount - fee
      const grossAmount = (checkoutSession.attributes.amount || 0) / 100;
      const netAmount = grossAmount - paymentFee;

      console.log("Processing payment:", {
        referenceCode,
        paymentMethod,
        paymentFee,
        netAmount,
      });

      // Check if donation exists
      const existingDonation = await prisma.donation.findUnique({
        where: { reference_code: referenceCode },
      });

      if (!existingDonation) {
        console.error("Donation not found:", referenceCode);
        return NextResponse.json(
          { error: "Donation not found", referenceCode },
          { status: 404 }
        );
      }

      // Find and update donation
      const donation = await prisma.donation.update({
        where: { reference_code: referenceCode },
        data: {
          status: "completed",
          payment_intent_id: checkoutSessionId,
          payment_method: paymentMethod,
          payment_fee: paymentFee > 0 ? paymentFee : null,
          net_amount: netAmount > 0 ? netAmount : null,
          paid_at: new Date(),
        },
        include: {
          guestDonor: true,
          registeredDonor: true,
        },
      });

      // Update donor statistics
      if (donation.guest_donor_id) {
        await prisma.guestDonor.update({
          where: { id: donation.guest_donor_id },
          data: {
            donation_count: { increment: 1 },
            total_donated: { increment: donation.amount },
            last_donation_date: new Date(),
            first_donation_date: donation.guestDonor?.first_donation_date || new Date(),
          },
        });
      } else if (donation.registered_donor_id) {
        await prisma.registeredDonor.update({
          where: { id: donation.registered_donor_id },
          data: {
            donation_count: { increment: 1 },
            total_donated: { increment: donation.amount },
          },
        });
      }

      

      // Update pool if restricted donation
      if (donation.pool_id) {
        await prisma.pool.update({
          where: { 
            id: donation.pool_id, 
          },
          data: {
            total_received: { increment: donation.amount },
            available_amount: { increment: donation.amount },
          },
        });
      }

      // TODO: Save to blockchain here
      // const txHash = await saveToBlockchain(donation);
      // await prisma.donation.update({
      //   where: { id: donation.id },
      //   data: { blockchain_tx_hash: txHash }
      // });

      console.log("Donation completed:", referenceCode);
    }


    // Handle failed payments
    if (eventType === "payment.failed") {
      const payment = event.data.attributes.data;
      const referenceCode = payment.attributes.metadata?.reference_code;
      
      if (referenceCode) {
        await prisma.donation.update({
          where: { reference_code: referenceCode },
          data: { status: "failed" },
        });
        console.log("Donation failed:", referenceCode);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
