import Client from "./client";
import { getCustomers } from "@/actions/user-actions";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();
  return <Client customers={customers} />;
}
