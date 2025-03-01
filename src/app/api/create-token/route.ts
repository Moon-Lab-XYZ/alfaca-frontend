import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/auth'; // Define auth options in your app

export async function POST(request: NextRequest) {
  console.log('create token');

  console.log(request);

  const session = await getServerSession(authOptions);
  console.log(session);

  return Response.json({ success: true });
}
