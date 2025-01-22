import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { database as db } from "@repo/database";

export async function checkAdmin() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Check if user exists in our database and has admin role
  const user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/"); // Redirect non-admin users to home page
  }

  return true;
} 