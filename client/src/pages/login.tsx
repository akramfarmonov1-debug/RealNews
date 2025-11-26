import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { updateSEOTags } from "@/lib/seo";
import { useEffect } from "react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    updateSEOTags({
      title: "Kirish - RealNews",
      description: "RealNews administrativ paneliga kirish",
      type: "website"
    });
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: (data) => {
      toast({
        title: "Muvaffaqiyatli!",
        description: "Tizimga muvaffaqiyatli kirdingiz",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/admin");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Kirish jarayonida xatolik yuz berdi";
      setError(errorMessage);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="login-page">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            <i className="fas fa-newspaper mr-2"></i>RealNews
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tizimga kirish</h2>
          <p className="mt-2 text-sm text-gray-600">
            Administrator hisobingizga kiring
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Autentifikatsiya
            </CardTitle>
            <CardDescription>
              Foydalanuvchi nomi va parolingizni kiriting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
              {error && (
                <Alert variant="destructive" data-testid="login-error">
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
                    disabled={loginMutation.isPending}
                    data-testid="input-username"
                  />
                </div>
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
                    disabled={loginMutation.isPending}
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kirilmoqda...
                  </>
                ) : (
                  "Kirish"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hisobingiz yo'qmi?{" "}
                <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
                  Ro'yxatdan o'ting
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