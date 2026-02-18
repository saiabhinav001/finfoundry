import type { Metadata } from "next";
import { MessagesPage } from "./messages-page";

export const metadata: Metadata = {
  title: "Messages — Admin",
};

export default function Page() {
  return <MessagesPage />;
}
