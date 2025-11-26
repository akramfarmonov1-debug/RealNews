import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, User, UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { updateSEOTags } from "@/lib/seo";
import { useEffect } from "react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateSEOTags({
      title: "Ro'yxatdan o'tish - RealNews",
      description: "RealNews platformasida yangi hisob yarating",
      type: "website"
    });
  }, []);

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
      return apiRequest("POST", "/api/auth/register", userData);
    },
    onSuccess: (data) => {
      toast({
        title: "Muvaffaqiyatli!",
        description: "Hisob muvaffaqiyatli yaratildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/admin");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Ro'yxatdan o'tishda xatolik yuz berdi";
      setError(errorMessage);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    if (username.trim().length < 3) {
      setError("Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar mos kelmaydi");
      return;
    }

    registerMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="register-page">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            <i className="fas fa-newspaper mr-2"></i>RealNews
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ro'yxatdan o'tish</h2>
          <p className="mt-2 text-sm text-gray-600">
            Yangi administrator hisobi yarating
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Yangi hisob
            </CardTitle>
            <CardDescription>
              Administrator hisobingiz uchun ma'lumotlarni kiriting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
              {error && (
                <Alert variant="destructive" data-testid="register-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Foydalanuvchi nomi</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Foydalanuvchi nomingizni kiriting"
                    className="pl-10"
                    disabled={registerMutation.isPending}
                    data-testid="input-username"
                  />
                </div>
                <p className="text-xs text-gray-500">Kamida 3 ta belgi</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolingizni kiriting"
                    className="pl-10"
                    disabled={registerMutation.isPending}
                    data-testid="input-password"
                  />
                </div>
                <p className="text-xs text-gray-500">Kamida 6 ta belgi</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Parolni tasdiqlang</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolingizni qayta kiriting"
                    className="pl-10"
                    disabled={registerMutation.isPending}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  "Hisob yaratish"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hisobingiz bormi?{" "}
                <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                  Tizimga kiring
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-primary" data-testid="link-home">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}