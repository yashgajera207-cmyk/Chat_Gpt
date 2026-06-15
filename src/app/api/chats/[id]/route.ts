
import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// =========================
// PIN CHAT
// =========================

export async function PUT(
  req: Request,

  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    // AUTH CHECK

    const session =
      await auth0.getSession();

    if (!session?.user) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // CHAT ID

    const { id } =
      await context.params;

    // BODY

    const body =
      await req.json();

    // UPDATE PIN

    const updatedChat =
      await prisma.chat.update({
        where: {
          id,
        },

        data: {
          pinned:
            body.pinned,

          updatedAt:
            new Date(),
        },
      });

    return NextResponse.json(
      updatedChat
    );

  } catch (error) {

    console.log(
      "PIN CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to pin chat",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// UPDATE CHAT TITLE
// =========================

export async function PATCH(
  req: Request,

  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    // AUTH CHECK

    const session =
      await auth0.getSession();

    if (!session?.user) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // CHAT ID

    const { id } =
      await context.params;

    // BODY

    const body =
      await req.json();

    // UPDATE CHAT

    const updatedChat =
      await prisma.chat.update({
        where: {
          id,
        },

        data: {
          title:
            body.title,

          updatedAt:
            new Date(),
        },
      });

    // CLEAR CACHE

    await redis.del(
      `messages:${id}`
    );

    return NextResponse.json(
      updatedChat
    );

  } catch (error) {

    console.log(
      "PATCH CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update chat",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// DELETE CHAT
// =========================

export async function DELETE(
  req: Request,

  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    // AUTH CHECK

    const session =
      await auth0.getSession();

    if (!session?.user) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // CHAT ID

    const { id } =
      await context.params;

    // DELETE ALL MESSAGES

    await prisma.message.deleteMany({
      where: {
        chatId: id,
      },
    });

    // DELETE CHAT

    await prisma.chat.delete({
      where: {
        id,
      },
    });

    // CLEAR CACHE

    await redis.del(
      `messages:${id}`
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.log(
      "DELETE CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete chat",
      },
      {
        status: 500,
      }
    );
  }
}

