import Client from "./client";
import { getCategories } from "@/actions/category-actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <Client categories={categories} />;
}
