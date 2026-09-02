import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AdminNav from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/app");

  return (
    <div className="app-shell">
      <AppHeader email={user.email ?? ""} isAdmin />
      <main className="app-main">
        <AdminNav />
        {children}
      </main>
    </div>
  );
}
