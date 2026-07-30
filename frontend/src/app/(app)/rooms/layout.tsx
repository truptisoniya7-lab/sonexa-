import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🎧 Live Rooms",
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
