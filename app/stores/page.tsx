import { getPlaces } from "@/actions/place-actions";
import Client from "./client";
import { getCategories } from "@/actions/category-actions";
import { getStores } from "@/actions/store-action";

export default async function StoresPage() {
  const stores = await getStores();
  const places = await getPlaces();
  const categories = await getCategories();
  return <Client stores={stores} places={places} categories={categories} />;
}
