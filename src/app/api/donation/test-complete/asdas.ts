/**
 * TEST ENDPOINT - Remove in production!
 * Manually complete a donation for testing when webhooks can't reach localhost
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const { reference_code, payment_method = "card" } = await req.json();

    if (!reference_code) {
      return NextResponse.json({ error: "reference_code is required" }, { status: 400 });
    }

    // Find the donation
    const existingDonation = await prisma.donation.findUnique({
      where: { reference_code },
    });

    if (!existingDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Calculate simulated fee (PayMongo typically charges ~2.5% + ₱15 for cards)
    const grossAmount = existingDonation.amount;
    const paymentFee = Math.round((grossAmount * 0.025 + 15) * 100) / 100; // 2.5% + ₱15
    const netAmount = grossAmount - paymentFee;

    // Update donation
    const donation = await prisma.donation.update({
      where: { reference_code },
      data: {
        status: "completed",
        payment_method: payment_method,
        payment_fee: paymentFee,
        net_amount: netAmount,
        paid_at: new Date(),
      },
      include: {
        guestDonor: true,
        registeredDonor: true,
        pool: true,
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

    // Update pool if donation has a pool
    if (donation.pool_id) {
      await prisma.pool.update({
        where: { id: donation.pool_id },
        data: {
          total_received: { increment: donation.amount },
          available_amount: { increment: donation.amount },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Donation marked as completed",
      donation: {
        id: donation.id,
        reference_code: donation.reference_code,
        amount: donation.amount,
        payment_method: donation.payment_method,
        payment_fee: donation.payment_fee,
        net_amount: donation.net_amount,
        status: donation.status,
        paid_at: donation.paid_at,
        pool: donation.pool?.name,
      },
    });
  } catch (error) {
    console.error("Test complete error:", error);
    return NextResponse.json({ error: "Failed to complete donation" }, { status: 500 });
  }
}
