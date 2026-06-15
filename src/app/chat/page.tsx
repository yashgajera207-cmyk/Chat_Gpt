import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";

import ChatClient from "./ChatClient";

export default async function ChatPage() {

  const session =
    await auth0.getSession();

  // Redirect BEFORE render
  if (!session?.user) {
    redirect("/");
  }

  return (
    <ChatClient
      userEmail={
        session.user.email || ""
      }
    />
  );
}