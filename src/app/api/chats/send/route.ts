
import { NextResponse } from "next/server";


import mammoth from "mammoth";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";
import { redis } from "@/lib/redis";

export async function POST(
  req: Request
) {

  try {

    // =========================
    // AUTH CHECK
    // =========================

    const session =
      await auth0.getSession();

    if (!session?.user) {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // FORM DATA
    // =========================

    const formData =
      await req.formData();

    const message =
      formData.get(
        "message"
      ) as string;

    const chatId =
      formData.get(
        "chatId"
      ) as string;

    const file =
      formData.get(
        "file"
      ) as File | null;

    // =========================
    // VALIDATION
    // =========================

    if (
      (!message && !file) ||
      !chatId
    ) {

      return NextResponse.json(
        {
          error:
            "Message or file required",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // FILE READING
    // =========================

    let fileContent = "";

    if (file) {

      const bytes =
        await file.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      // TXT

      if (ext === "txt") {

        fileContent =
          buffer.toString("utf-8");
      }

      // PDF


else if (ext === "pdf") {

  const pdfParse =
    (
      await import(
        "pdf-parse/lib/pdf-parse.js"
      )
    ).default;

  const pdfData =
    await pdfParse(buffer);

  fileContent =
    pdfData.text;
}

      // DOCX

      else if (ext === "docx") {

        const result =
          await mammoth.extractRawText({
            buffer,
          });

        fileContent =
          result.value;
      }

      // UNSUPPORTED

      else {

        fileContent =
          "Unsupported file type.";
      }
    }

    // =========================
    // FIND USER
    // =========================

    const user =
      await prisma.user.findUnique({
        where: {
          auth0Id:
            session.user.sub!,
        },
      });

    if (!user) {

      return NextResponse.json(
        {
          error:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // RATE LIMIT
    // =========================

    const rateKey =
      `rate:${user.id}`;

    const requests =
      await redis.incr(rateKey);

    if (requests === 1) {

      await redis.expire(
        rateKey,
        60
      );
    }

    if (requests > 20) {

      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait.",
        },
        {
          status: 429,
        }
      );
    }

    // =========================
    // CACHE KEY
    // =========================

    const cacheKey =
      `chat:${chatId}:${message}`;

    // =========================
    // CHECK CACHE
    // =========================

    const cachedResponse =
      await redis.get(cacheKey);

    // =========================
    // SAVE USER MESSAGE
    // =========================

    await prisma.message.create({
      data: {
        role: "user",

        content:
          file
            ? `${message}\n\n📎 File: ${file.name}`
            : message,

        chatId,
      },
    });

    // =========================
    // RETURN CACHE
    // =========================

    if (cachedResponse) {

      const aiMessage =
        await prisma.message.create({
          data: {
            role:
              "assistant",

            content:
              cachedResponse,

            chatId,
          },
        });

      await redis.del(
        `messages:${chatId}`
      );

      return NextResponse.json({
        success: true,

        response:
          cachedResponse,

        messageId:
          aiMessage.id,

        chatId,

        cached: true,
      });
    }

    // =========================
    // GROQ AI
    // =========================

    const completion =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",

            content: `
User Message:
${message || "Analyze uploaded file"}

Uploaded File:
${file?.name || "No file"}

File Content:
${fileContent}
`,
          },
        ],
      });

    const aiResponse =
      completion.choices[0]
        ?.message?.content ||
      "No response";

    // =========================
    // SAVE AI MESSAGE
    // =========================

    const aiMessage =
      await prisma.message.create({
        data: {
          role:
            "assistant",

          content:
            aiResponse,

          chatId,
        },
      });

    // =========================
    // CLEAR MESSAGE CACHE
    // =========================

    await redis.del(
      `messages:${chatId}`
    );

    // =========================
    // UPDATE CHAT
    // =========================

    await prisma.chat.update({
      where: {
        id: chatId,
      },

      data: {
        updatedAt:
          new Date(),
      },
    });

    // =========================
    // SAVE CACHE
    // =========================

    await redis.set(
      cacheKey,

      aiResponse,

      "EX",

      3600
    );

    // =========================
    // RETURN RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      response:
        aiResponse,

      messageId:
        aiMessage.id,

      chatId,

      cached: false,
    });

  } catch (error) {

    console.log(
      "CHAT SEND ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

