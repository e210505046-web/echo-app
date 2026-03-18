import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { system, messages } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || "Bir hata oluştu.";

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: "Sunucu hatası." }, { status: 500 });
  }
}