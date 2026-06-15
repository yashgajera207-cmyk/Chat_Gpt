
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {
      chatId,
      messages,
    } = body;

    for (const message of messages) {

      await prisma.message.create({
        data: {
          role:
            message.role,

          content:
            message.content,

          chatId,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error:
          "Import failed",
      },
      {
        status: 500,
      }
    );
  }
}

