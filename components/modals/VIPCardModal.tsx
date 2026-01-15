"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { UserType } from "@/models/User";
import { SubscriptionType } from "@/models/Subscription";
import Image from "next/image";
import { getSubscriptionByUserId } from "@/actions/subscription-actions";
import { toast } from "sonner";

interface VIPCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export default function VIPCardModal({
  isOpen,
  onClose,
  user,
}: VIPCardModalProps) {
  const [subscription, setSubscription] = useState<SubscriptionType | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [cardLink, setCardLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await getSubscriptionByUserId(String(user._id));
        if (response.success && response.data) {
          setSubscription(response.data);
        } else {
          toast.error(response.message || "فشل في جلب معلومات الاشتراك");
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast.error("حدث خطأ أثناء جلب معلومات الاشتراك");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && user) {
      fetchSubscription();
      // Generate card link - using subscription ID or user ID
      const baseUrl = window.location.origin;
      setCardLink(`${baseUrl}/card/${user._id}`);
    }
  }, [isOpen, user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardLink);
      setCopied(true);
      toast.success("تم نسخ الرابط بنجاح!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("فشل في نسخ الرابط");
    }
  };

  if (!user) return null;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired =
    subscription?.expiresAt && new Date(subscription.expiresAt) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>بطاقة VIP - {user.name}</DialogTitle>
          <DialogDescription>
            عرض بطاقة العميل وروابط المشاركة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* VIP Card Image */}
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src="/card.png"
              alt="VIP Card"
              fill
              className="object-contain"
              priority
            />
            {/* Overlay with user name */}
            <div className="absolute bottom-11 left-0 right-0 flex items-center justify-center">
              <div className="px-6 py-3 rounded-lg shadow-lg">
                <p className="text-md font-bold text-gray-900">
                  السيد/ة: {user.name}
                </p>
              </div>
            </div>
            {/* Expiry notice at bottom */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <p className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                صالحة لمدة شهرين
              </p>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg mb-3">معلومات العميل</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="font-semibold">{user.mobile_number || "-"}</p>
              </div>
              {user.id_number && (
                <div>
                  <p className="text-sm text-gray-600">رقم الهوية</p>
                  <p className="font-semibold">{user.id_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          {loading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : subscription ? (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg mb-3">معلومات الاشتراك</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">تاريخ البدء</p>
                  <p className="font-semibold">
                    {formatDate(subscription.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                  <p className="font-semibold">
                    {formatDate(subscription.expiresAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الحالة</p>
                  <p
                    className={`font-semibold ${
                      isExpired ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isExpired ? "منتهي" : "نشط"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-yellow-800">لا يوجد اشتراك لهذا العميل</p>
            </div>
          )}

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">رابط البطاقة</label>
            <div className="flex gap-2">
              <Input
                value={cardLink}
                readOnly
                className="flex-1"
                placeholder="رابط البطاقة"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              يمكنك نسخ هذا الرابط وإرساله للعميل على وسائل التواصل الاجتماعي
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
