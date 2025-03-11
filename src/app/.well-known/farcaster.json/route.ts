export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjU3NywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGQ0NTBCRjcwOWRjMGM5MjBEZDNFNjZkRDFiOTI0NzdkMThhMTE0OUQifQ",
      payload: "eyJkb21haW4iOiJhbGZhY2EuZnVuIn0",
      signature:
        "MHg2YTczYzQwYzU1NmRjNGVlY2U1NmNmMmMwMGZhZmUxODNiMzUyYzI5M2RmYTkzNDljYTIzMzEzZWI5YjNhNGI0NWExMzJjYmM3OGI5ZDlhMWYyMzkyNDUzNmU0MmRlZTliODJhNmI5YWUxMDNkMTVjYTFhYmM5ZmM3ODQxOTE4MDFj",
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
