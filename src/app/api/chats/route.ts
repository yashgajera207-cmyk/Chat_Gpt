import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

// GET ALL CHATS
export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: {
        auth0Id: session.user.sub!,
      },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        {
          pinned: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
    });

    return NextResponse.json(chats);

  } catch (error) {
    console.log("GET CHATS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// CREATE CHAT
export async function POST(req: Request) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        auth0Id: session.user.sub!,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const chat = await prisma.chat.create({
      data: {
        title:
          body.title || "New Chat",

        userId: user.id,
      },
    });

    return NextResponse.json(chat);

  } catch (error) {
    console.log("CREATE CHAT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}


