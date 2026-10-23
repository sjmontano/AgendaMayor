import { redirect } from "next/navigation";

/** /admin se unificó en /panel (la vista cambia según el rol). */
export default function AdminPage() {
  redirect("/panel");
}
