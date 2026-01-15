"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Phone, Lock } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile_number, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (data.status) {
        toast.success("تم تسجيل الدخول بنجاح!");
        // Redirect to the original page or dashboard
        const redirectTo = searchParams.get("redirect") || "/";
        router.push(redirectTo);
        router.refresh();
      } else {
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
        if (data.error === "invalidMobileOrPassword") {
          errorMessage = "رقم الهاتف أو كلمة المرور غير صحيحة";
        } else if (data.error === "userNotVerified") {
          errorMessage = "حسابك غير مفعل. يرجى التواصل مع الإدارة";
        } else if (data.error === "notAdmin") {
          errorMessage = data.message || "فقط المسؤولون يمكنهم تسجيل الدخول";
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <Card className="w-full max-w-md border-4 border-yellow-600/40 bg-gradient-to-br from-black via-gray-900 to-black shadow-2xl shadow-yellow-500/20">
        <CardHeader className="border-b-2 border-yellow-600/30 bg-gradient-to-r from-yellow-600/10 to-transparent">
          <CardTitle className="text-2xl font-bold text-yellow-400 text-center">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="text-gray-400 text-center">
            أدخل بياناتك للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile_number" className="text-gray-300">
                رقم الهاتف
              </Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="mobile_number"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={mobile_number}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="pr-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={loading}
                className="border-gray-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm text-gray-300 cursor-pointer"
              >
                تذكرني
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 shadow-xl shadow-yellow-500/40 hover:shadow-yellow-500/60 border-2 border-yellow-500/50 font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
