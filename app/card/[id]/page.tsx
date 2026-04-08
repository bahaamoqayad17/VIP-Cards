import CardClient from "./client";
import {
  getCardData,
  getFavorites,
  getStoresGroupedByPlace,
  getUsageStateMap,
} from "@/actions/card-actions";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const card = await getCardData(id);

  let initialGroupedStores: Awaited<
    ReturnType<typeof getStoresGroupedByPlace>
  >["data"] = [];
  let initialFavoriteStoreIds: string[] = [];
  let initialUsageStates: Record<
    string,
    { loading: boolean; used: boolean; usedAt: Date | null }
  > = {};

  if (card.success && card.data && !card.data.isExpired) {
    const userId = String(card.data.user._id);
    const subscriptionId = String(card.data.subscription._id);

    const [storesResponse, favoritesResponse, usageMapResponse] =
      await Promise.all([
        getStoresGroupedByPlace(),
        getFavorites(userId),
        getUsageStateMap(userId, subscriptionId),
      ]);

    initialGroupedStores = storesResponse.success ? storesResponse.data : [];
    initialFavoriteStoreIds = favoritesResponse.success
      ? favoritesResponse.data
      : [];

    initialUsageStates = Object.fromEntries(
      initialGroupedStores.flatMap((group) =>
        group.stores.map((store) => {
          const existingUsage = usageMapResponse.success
            ? usageMapResponse.data[store._id]
            : undefined;

          return [
            store._id,
            {
              loading: false,
              used: existingUsage?.used ?? false,
              usedAt: existingUsage?.usedAt ? new Date(existingUsage.usedAt) : null,
            },
          ];
        })
      )
    );
  }

  return (
    <CardClient
      card={card}
      initialGroupedStores={initialGroupedStores}
      initialFavoriteStoreIds={initialFavoriteStoreIds}
      initialUsageStates={initialUsageStates}
    />
  );
}
