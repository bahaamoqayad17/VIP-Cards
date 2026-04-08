"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  Mail,
  Phone,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { recordUsage, toggleFavorite } from "@/actions/card-actions";
import { UserType } from "@/models/User";
import { SubscriptionType } from "@/models/Subscription";
import { PlaceType } from "@/models/Place";
import { CategoryType } from "@/models/Category";

interface StoreWithCategory {
  _id: string;
  name: string;
  discount: number;
  address: string;
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

interface UsageState {
  loading: boolean;
  used: boolean;
  usedAt: Date | null;
}

interface CardClientProps {
  card: {
    success: boolean;
    message: string;
    data: CardData | null;
  };
  initialGroupedStores: GroupedStore[];
  initialFavoriteStoreIds: string[];
  initialUsageStates: Record<string, UsageState>;
}

const RENEWAL_PHONE_NUMBER = "+972567681022";

function formatDate(date: Date | string | undefined) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SubscriptionCountdown({
  expiresAt,
}: {
  expiresAt: Date | string | undefined;
}) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const expiresAtKey =
    expiresAt == null
      ? null
      : typeof expiresAt === "string"
        ? expiresAt
        : expiresAt.getTime();

  useEffect(() => {
    if (!expiresAt) return;

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
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(
          `${days} يوم ${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
        return;
      }

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    const timeout = setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [expiresAt, expiresAtKey]);

  if (!expiresAt) return null;

  return (
    <div className="rounded-lg border-2 border-yellow-600/30 bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-yellow-400" />
        <p className="text-xs text-gray-400">تاريخ الانتهاء:</p>
        <p className="text-xs font-semibold text-yellow-400">
          {formatDate(expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-400">الوقت المتبقي:</p>
        <p
          className={`font-mono text-sm font-bold ${
            isExpired ? "text-red-400" : "text-yellow-400"
          }`}
        >
          {isExpired ? "منتهي" : timeRemaining || "00:00:00"}
        </p>
      </div>
    </div>
  );
}

function CountdownTimer({ usedAt }: { usedAt: Date | null }) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const usedAtKey = usedAt?.getTime() ?? null;

  useEffect(() => {
    if (!usedAt) return;

    const updateTimer = () => {
      const now = new Date();
      const used = new Date(usedAt);
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
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    const timeout = setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [usedAt, usedAtKey]);

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
    <div className="mt-3 rounded-lg border border-yellow-600/20 bg-gray-800/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Clock className="h-4 w-4 text-yellow-400" />
        <p className="text-xs text-gray-400">تم الاستخدام في:</p>
        <p className="text-xs font-semibold text-yellow-400">{usedTime}</p>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs text-gray-400">يمكن الاستخدام مرة أخرى في:</p>
        <p className="text-xs font-semibold text-yellow-400">
          {nextAvailableTimeStr}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-400">الوقت المتبقي:</p>
        <p
          className={`font-mono text-sm font-bold ${
            isExpired ? "text-green-400" : "text-yellow-400"
          }`}
        >
          {isExpired ? "متاح الآن" : timeRemaining || "00:00:00"}
        </p>
      </div>
    </div>
  );
}

export default function CardClient({
  card,
  initialGroupedStores,
  initialFavoriteStoreIds,
  initialUsageStates,
}: CardClientProps) {
  const [groupedStores] = useState<GroupedStore[]>(initialGroupedStores);
  const [usageStates, setUsageStates] =
    useState<Record<string, UsageState>>(initialUsageStates);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<Set<string>>(
    () => new Set(initialFavoriteStoreIds),
  );
  const [favoriteLoading, setFavoriteLoading] = useState<
    Record<string, boolean>
  >({});
  const [selectedPlace, setSelectedPlace] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [usagePromptStore, setUsagePromptStore] =
    useState<StoreWithCategory | null>(null);

  if (!card.success || !card.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md border-2 border-yellow-600/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl shadow-yellow-500/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <p className="text-lg font-semibold text-gray-200">
                  {card.message || "البطاقة غير موجودة"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user, subscription, isExpired } = card.data;

  const handleToggleFavorite = async (storeId: string) => {
    const userId = String(user._id);

    setFavoriteLoading((prev) => ({ ...prev, [storeId]: true }));

    try {
      const response = await toggleFavorite(userId, storeId);

      if (!response.success) {
        toast.error(response.message || "فشل في تحديث المفضلة");
        return;
      }

      setFavoriteStoreIds((prev) => {
        const next = new Set(prev);
        if (response.isFavorite) {
          next.add(storeId);
        } else {
          next.delete(storeId);
        }
        return next;
      });

      toast.success(response.message);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("حدث خطأ أثناء تحديث المفضلة");
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  const openUsagePrompt = (store: StoreWithCategory) => {
    if (isExpired) return;

    const storeState = usageStates[store._id];
    if (storeState?.used || storeState?.loading) return;

    setUsagePromptStore(store);
  };

  const handleUsageDecision = (usedDiscount: boolean) => {
    if (!usagePromptStore) return;

    const storeId = usagePromptStore._id;
    const usedAt = new Date();

    setUsagePromptStore(null);
    setUsageStates((prev) => ({
      ...prev,
      [storeId]: { loading: false, used: true, usedAt },
    }));
    toast.success("تم تسجيل الاستخدام بنجاح");

    void recordUsage(
      String(user._id),
      String(subscription._id),
      storeId,
      usedDiscount,
    )
      .then((response) => {
        if (response.success) return;

        if (response.message?.includes("بالفعل")) {
          toast.warning(response.message);
          return;
        }

        toast.error(response.message || "فشل في تسجيل الاستخدام");
        setUsageStates((prev) => ({
          ...prev,
          [storeId]: { loading: false, used: false, usedAt: null },
        }));
      })
      .catch((error) => {
        console.error("Error using store:", error);
        toast.error("حدث خطأ أثناء استخدام المحل");
        setUsageStates((prev) => ({
          ...prev,
          [storeId]: { loading: false, used: false, usedAt: null },
        }));
      });
  };

  const filteredGroups = groupedStores
    .filter((group) => {
      if (selectedPlace === "all") return true;
      return String(group.place._id) === selectedPlace;
    })
    .map((group) => {
      const filteredStores = group.stores.filter((store) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        return (
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query)
        );
      });

      const sortedStores = [...filteredStores].sort((a, b) => {
        const aIsFavorite = favoriteStoreIds.has(a._id);
        const bIsFavorite = favoriteStoreIds.has(b._id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
      });

      return {
        place: group.place,
        stores: sortedStores,
      };
    })
    .filter((group) => group.stores.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="overflow-hidden border-none bg-transparent shadow-2xl shadow-yellow-500/30">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] w-full bg-black">
              <Image
                src="/card.png"
                alt="VIP Card"
                fill
                className="object-contain"
                priority
              />
            </div>
          </CardContent>
        </Card>

        {!isExpired && (
          <div className="border-t-2 border-yellow-600/30 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-black p-5 md:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-yellow-400/90">
            <User className="h-4 w-4" />
            بيانات العضو
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-yellow-600/20 bg-gray-800/60 p-3 transition-colors hover:border-yellow-600/40">
              <div className="flex-shrink-0 rounded-lg bg-yellow-600/20 p-2">
                <User className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-xs text-gray-500">الاسم</p>
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
              </div>
            </div>

            {user.email && (
              <div className="flex items-center gap-3 rounded-lg border border-yellow-600/20 bg-gray-800/60 p-3 transition-colors hover:border-yellow-600/40">
                <div className="flex-shrink-0 rounded-lg bg-yellow-600/20 p-2">
                  <Mail className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs text-gray-500">
                    البريد الإلكتروني
                  </p>
                  <p className="truncate text-sm font-semibold text-white">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {user.mobile_number && (
              <div className="flex items-center gap-3 rounded-lg border border-yellow-600/20 bg-gray-800/60 p-3 transition-colors hover:border-yellow-600/40">
                <div className="flex-shrink-0 rounded-lg bg-yellow-600/20 p-2">
                  <Phone className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs text-gray-500">رقم الجوال</p>
                  <p
                    className="truncate text-sm font-semibold text-white"
                    dir="ltr"
                  >
                    {user.mobile_number}
                  </p>
                </div>
              </div>
            )}

            {user.id_number && (
              <div className="flex items-center gap-3 rounded-lg border border-yellow-600/20 bg-gray-800/60 p-3 transition-colors hover:border-yellow-600/40">
                <div className="flex-shrink-0 rounded-lg bg-yellow-600/20 p-2">
                  <CreditCard className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs text-gray-500">رقم الهوية</p>
                  <p
                    className="truncate text-sm font-semibold text-white"
                    dir="ltr"
                  >
                    {user.id_number}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(user.email || user.mobile_number || user.id_number) && (
            <p className="mt-3 text-center text-xs text-gray-500">
              تُعرض فقط البيانات المسجلة في حسابك
            </p>
          )}
          </div>
        )}

        {!isExpired &&
          (groupedStores.length === 0 ? (
            <Card className="border-2 border-yellow-600/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-xl backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="py-8 text-center">
                  <p className="text-gray-400">لا توجد محلات متاحة</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-4 border-yellow-600/40 bg-gradient-to-br from-black via-gray-900 to-black shadow-2xl shadow-yellow-500/20">
              <CardHeader>
                <CardTitle className="mb-4 text-2xl font-bold text-yellow-400">
                  المحلات المتاحة
                </CardTitle>

                <div className="mb-4">
                  <p className="mb-3 text-sm font-semibold text-yellow-400">
                    فلترة حسب المكان:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedPlace === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedPlace("all");
                        setSearchQuery("");
                      }}
                      className={
                        selectedPlace === "all"
                          ? "border-yellow-500/50 bg-gradient-to-r from-yellow-600 to-yellow-500 font-bold text-black shadow-lg shadow-yellow-500/30 hover:from-yellow-500 hover:to-yellow-400"
                          : "border-gray-600/50 bg-gray-800/80 text-gray-300 hover:border-yellow-600/30 hover:bg-gray-700/80"
                      }
                    >
                      الكل
                    </Button>

                    {groupedStores.map((group) => (
                      <Button
                        key={String(group.place._id)}
                        variant={
                          selectedPlace === String(group.place._id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedPlace(String(group.place._id));
                          setSearchQuery("");
                        }}
                        className={
                          selectedPlace === String(group.place._id)
                            ? "border-yellow-500/50 bg-gradient-to-r from-yellow-600 to-yellow-500 font-bold text-black shadow-lg shadow-yellow-500/30 hover:from-yellow-500 hover:to-yellow-400"
                            : "border-gray-600/50 bg-gray-800/80 text-gray-300 hover:border-yellow-600/30 hover:bg-gray-700/80"
                        }
                      >
                        {group.place.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-3 text-sm font-semibold text-yellow-400">
                    البحث في المحلات:
                  </p>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="ابحث عن محل بالاسم أو العنوان..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-gray-600/50 bg-gray-800/80 pr-10 text-white focus:border-yellow-600/50 focus:ring-yellow-600/20"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-6">
                  {filteredGroups.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-400">
                        لا توجد محلات مطابقة مع الفلتر المحدد
                      </p>
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      <div key={String(group.place._id)}>
                        <h3 className="mb-4 text-lg font-semibold text-yellow-400">
                          {group.place.name}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {group.stores.map((store) => {
                            const storeState = usageStates[store._id] || {
                              loading: false,
                              used: false,
                              usedAt: null,
                            };
                            const canUse = !storeState.used;

                            return (
                              <div
                                key={store._id}
                                className={`space-y-3 rounded-lg border-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-yellow-500/40 hover:shadow-yellow-500/10 ${
                                  favoriteStoreIds.has(store._id)
                                    ? "border-yellow-500/60 bg-gradient-to-br from-yellow-900/20 to-gray-900/80"
                                    : "border-yellow-600/20"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                      <h3 className="text-lg font-semibold text-white">
                                        {store.name}
                                      </h3>
                                      {favoriteStoreIds.has(store._id) && (
                                        <Badge className="border border-yellow-500/50 bg-gradient-to-r from-yellow-600/40 to-yellow-500/30 px-2 py-0.5 text-xs text-yellow-300">
                                          مفضل
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="mb-2 mt-1 flex items-center gap-2">
                                      <Badge className="border-2 border-yellow-500/40 bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 font-bold text-yellow-400 shadow-md hover:from-yellow-600/40 hover:to-yellow-500/30">
                                        {store.category.letter}
                                      </Badge>
                                      <span className="text-sm font-bold text-yellow-400">
                                        خصم {store.discount}%
                                      </span>
                                    </div>

                                    {store.address && (
                                      <div className="mt-2">
                                        <p className="mb-1 text-xs text-gray-400">
                                          العنوان:
                                        </p>
                                        <p className="text-sm text-gray-300">
                                          {store.address}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleFavorite(store._id)
                                    }
                                    disabled={favoriteLoading[store._id]}
                                    className={`h-8 w-8 p-1 ${
                                      favoriteStoreIds.has(store._id)
                                        ? "text-yellow-400 hover:text-yellow-300"
                                        : "text-gray-400 hover:text-yellow-400"
                                    }`}
                                  >
                                    <Heart
                                      className={`h-5 w-5 ${
                                        favoriteStoreIds.has(store._id)
                                          ? "fill-yellow-400"
                                          : ""
                                      }`}
                                    />
                                  </Button>
                                </div>

                                <Button
                                  onClick={() => openUsagePrompt(store)}
                                  disabled={!canUse || storeState.loading}
                                  className={`w-full border-2 font-bold transition-all duration-300 ${
                                    storeState.used
                                      ? "cursor-not-allowed border-gray-700 bg-gray-800/80 text-gray-500"
                                      : "border-yellow-500/50 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-xl shadow-yellow-500/40 hover:from-yellow-500 hover:to-yellow-400 hover:shadow-yellow-500/60"
                                  }`}
                                  variant={
                                    storeState.used ? "secondary" : "default"
                                  }
                                >
                                  {storeState.used ? (
                                    <>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      تم الاستخدام
                                    </>
                                  ) : (
                                    "استخدام"
                                  )}
                                </Button>

                                {storeState.used && (
                                  <>
                                    <p className="mb-2 text-center text-xs text-gray-400">
                                      تم استخدام الخصم اليوم
                                    </p>
                                    <CountdownTimer
                                      usedAt={storeState.usedAt}
                                    />
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

        <Card className="border-4 border-yellow-600/40 bg-gradient-to-br from-black via-gray-900 to-black shadow-2xl shadow-yellow-500/20 backdrop-blur-sm">
          <CardHeader className="border-b-2 border-yellow-600/30 bg-gradient-to-r from-yellow-600/10 to-transparent">
            <CardTitle className="flex items-center gap-3 text-xl text-yellow-400">
              {isExpired ? (
                <>
                  <XCircle className="h-6 w-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="font-bold text-red-400">الاشتراك منتهي</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                  <span className="font-bold text-yellow-400">
                    الاشتراك نشط
                  </span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-gray-900/80 to-black/80">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border-2 border-yellow-600/30 bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 p-5 shadow-lg">
                <p className="mb-2 text-sm font-medium text-gray-300">
                  تاريخ البدء
                </p>
                <p className="text-lg font-bold text-yellow-400">
                  {formatDate(subscription.startDate)}
                </p>
              </div>

              <div className="rounded-lg border-2 border-yellow-600/30 bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 p-5 shadow-lg">
                <p className="mb-2 text-sm font-medium text-gray-300">
                  تاريخ الانتهاء
                </p>
                <p className="text-lg font-bold text-yellow-400">
                  {formatDate(subscription.expiresAt)}
                </p>
              </div>

              {!isExpired && (
                <SubscriptionCountdown expiresAt={subscription.expiresAt} />
              )}
            </div>

            {isExpired && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-100">
                <p className="text-sm font-medium">
                  الاشتراك منتهي. للتجديد يرجى التواصل على الرقم
                </p>
                <a
                  href={`https://wa.me/${RENEWAL_PHONE_NUMBER}`}
                  target="_blank"
                  className="mt-2 inline-block text-lg font-bold text-yellow-400 underline underline-offset-4"
                >
                  {RENEWAL_PHONE_NUMBER}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={usagePromptStore !== null}
          onOpenChange={(open) => {
            if (!open) {
              setUsagePromptStore(null);
            }
          }}
        >
          <DialogContent
            className="max-w-md text-right"
            showCloseButton={false}
          >
            <DialogHeader className="text-right">
              <DialogTitle>تأكيد الاستخدام</DialogTitle>
              <DialogDescription>
                هل تم استخدام الخصم في
                {usagePromptStore ? ` ${usagePromptStore.name}` : ""}؟
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUsageDecision(false)}
              >
                لا
              </Button>
              <Button type="button" onClick={() => handleUsageDecision(true)}>
                نعم
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
