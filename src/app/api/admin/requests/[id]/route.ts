import { getAvailableFunds } from "@/lib/allocation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if(!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const requestId = parseInt(id);

        const request = await prisma.beneficiaryRequest.findUnique({
            where: { id: requestId },
            include: {
                beneficiary: {
                    include: { user: true }
                },
                documents: true,
                allocations: {
                    include: {
                        pool: true,
                        donationAllocations: {
                            include: {
                                donation: true,
                            }
                        }
                    }
                }
            }
        });

        if (!request) {
            return NextResponse.json(
                { success: false, error: "Request not found!" },
                { status: 404 }
            )
        }

        // Get  available funds for allocation dropdown
        const availableFunds = await getAvailableFunds();

        // Calculate already allocated amount
        const allocatedAmount = request.allocations.reduce(
            (sum, a) => sum + a.amount,
            0
        )
        const remainingToAllocate = request.amount - allocatedAmount;

        return NextResponse.json({
            success: true,
            data: {
                request: {
                    ...request,
                    allocatedAmount,
                    remainingToAllocate,
                },
                availableFunds,
            }
        })
    } catch(error) {
        console.error("Error fetching request:", error);
        return NextResponse.json(
        { success: false, error: "Failed to fetch request" },
        { status: 500 }
        );
    }
}