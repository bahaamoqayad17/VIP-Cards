import { Suspense } from "react";
import LoginClient from "./client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          جاري التحميل...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
