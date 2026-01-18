import Client from "./client";
import { getSubscriptions } from "@/actions/subscription-actions";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();
  return <Client subscriptions={subscriptions} />;
}
