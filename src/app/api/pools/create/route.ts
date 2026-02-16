
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
        if(!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized. Admin access required" },
                { status: 401 }
            )
        }



        const body = await req.json();
        const { name, description, allocated_amount, status = "active" } = body;

        // Validation
        if(!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json(
                { error: "Pool name is required" },
                { status: 400 }
            );
        }


        // Check if pool name already exists
        const existingPool = await prisma.pool.findUnique({
            where: { name }
        })

    

        if(existingPool) {
            return NextResponse.json(
                { error: "Pool name already exists" },
                { status: 409 }
            );
        }

        const pool = await prisma.pool.create({
            data: {
                name: name.trim(),
                description: description || null,
                allocated_amount: 0,
                total_received: 0, // Start at 0
                available_amount: 0 - (allocated_amount || 0),
                createdById: session.user.id,
                status: status || "active",
            },
        });


        return NextResponse.json(
            {
                success: true,
                message: "Pool created successfully",
                data: pool,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating pool:", error);
        return NextResponse.json(
        { error: "Failed to create pool" },
        { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized. Admin access required." },
                { status: 401 }
            )
        }

        const pools = await prisma.pool.findMany({
            include: { donation: true },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(
            {
                success: true,
                data: pools,
            },
            { status: 200 }
        );
    } catch(error) {
        console.error("Error fetching pools:", error);
        return NextResponse.json(
            { error: "Failed to fetch pools" },
            { status: 500 }
        )
    }
}