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
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  // https://2bcc4c590e78.ngrok.app
  // const config = {
  //   "accountAssociation": {
  //     "header": "eyJmaWQiOjU3NywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGQ0NTBCRjcwOWRjMGM5MjBEZDNFNjZkRDFiOTI0NzdkMThhMTE0OUQifQ",
  //     "payload": "eyJkb21haW4iOiIyYmNjNGM1OTBlNzgubmdyb2suYXBwIn0",
  //     "signature": "MHg1NTBhNTk5ZDM3MjBlN2Y0N2FlNTlmMzczOTRiNTNiN2IyNTQ1MGFjNDllZTY0YTFjMGQ5NjBiYjc5ODU2ZTc1MTQ0YTE1N2ZmYzIyYzA2YzdlNzFkM2VhMzhjNWM5MGVkY2Y5NjhkNjdhY2UwM2JhMDZhYjg0YWNkZWQ3MTdiYTFi"
  //   },
  //   frame: {
  //     version: "1",
  //     name: "Alfaca Test",
  //     iconUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//alfaca.png`,
  //     homeUrl: appUrl,
  //     imageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//og-image.png`,
  //     buttonTitle: "Launch Alfaca",
  //     splashImageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//alfaca.png`,
  //     splashBackgroundColor: "#111111",
  //     webhookUrl: `${appUrl}/api/webhook`,
  //   },
  // };

  return Response.json(config);
}
