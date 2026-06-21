import { redirect } from "next/navigation";
import { WIDGET_TYPE_KEYS } from "@/widgets/meta";

// The "Widgets" sidebar group expands to per-type pages; this index just sends
// you to the first type.
export default function AdminWidgetsIndex() {
  redirect(`/admin/widgets/${WIDGET_TYPE_KEYS[0]}`);
}
