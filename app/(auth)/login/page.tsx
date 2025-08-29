"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/state/auth.store";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // Demo authentication - only accepts demo@demo.com / demo
      if (data.email === "demo@demo.com" && data.password === "demo") {
        const user = {
          id: "demo-user-1",
          name: "Demo User",
          email: "demo@demo.com",
          role: "Admin",
        };
        
        login(user, "demo-token");
        toast.success("Welcome to SynqChain! 🎉");
        router.push("/dashboard");
      } else {
        toast.error("Invalid credentials. Use demo@demo.com / demo");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setValue("email", "demo@demo.com");
    setValue("password", "demo");
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">SynqChain</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Procurement. Perfected. Synq'd.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-12"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  🎯 Log in as Demo User
                </Button>
              </div>
            </form>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <strong>Demo Credentials:</strong><br/>
                Email: demo@demo.com<br/>
                Password: demo
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🎉 <strong>SynqChain MVP Ready</strong> • Complete ERP integration platform
          </p>
        </div>
      </div>
    </div>
  );
}