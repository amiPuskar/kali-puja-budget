'use client';

import { useState } from 'react';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

const MOCK_SUPER_ADMIN = {
  email: 'admin@pujabudget.com',
  password: 'admin123',
  role: 'super_admin',
  name: 'Super Admin'
};

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  // const { login } = useAuth();

  const mapRoleToAccess = (role) => {
    if (!role) return 'user';
    const r = String(role).toLowerCase();
    if (r === 'president' || r === 'vice president' || r === 'vp') return 'super_admin';
    if (r === 'manager' || r === 'vm') return 'admin';
    return 'user';
  };

  const findMemberByIdentifier = async (identifier) => {
    const membersRef = collection(db, COLLECTIONS.MEMBERS);

    // Try email match
    const qEmail = query(membersRef, where('email', '==', identifier), limit(1));
    const emailSnap = await getDocs(qEmail);
    if (!emailSnap.empty) return { id: emailSnap.docs[0].id, ...emailSnap.docs[0].data() };

    // Try contact/phone match
    const qPhone = query(membersRef, where('contact', '==', identifier), limit(1));
    const phoneSnap = await getDocs(qPhone);
    if (!phoneSnap.empty) return { id: phoneSnap.docs[0].id, ...phoneSnap.docs[0].data() };

    // No username lookup anymore
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const identifier = formData.username.trim();
      const password = formData.password;

      let member = await findMemberByIdentifier(identifier);

      // Mock super admin fallback
      if (!member && identifier.toLowerCase() === MOCK_SUPER_ADMIN.email && password === MOCK_SUPER_ADMIN.password) {
        member = {
          id: 'mock-super-admin',
          email: MOCK_SUPER_ADMIN.email,
          name: MOCK_SUPER_ADMIN.name,
          role: 'President',
          contact: ''
        };
      }

      if (!member) {
        setError('No account found for the provided mobile/email. Please check if your membership has been approved.');
        return;
      }

      if (!member.password && member.id !== 'mock-super-admin') {
        setError('Password not set. Please contact admin.');
        return;
      }

      if (member.id !== 'mock-super-admin' && member.password !== password) {
        setError('Invalid mobile/email or password');
        return;
      }

      // Check if member is active (approved)
      if (member.status && member.status !== 'active' && member.id !== 'mock-super-admin') {
        setError('Your membership is not active. Please contact admin.');
        return;
      }

      const accessRole = member.id === 'mock-super-admin' ? 'super_admin' : mapRoleToAccess(member.role);

      const userData = {
        id: member.id,
        email: member.email || '',
        name: member.name || 'User',
        role: accessRole,
        originalRole: member.role || 'Member',
        contact: member.contact || '',
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(userData));
      router.replace('/');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Kalimata Boys Club</h1>
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
            {/* Username/Mobile/Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number / Email ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Enter your mobile number or email"
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

          {/* Login Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Login Instructions:</h3>
            <p className="text-xs text-blue-700">
              Use your mobile number or email ID along with your password to sign in.
            </p>
          </div>

          {/* Signup Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Not a member yet?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Request membership
              </button>
            </p>
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
