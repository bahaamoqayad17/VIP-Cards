import { getPlaces } from "@/actions/place-actions";
import Client from "./client";

export const dynamic = "force-dynamic";

export default async function PlacesPage() {
  const places = await getPlaces();
  return <Client places={places} />;
}
