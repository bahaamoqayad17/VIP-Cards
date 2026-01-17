"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Calendar,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoresGroupedByPlace,
  checkUsageAllowed,
  recordUsage,
  getFavorites,
  toggleFavorite,
} from "@/actions/card-actions";
import { UserType } from "@/models/User";
import { SubscriptionType } from "@/models/Subscription";
import { PlaceType } from "@/models/Place";
import { CategoryType } from "@/models/Category";

interface StoreWithCategory {
  _id: string;
  name: string;
  discount: number;
  category: CategoryType;
}

interface GroupedStore {
  place: PlaceType;
  stores: StoreWithCategory[];
}

interface CardData {
  user: UserType;
  subscription: SubscriptionType;
  isExpired: boolean;
}

interface CardClientProps {
  card: {
    success: boolean;
    message: string;
    data: CardData | null;
  };
}

export default function CardClient({ card }: CardClientProps) {
  const [groupedStores, setGroupedStores] = useState<GroupedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageStates, setUsageStates] = useState<
    Record<string, { loading: boolean; used: boolean; usedAt: Date | null }>
  >({});
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<Set<string>>(
    new Set()
  );
  const [favoriteLoading, setFavoriteLoading] = useState<
    Record<string, boolean>
  >({});
  const [selectedPlace, setSelectedPlace] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const response = await getStoresGroupedByPlace();
        if (response.success) {
          setGroupedStores(response.data);
          // Initialize usage states and check for each store
          if (card.data) {
            const states: Record<
              string,
              { loading: boolean; used: boolean; usedAt: Date | null }
            > = {};
            response.data.forEach((group) => {
              group.stores.forEach((store) => {
                states[store._id] = {
                  loading: false,
                  used: false,
                  usedAt: null,
                };
              });
            });
            setUsageStates(states);
            // Check usage for all stores
            checkAllUsage(response.data);
            // Fetch favorites
            fetchFavorites();
          }
        } else {
          toast.error(response.message || "فشل في جلب المحلات");
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast.error("حدث خطأ أثناء جلب المحلات");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavorites = async () => {
    if (!card.data) return;
    try {
      const userId = String(card.data.user._id);
      const response = await getFavorites(userId);
      if (response.success) {
        setFavoriteStoreIds(new Set(response.data));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleToggleFavorite = async (storeId: string) => {
    if (!card.data) return;

    const userId = String(card.data.user._id);

    // Set loading state
    setFavoriteLoading((prev) => ({ ...prev, [storeId]: true }));

    try {
      const response = await toggleFavorite(userId, storeId);
      if (response.success) {
        // Update favorites state
        setFavoriteStoreIds((prev) => {
          const newSet = new Set(prev);
          if (response.isFavorite) {
            newSet.add(storeId);
          } else {
            newSet.delete(storeId);
          }
          return newSet;
        });
        toast.success(response.message);
      } else {
        toast.error(response.message || "فشل في تحديث المفضلة");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("حدث خطأ أثناء تحديث المفضلة");
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  const checkAllUsage = async (stores: GroupedStore[]) => {
    if (!card.data) return;

    const userId = String(card.data.user._id);
    const subscriptionId = String(card.data.subscription._id);

    // Check usage for each store
    const checks = stores.flatMap((group) =>
      group.stores.map(async (store) => {
        const response = await checkUsageAllowed(
          userId,
          subscriptionId,
          store._id
        );
        if (response.success) {
          setUsageStates((prev) => ({
            ...prev,
            [store._id]: {
              loading: false,
              used: !response.allowed,
              usedAt: response.usedAt ? new Date(response.usedAt) : null,
            },
          }));
        }
      })
    );

    await Promise.all(checks);
  };

  const handleUseStore = async (storeId: string) => {
    if (!card.data) return;

    const userId = String(card.data.user._id);
    const subscriptionId = String(card.data.subscription._id);

    // Set loading state
    setUsageStates((prev) => ({
      ...prev,
      [storeId]: { ...prev[storeId], loading: true },
    }));

    try {
      // Check if allowed first
      const checkResponse = await checkUsageAllowed(
        userId,
        subscriptionId,
        storeId
      );

      if (!checkResponse.allowed) {
        toast.error(checkResponse.message || "لا يمكن استخدام هذا المحل");
        setUsageStates((prev) => ({
          ...prev,
          [storeId]: {
            loading: false,
            used: true,
            usedAt: checkResponse.usedAt
              ? new Date(checkResponse.usedAt)
              : null,
          },
        }));
        return;
      }

      // Record usage
      const response = await recordUsage(userId, subscriptionId, storeId);

      if (response.success) {
        toast.success("تم استخدام الخصم بنجاح!");
        const usedAt = response.data?.usedAt
          ? new Date(response.data.usedAt)
          : new Date();
        setUsageStates((prev) => ({
          ...prev,
          [storeId]: { loading: false, used: true, usedAt },
        }));
      } else {
        toast.error(response.message || "فشل في تسجيل الاستخدام");
        setUsageStates((prev) => ({
          ...prev,
          [storeId]: { loading: false, used: false, usedAt: null },
        }));
      }
    } catch (error) {
      console.error("Error using store:", error);
      toast.error("حدث خطأ أثناء استخدام المحل");
      setUsageStates((prev) => ({
        ...prev,
        [storeId]: { loading: false, used: false, usedAt: null },
      }));
    }
  };

  if (!card.success || !card.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Card className="w-full max-w-md border-2 border-yellow-600/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm shadow-2xl shadow-yellow-500/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-200">
                {card.message || "البطاقة غير موجودة"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, subscription, isExpired } = card.data;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Subscription Countdown Timer Component
  const SubscriptionCountdown = ({
    expiresAt,
  }: {
    expiresAt: Date | string | undefined;
  }) => {
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
      if (!expiresAt) {
        setTimeRemaining("");
        setIsExpired(true);
        return;
      }

      const updateTimer = () => {
        const now = new Date();
        const expiry = new Date(expiresAt);

        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining("00:00:00");
          setIsExpired(true);
          return;
        }

        setIsExpired(false);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeRemaining(
            `${days} يوم ${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          );
        } else {
          setTimeRemaining(
            `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          );
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt) return null;

    return (
      <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 border-2 border-yellow-600/30">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-yellow-400" />
          <p className="text-xs text-gray-400">تاريخ الانتهاء:</p>
          <p className="text-xs font-semibold text-yellow-400">
            {formatDate(expiresAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400">الوقت المتبقي:</p>
          <p
            className={`text-sm font-bold font-mono ${
              isExpired ? "text-red-400" : "text-yellow-400"
            }`}
          >
            {isExpired ? "منتهي" : timeRemaining || "00:00:00"}
          </p>
        </div>
      </div>
    );
  };

  // Countdown Timer Component - 24 hours from usage time
  const CountdownTimer = ({ usedAt }: { usedAt: Date | null }) => {
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
      if (!usedAt) {
        setTimeRemaining("");
        setIsExpired(false);
        return;
      }

      const updateTimer = () => {
        const now = new Date();
        const used = new Date(usedAt);

        // Calculate 24 hours from the usage time
        const nextAvailableTime = new Date(used);
        nextAvailableTime.setHours(nextAvailableTime.getHours() + 24);

        const diff = nextAvailableTime.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining("00:00:00");
          setIsExpired(true);
          return;
        }

        setIsExpired(false);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }, [usedAt]);

    if (!usedAt) return null;

    const usedTime = new Date(usedAt).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const nextAvailableTime = new Date(usedAt);
    nextAvailableTime.setHours(nextAvailableTime.getHours() + 24);
    const nextAvailableTimeStr = nextAvailableTime.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="mt-3 p-3 rounded-lg bg-gray-800/50 border border-yellow-600/20">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-yellow-400" />
          <p className="text-xs text-gray-400">تم الاستخدام في:</p>
          <p className="text-xs font-semibold text-yellow-400">{usedTime}</p>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-gray-400">يمكن الاستخدام مرة أخرى في:</p>
          <p className="text-xs font-semibold text-yellow-400">
            {nextAvailableTimeStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400">الوقت المتبقي:</p>
          <p
            className={`text-sm font-bold font-mono ${
              isExpired ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {isExpired ? "متاح الآن" : timeRemaining || "00:00:00"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* VIP Card Display */}
        <Card className="overflow-hidden shadow-2xl bg-transparent border-none shadow-yellow-500/30">
          <CardContent className="p-0">
            <div className="relative w-full aspect-[16/9] bg-black">
              <Image
                src="/card.png"
                alt="VIP Card"
                fill
                className="object-contain"
                priority
              />
              {/* User name overlay */}
              <div className="absolute flex items-center justify-center bottom-6 md:bottom-30 left-1/2 transform -translate-x-1/2">
                <div className="px-8 py-4 rounded-lg shadow-2xl">
                  <p className="text-xs md:text-3xl font-bold text-black text-center drop-shadow-lg">
                    السيد/ة: {user.name}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="border-4 border-yellow-600/40 bg-gradient-to-br from-black via-gray-900 to-black shadow-2xl shadow-yellow-500/20 backdrop-blur-sm">
          <CardHeader className="border-b-2 border-yellow-600/30 bg-gradient-to-r from-yellow-600/10 to-transparent">
            <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
              {isExpired ? (
                <>
                  <XCircle className="h-6 w-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="text-red-400 font-bold">الاشتراك منتهي</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                  <span className="text-yellow-400 font-bold">
                    الاشتراك نشط
                  </span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-gray-900/80 to-black/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-5 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 border-2 border-yellow-600/30 shadow-lg">
                <p className="text-sm text-gray-300 mb-2 font-medium">
                  تاريخ البدء
                </p>
                <p className="font-bold text-yellow-400 text-lg">
                  {formatDate(subscription.startDate)}
                </p>
              </div>
              <div className="p-5 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 border-2 border-yellow-600/30 shadow-lg">
                <p className="text-sm text-gray-300 mb-2 font-medium">
                  تاريخ الانتهاء
                </p>
                <p className="font-bold text-yellow-400 text-lg">
                  {formatDate(subscription.expiresAt)}
                </p>
              </div>
              {!isExpired && (
                <SubscriptionCountdown expiresAt={subscription.expiresAt} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stores by Place */}
        {loading ? (
          <Card className="border-2 border-yellow-600/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-400" />
                <p className="mt-4 text-gray-400">جاري تحميل المحلات...</p>
              </div>
            </CardContent>
          </Card>
        ) : groupedStores.length === 0 ? (
          <Card className="border-2 border-yellow-600/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-400">لا توجد محلات متاحة</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-4 border-yellow-600/40 bg-gradient-to-br from-black via-gray-900 to-black shadow-2xl shadow-yellow-500/20">
            <CardHeader className="">
              <CardTitle className="text-2xl text-yellow-400 mb-4 font-bold">
                المحلات المتاحة
              </CardTitle>

              {/* Places Filter */}
              <div className="mb-4">
                <p className="text-sm text-yellow-400 mb-3 font-semibold">
                  فلترة حسب المكان:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedPlace === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedPlace("all");
                      setSelectedCategory("all");
                    }}
                    className={
                      selectedPlace === "all"
                        ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black border-yellow-500/50 hover:from-yellow-500 hover:to-yellow-400 shadow-lg shadow-yellow-500/30 font-bold"
                        : "bg-gray-800/80 text-gray-300 border-gray-600/50 hover:bg-gray-700/80 hover:border-yellow-600/30"
                    }
                  >
                    الكل
                  </Button>
                  {Array.from(
                    new Set(
                      groupedStores.map((g) => ({
                        id: String(g.place._id),
                        name: g.place.name,
                      }))
                    )
                  ).map((place) => (
                    <Button
                      key={place.id}
                      variant={
                        selectedPlace === place.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSelectedPlace(place.id);
                        setSelectedCategory("all");
                      }}
                      className={
                        selectedPlace === place.id
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black border-yellow-500/50 hover:from-yellow-500 hover:to-yellow-400 shadow-lg shadow-yellow-500/30 font-bold"
                          : "bg-gray-800/80 text-gray-300 border-gray-600/50 hover:bg-gray-700/80 hover:border-yellow-600/30"
                      }
                    >
                      {place.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter - Always visible */}
              <div className="mt-4">
                <p className="text-sm text-yellow-400 mb-3 font-semibold">
                  فلترة حسب الفئة:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className={
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black border-yellow-500/50 hover:from-yellow-500 hover:to-yellow-400 shadow-lg shadow-yellow-500/30 font-bold"
                        : "bg-gray-800/80 text-gray-300 border-gray-600/50 hover:bg-gray-700/80 hover:border-yellow-600/30"
                    }
                  >
                    الكل
                  </Button>
                  {(() => {
                    // Get categories based on selected place
                    let categoriesToShow: Array<{
                      id: string;
                      name: string;
                      letter: string;
                    }> = [];

                    if (selectedPlace === "all") {
                      // Show all categories from all places
                      categoriesToShow = Array.from(
                        new Set(
                          groupedStores.flatMap((g) =>
                            g.stores.map((s) => ({
                              id: String(s.category._id),
                              name: s.category.name,
                              letter: s.category.letter,
                            }))
                          )
                        )
                      );
                    } else {
                      // Show only categories from selected place
                      const selectedPlaceGroup = groupedStores.find(
                        (g) => String(g.place._id) === selectedPlace
                      );
                      if (selectedPlaceGroup) {
                        categoriesToShow = Array.from(
                          new Set(
                            selectedPlaceGroup.stores.map((s) => ({
                              id: String(s.category._id),
                              name: s.category.name,
                              letter: s.category.letter,
                            }))
                          )
                        );
                      }
                    }

                    return categoriesToShow.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black border-yellow-500/50 hover:from-yellow-500 hover:to-yellow-400 shadow-lg shadow-yellow-500/30 font-bold"
                            : "bg-gray-800/80 text-gray-300 border-gray-600/50 hover:bg-gray-700/80 hover:border-yellow-600/30"
                        }
                      >
                        {category.letter} - {category.name}
                      </Button>
                    ));
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {(() => {
                  // Filter stores based on selected place and category
                  let filteredGroups = groupedStores;

                  // Filter by place
                  if (selectedPlace !== "all") {
                    filteredGroups = filteredGroups.filter(
                      (group) => String(group.place._id) === selectedPlace
                    );
                  }

                  // Filter by category and group by place
                  const result: Array<{
                    place: PlaceType;
                    stores: StoreWithCategory[];
                  }> = [];

                  filteredGroups.forEach((group) => {
                    const filteredStores = group.stores.filter((store) => {
                      if (selectedCategory !== "all") {
                        return String(store.category._id) === selectedCategory;
                      }
                      return true;
                    });

                    // Sort stores: favorites first, then the rest
                    const sortedStores = [...filteredStores].sort((a, b) => {
                      const aIsFavorite = favoriteStoreIds.has(a._id);
                      const bIsFavorite = favoriteStoreIds.has(b._id);
                      if (aIsFavorite && !bIsFavorite) return -1;
                      if (!aIsFavorite && bIsFavorite) return 1;
                      return 0;
                    });

                    if (sortedStores.length > 0) {
                      result.push({
                        place: group.place,
                        stores: sortedStores,
                      });
                    }
                  });

                  if (result.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-400">
                          لا توجد محلات متطابقة مع الفلتر المحدد
                        </p>
                      </div>
                    );
                  }

                  return result.map((group) => (
                    <div key={String(group.place._id)}>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        {group.place.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.stores.map((store) => {
                          const storeState = usageStates[store._id] || {
                            loading: false,
                            used: false,
                            usedAt: null,
                          };
                          const canUse = !isExpired && !storeState.used;

                          return (
                            <div
                              key={store._id}
                              className={`border-2 rounded-lg p-4 space-y-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 ${
                                favoriteStoreIds.has(store._id)
                                  ? "border-yellow-500/60 bg-gradient-to-br from-yellow-900/20 to-gray-900/80"
                                  : "border-yellow-600/20"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg text-white">
                                      {store.name}
                                    </h3>
                                    {favoriteStoreIds.has(store._id) && (
                                      <Badge className="bg-gradient-to-r from-yellow-600/40 to-yellow-500/30 text-yellow-300 border border-yellow-500/50 text-xs px-2 py-0.5">
                                        مفضل
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40 hover:from-yellow-600/40 hover:to-yellow-500/30 font-bold shadow-md">
                                      {store.category.letter}
                                    </Badge>
                                    <span className="text-sm text-yellow-400 font-bold">
                                      خصم {store.discount}%
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleFavorite(store._id)
                                  }
                                  disabled={favoriteLoading[store._id]}
                                  className={`p-1 h-8 w-8 ${
                                    favoriteStoreIds.has(store._id)
                                      ? "text-yellow-400 hover:text-yellow-300"
                                      : "text-gray-400 hover:text-yellow-400"
                                  }`}
                                >
                                  {favoriteLoading[store._id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Heart
                                      className={`h-5 w-5 ${
                                        favoriteStoreIds.has(store._id)
                                          ? "fill-yellow-400"
                                          : ""
                                      }`}
                                    />
                                  )}
                                </Button>
                              </div>
                              <Button
                                onClick={() => handleUseStore(store._id)}
                                disabled={!canUse || storeState.loading}
                                className={`w-full font-bold transition-all duration-300 ${
                                  storeState.used
                                    ? "bg-gray-800/80 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
                                    : canUse
                                    ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 shadow-xl shadow-yellow-500/40 hover:shadow-yellow-500/60 border-2 border-yellow-500/50"
                                    : "bg-gray-800/80 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
                                }`}
                                variant={
                                  storeState.used ? "secondary" : "default"
                                }
                              >
                                {storeState.loading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    جاري المعالجة...
                                  </>
                                ) : storeState.used ? (
                                  <>
                                    <CheckCircle2
                                      className="h-4 w-4 mr-2"
                                      color="green"
                                    />
                                    تم الاستخدام
                                  </>
                                ) : (
                                  "استخدام"
                                )}
                              </Button>
                              {storeState.used && (
                                <>
                                  <p className="text-xs text-center text-gray-400 mb-2">
                                    تم استخدام الخصم اليوم
                                  </p>
                                  <CountdownTimer usedAt={storeState.usedAt} />
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
