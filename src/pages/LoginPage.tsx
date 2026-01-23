import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Mic } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextField, PasswordField } from "@/components/form/FormFields";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (isLogin) {
        await login(data.email, data.password);
      } else {
        if (data.password !== data.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await registerUser(data.email, data.password, data.firstName || "", data.lastName || "");
      }
      
      // Navigate to the page user tried to access or dashboard
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 endpoint for Google authentication
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleMicrosoftLogin = () => {
    // Redirect to backend OAuth2 endpoint for Microsoft authentication
    window.location.href = 'http://localhost:8080/oauth2/authorization/microsoft';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-navy-light to-primary relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-glow">
                <Mic className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">V-InvoGen</h1>
                <p className="text-primary-foreground/70 text-sm">Voice-Based Invoice Generator</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center max-w-md"
          >
            <h2 className="text-4xl font-bold mb-4">
              Create Invoices with Your Voice
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed">
              Transform spoken commands into professional invoices instantly. 
              AI-powered, hands-free, and incredibly fast.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6 text-center"
          >
            {[
              { label: "Invoices Created", value: "50K+" },
              { label: "Time Saved", value: "90%" },
              { label: "Languages", value: "25+" },
            ].map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-3xl font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Mic className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">V-InvoGen</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Enter your credentials to access your dashboard" 
                : "Start creating voice-powered invoices today"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-secondary rounded-xl">
            <button
              type="button"
              onClick={() => { setIsLogin(true); handleToggleMode(); }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                isLogin 
                  ? "bg-card text-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); handleToggleMode(); }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                !isLogin 
                  ? "bg-card text-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="firstName"
                  label="First Name"
                  register={register}
                  error={errors.firstName}
                  required={!isLogin}
                  placeholder="First Name"
                  icon={<User className="w-4 h-4" />}
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  register={register}
                  error={errors.lastName}
                  required={!isLogin}
                  placeholder="Last Name"
                  icon={<User className="w-4 h-4" />}
                />
              </div>
            )}
            
            <TextField
              name="email"
              label="Email Address"
              type="email"
              register={register}
              error={errors.email}
              required
              placeholder="Email Address"
              autoComplete="email"
              icon={<Mail className="w-4 h-4" />}
            />
            
            <PasswordField
              name="password"
              label="Password"
              register={register}
              error={errors.password}
              required
              placeholder="Password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              showStrengthIndicator={!isLogin}
            />

            {!isLogin && (
              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                register={register}
                error={errors.confirmPassword}
                required
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="text-sm text-accent hover:underline font-medium"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button 
                variant="social" 
                size="lg" 
                className="w-full"
                type="button"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                variant="social" 
                size="lg" 
                className="w-full"
                type="button"
                onClick={handleMicrosoftLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Microsoft
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-accent hover:underline font-medium">Privacy Policy</a>
            {" "}and{" "}
            <a href="#" className="text-accent hover:underline font-medium">Terms of Service</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
