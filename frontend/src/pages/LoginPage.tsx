import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [meterNo, setMeterNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    meter_no: '',
    phone_number: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !meterNo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API for authentication
      const userData = await loginUser(email, meterNo);

      // Login successful - store user data and navigate
      login(userData);
      navigate('/dashboard');

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to server';

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.meter_no.trim() || !registerData.phone_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register user');
      }

      const newUser = await response.json();

      toast({
        title: "Registration Successful",
        description: `User ${registerData.name} has been registered with meter ${registerData.meter_no}`,
        variant: "default",
      });

      // Reset form and close modal
      setRegisterData({ name: '', email: '', meter_no: '', phone_number: '' });
      setIsRegisterModalOpen(false);

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register user';

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      </div>

      {/* Main container */}
      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">

            {/* Left side - Hero section */}
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1 animate-fade-in">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Umeme Smart Meter
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light">
                  Intelligent Energy Management
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto lg:mx-0">
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Monitor your energy consumption in real-time, track usage patterns, and optimize your power efficiency with our advanced smart meter system.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Real-time Monitoring
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Secure & Reliable
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  24/7 Access
                </div>
              </div>
            </div>

            {/* Right side - Login form with glassmorphism */}
            <div className="order-1 lg:order-2 animate-slide-in">
              <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/70 hover:bg-white/80 transition-all duration-300">
                <CardHeader className="space-y-3 pb-6">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Sign in to access your dashboard
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="h-11 bg-white/50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meterNo" className="text-sm font-medium text-gray-700">
                        Meter Number
                      </Label>
                      <Input
                        id="meterNo"
                        type="text"
                        placeholder="Enter your meter ID"
                        value={meterNo}
                        onChange={(e) => setMeterNo(e.target.value)}
                        disabled={isLoading}
                        required
                        className="h-11 bg-white/50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Register User Button */}
                  <div className="mt-6 pt-6 border-t border-gray-200/60">
                    <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 border-gray-300 bg-white/50 hover:bg-white/80 text-gray-700 font-medium transition-all duration-300"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create New Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/95">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-gray-900">Create Account</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Register a new user to the Umeme Smart Meter system
                          </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleRegister} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="registerName" className="text-sm font-medium text-gray-700">
                              Full Name
                            </Label>
                            <Input
                              id="registerName"
                              type="text"
                              placeholder="John Doe"
                              value={registerData.name}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                              disabled={isRegistering}
                              required
                              className="h-11 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700">
                              Email Address
                            </Label>
                            <Input
                              id="registerEmail"
                              type="email"
                              placeholder="john@example.com"
                              value={registerData.email}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                              disabled={isRegistering}
                              required
                              className="h-11 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="registerMeterNo" className="text-sm font-medium text-gray-700">
                              Meter Number
                            </Label>
                            <Input
                              id="registerMeterNo"
                              type="text"
                              placeholder="MTR-12345"
                              value={registerData.meter_no}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, meter_no: e.target.value }))}
                              disabled={isRegistering}
                              required
                              className="h-11 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="registerPhonenumber" className="text-sm font-medium text-gray-700">
                              Phone Number
                            </Label>
                            <Input
                              id="registerPhonenumber"
                              type="text"
                              placeholder="+1 (555) 000-0000"
                              value={registerData.phone_number}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, phone_number: e.target.value }))}
                              disabled={isRegistering}
                              required
                              className="h-11 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsRegisterModalOpen(false)}
                              disabled={isRegistering}
                              className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isRegistering}
                              className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                            >
                              {isRegistering ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Creating...
                                </>
                              ) : (
                                'Create Account'
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;