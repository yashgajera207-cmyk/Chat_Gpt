import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(
  req: Request,

  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    // =========================
    // GET CHAT ID
    // =========================

    const { id } =
      await context.params;

    // =========================
    // REDIS CACHE KEY
    // =========================

    const cacheKey =
      `messages:${id}`;

    // =========================
    // CHECK CACHE
    // =========================

    const cachedMessages =
      await redis.get(cacheKey);

    // =========================
    // RETURN CACHE
    // =========================

    if (cachedMessages) {

      return NextResponse.json({
        success: true,

        cached: true,

        messages:
          JSON.parse(
            cachedMessages
          ),
      });
    }

    // =========================
    // DATABASE QUERY
    // =========================

    const messages =
      await prisma.message.findMany({
        where: {
          chatId: id,
        },

        orderBy: {
          createdAt: "asc",
        },
      });

    // =========================
    // FORMAT MESSAGES
    // =========================

    const formattedMessages =
      messages.map((msg) => ({
        id: msg.id,

        role: msg.role,

        content: msg.content,

        timestamp:
          msg.createdAt,
      }));

    // =========================
    // SAVE CACHE
    // =========================

    await redis.set(
      cacheKey,

      JSON.stringify(
        formattedMessages
      ),

      "EX",

      300
    );

    // =========================
    // RETURN RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      cached: false,

      messages:
        formattedMessages,
    });

  } catch (error) {

    console.log(
      "LOAD MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load messages",
      },
      {
        status: 500,
      }
    );
  }
}