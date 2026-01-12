import { getPlaces } from "@/actions/place-actions";
import Client from "./client";

export default async function PlacesPage() {
  const places = await getPlaces();
  return <Client places={places} />;
}
