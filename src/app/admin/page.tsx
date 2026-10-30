import { redirect } from "next/navigation";

/** La administración vive en el panel (se muestra según el rol). */
export default function AdminPage() {
  redirect("/panel");
}
