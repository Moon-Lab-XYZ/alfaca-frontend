import { Metadata } from "next";
import StealGame from "./stealGame";

let frame = {
  version: "next",
  imageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//og-image-v2.png`,
  button: {
    title: "Steal 🦙",
    action: {
      type: "launch_frame",
      name: "Alfaca",
      url: '',
      splashImageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//alfaca.png`,
      splashBackgroundColor: "#111111",
    },
  },
};

export async function generateMetadata({params}: any): Promise<Metadata> {
  const data = await params;
  frame.button.action.url = `${process.env.NEXT_PUBLIC_URL}/token/${data.id}/steal`;

  return {
    title: "Alfaca",
    openGraph: {
      title: "Alfaca",
      description: "stolen",
      images: [{
        url: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//og-image-v2.png`,
      }]
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Game() {
  return (<StealGame />);
}

