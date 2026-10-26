import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfigured, authOptions } from "@/lib/auth";
import { isAllowedEmail } from "@/lib/access";
import Studio from "@/components/studio";
export const dynamic = "force-dynamic";
export default async function Home() {
  const session = authConfigured ? await getServerSession(authOptions) : null;
  if (!isAllowedEmail(session?.user?.email)) redirect("/login");
  return <Studio email={session!.user!.email!} />;
}
