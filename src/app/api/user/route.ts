import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

// GET CURRENT USER
export async function GET() {
  try {
    const session = await auth0.getSession();

    // Not logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const authUser = session.user;

    // Find user
    let user = await prisma.user.findUnique({
      where: {
        auth0Id: authUser.sub!,
      },
    });

    // Create if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          auth0Id: authUser.sub!,
          email: authUser.email!,
        },
      });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// OPTIONAL POST METHOD
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check existing user
    const existingUser =
      await prisma.user.findUnique({
        where: {
          auth0Id: body.auth0Id,
        },
      });

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        auth0Id: body.auth0Id,
        email: body.email,
      },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "User creation failed" },
      { status: 500 }
    );
  }
}