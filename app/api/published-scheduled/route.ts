import { NextResponse } from "next/server";
import { publishScheduledPosts } from "../../admin/actions";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishScheduledPosts();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cron publish error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}