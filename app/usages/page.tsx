import { getAllUsages } from "@/actions/card-actions";
import Client from "./client";

export const dynamic = "force-dynamic";

export default async function UsagesPage() {
  const usages = await getAllUsages();

  return <Client usages={usages} />;
}
