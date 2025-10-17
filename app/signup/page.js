'use client';

import { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, UserPlus, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebaseConfig';
import { COLLECTIONS } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { toast } from '@/lib/toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();

  // Real-time validation functions
  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.name = 'Name can only contain letters and spaces';
        } else {
          delete errors.name;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
        
      case 'contact':
        if (!value.trim()) {
          errors.contact = 'Contact number is required';
        } else if (!/^\d{10}$/.test(value.trim())) {
          errors.contact = 'Contact must be exactly 10 digits';
        } else {
          delete errors.contact;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else if (value.length > 50) {
          errors.password = 'Password must be less than 50 characters';
        } else {
          delete errors.password;
        }
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          validateField('confirmPassword', formData.confirmPassword);
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict contact field to only digits
    if (name === 'contact') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      validateField(name, numericValue);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Comprehensive validation
      const errors = [];

      // Name validation
      if (!formData.name.trim()) {
        errors.push('Full name is required');
      } else if (formData.name.trim().length < 2) {
        errors.push('Full name must be at least 2 characters long');
      } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
        errors.push('Full name can only contain letters and spaces');
      }

      // Email validation
      if (!formData.email.trim()) {
        errors.push('Email address is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.push('Please enter a valid email address');
      }

      // Phone validation (10 digits)
      if (!formData.contact.trim()) {
        errors.push('Contact number is required');
      } else if (!/^\d{10}$/.test(formData.contact.trim())) {
        errors.push('Contact number must be exactly 10 digits');
      }

      // Password validation
      if (!formData.password) {
        errors.push('Password is required');
      } else if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      } else if (formData.password.length > 50) {
        errors.push('Password must be less than 50 characters');
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.push('Please confirm your password');
      } else if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }

      // Show all validation errors
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        setIsLoading(false);
        return;
      }

      // Check if email or contact already exists in approved members
      const membersRef = collection(db, COLLECTIONS.MEMBERS);
      const qEmail = query(membersRef, where('email', '==', formData.email.trim().toLowerCase()), limit(1));
      const qPhone = query(membersRef, where('contact', '==', formData.contact.trim()), limit(1));
      
      const [emailSnap, phoneSnap] = await Promise.all([
        getDocs(qEmail),
        getDocs(qPhone)
      ]);

      if (!emailSnap.empty) {
        toast.error('You are already a member! Please login with your credentials.');
        setIsLoading(false);
        return;
      }

      if (!phoneSnap.empty) {
        toast.error('You are already a member! Please login with your credentials.');
        setIsLoading(false);
        return;
      }

      // Check if email or contact already exists in pending members
      const pendingMembersRef = collection(db, COLLECTIONS.PENDING_MEMBERS);
      const pendingQEmail = query(pendingMembersRef, where('email', '==', formData.email.trim().toLowerCase()), limit(1));
      const pendingQPhone = query(pendingMembersRef, where('contact', '==', formData.contact.trim()), limit(1));
      
      const [pendingEmailSnap, pendingPhoneSnap] = await Promise.all([
        getDocs(pendingQEmail),
        getDocs(pendingQPhone)
      ]);

      if (!pendingEmailSnap.empty) {
        toast.error('A registration request with this email is already pending approval');
        setIsLoading(false);
        return;
      }

      if (!pendingPhoneSnap.empty) {
        toast.error('A registration request with this phone number is already pending approval');
        setIsLoading(false);
        return;
      }
      
      // Create pending member document
      const pendingMemberData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        contact: formData.contact.trim(),
        password: formData.password, // In production, hash this password
        status: 'pending', // pending, approved, rejected
        requestedAt: new Date().toISOString(),
        role: 'Member', // Default role, can be changed by admin
        approvedBy: null,
        approvedAt: null
      };

      const docRef = await addDoc(pendingMembersRef, pendingMemberData);
      console.log('Pending member document created with ID:', docRef.id);
      console.log('Pending member data:', pendingMemberData);
      
      setIsSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your registration has been submitted successfully. A Super Admin will review your application and approve it soon.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-xs text-blue-700 text-left space-y-1">
                <li>• Super Admin will review your details</li>
                <li>• You&apos;ll be assigned a role (Member by default)</li>
                <li>• You&apos;ll receive access to the system</li>
                <li>• You can then login with your credentials</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Kalimata Boys Club</h1>
          <p className="text-gray-600">Join Our Club - Register to become a member</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Registration</h2>
            <p className="text-gray-600">Fill in your details to request membership</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${fieldErrors.contact ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your 10-digit contact number"
                  maxLength="10"
                />
              </div>
              {fieldErrors.contact && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.contact}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
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
                  className={`input-field pl-10 pr-10 ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Create a password (min 6 characters)"
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
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Request Membership</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already a member?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Registration Process:</h3>
            <p className="text-xs text-blue-700">
              Your registration will be reviewed by a Super Admin. Once approved, you&apos;ll be able to login and access the system with your credentials.
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
