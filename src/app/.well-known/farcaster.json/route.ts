export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjg3NTc0MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDI1OTFBZTE5MjA3YmUzM0JiZGI0MThhOTk5MUFEQ0I1RDY2RTg0OEYifQ",
      payload: "eyJkb21haW4iOiJhbGZhY2EuZnVuIn0",
      signature:
        "MHg3ZTBmNmY1OTA5MzliMWUyNTJkMTgzZDZhNTNlZDdjNDljOTYwNGUwZDA1YmI1MTA0ZDJiNTUwYWI4OTQ1OTM4MDNjMjBhZDI1YTkxYTYzNTdjMzk4NTZhZWE4Y2RkMzI1YjgxODIzMTMzODE3NzExOWFlMzRmYWM3OTI4MjdjYTFj",
    },
    frame: {
      version: "1",
      name: "Alfaca",
      iconUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//alfaca.png`,
      homeUrl: appUrl,
      imageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//og-image.png`,
      buttonTitle: "Launch Alfaca",
      splashImageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//alfaca.png`,
      splashBackgroundColor: "#111111",
      // webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
