import CardClient from "./client";
import { getCardData } from "@/actions/card-actions";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const card = await getCardData(id);

  return <CardClient card={card} />;
}
