import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/auth'; // Define auth options in your app

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("🔹 Session:", session);

  if (!session) {
    return NextResponse.json({ message: "❌ Unauthorized"}, { status: 401 });
  }

  const params = await request.json();
  const url = params.url;
  const token = params.token;

  console.log(params);

  const { error } = await supabase.from('users').update({
    notification_token: token,
    notification_url: url,
  }).eq('id', session.user.uid);

  console.log(error);

  return NextResponse.json({ message: "✅ Notification URL and Token updated" });
}