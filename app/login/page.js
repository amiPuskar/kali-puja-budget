'use client';

import { useState } from 'react';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - replace with real authentication
      const mockUsers = [
        { email: 'admin@pujabudget.com', password: 'admin123', role: 'super_admin', name: 'Super Admin' },
        { email: 'president@pujabudget.com', password: 'president123', role: 'admin', name: 'President' },
        { email: 'vp@pujabudget.com', password: 'vp123', role: 'admin', name: 'Vice President' },
        { email: 'manager@pujabudget.com', password: 'manager123', role: 'admin', name: 'Manager' },
        { email: 'vm@pujabudget.com', password: 'vm123', role: 'admin', name: 'VM' },
        { email: 'member@pujabudget.com', password: 'member123', role: 'user', name: 'Member' }
      ];

      const user = mockUsers.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: Date.now(),
          email: user.email,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString()
        }));
        
        // Redirect to dashboard
        router.push('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">PB</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Puja Budget</h1>
          <p className="text-gray-600">Club Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div><strong>Super Admin:</strong> admin@pujabudget.com / admin123</div>
              <div><strong>Admin (President):</strong> president@pujabudget.com / president123</div>
              <div><strong>Admin (VP):</strong> vp@pujabudget.com / vp123</div>
              <div><strong>Admin (Manager):</strong> manager@pujabudget.com / manager123</div>
              <div><strong>Admin (VM):</strong> vm@pujabudget.com / vm123</div>
              <div><strong>User (Member):</strong> member@pujabudget.com / member123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Puskar Koley. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
