import { Metadata } from "next";
import UserProfile from "./userProfile";

let frame = {
  version: "next",
  imageUrl: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//og-image-v2.png`,
  button: {
    title: "Launch Alfaca",
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
  frame.button.action.url = `${process.env.NEXT_PUBLIC_URL}/user/${data.id}`;

  return {
    title: "Alfaca",
    openGraph: {
      title: "Alfaca",
      description: "coin launch competition",
      images: [{
        url: `https://wqwoggfcacagsgwlxjhs.supabase.co/storage/v1/object/public/images//og-image-v2.png`,
      }]
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Profile() {
  return (<UserProfile />);
}

