'use client';

import { useState } from 'react';
import { Copy, Share2, Link, QrCode, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import Image from 'next/image';

export default function SignupLink() {
  const { isSuperAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <Link className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">Only Super Admin can generate signup links.</p>
      </div>
    );
  }

  const signupUrl = `${window.location.origin}/signup`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(signupUrl)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Our Puja Club',
          text: 'Join our New Kalimata Boys Club',
          url: signupUrl,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Signup Link"
        description="Generate and share the signup link for new members"
        showButton={false}
      />

      {/* Signup Link Card */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
            <Link className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Member Registration Link</h3>
            <p className="text-sm text-gray-600">Share this link with potential members</p>
          </div>
        </div>

        {/* URL Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={signupUrl}
              readOnly
              className="flex-1 bg-transparent text-sm font-mono text-gray-700 border-none outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy link"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyToClipboard}
            className="btn-primary flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          
          <button
            onClick={shareLink}
            className="btn-secondary flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
            <QrCode className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">QR Code</h3>
            <p className="text-sm text-gray-600">Scan to access signup page</p>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
            <Image
              src={qrCodeUrl}
              alt="Signup QR Code"
              width={192}
              height={192}
              className="w-48 h-48"
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Members can scan this QR code to access the signup page
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How to Use</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Share the Link</p>
              <p className="text-sm text-gray-600">Send the signup link to potential members via WhatsApp, email, or any messaging platform.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Member Registration</p>
              <p className="text-sm text-gray-600">Members fill out the registration form with their details and create a password.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Review & Approve</p>
              <p className="text-sm text-gray-600">Go to &quot;Pending Members&quot; page to review and approve new member requests.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Member Access</p>
              <p className="text-sm text-gray-600">Approved members can login with their email/phone and password.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Tips for Super Admins</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Share the link in club WhatsApp groups or social media</li>
          <li>• Print the QR code and display it at club events</li>
          <li>• Regularly check the &quot;Pending Members&quot; page for new requests</li>
          <li>• Assign appropriate roles when approving members</li>
          <li>• Rejected members can reapply with the same link</li>
        </ul>
      </div>
    </div>
  );
}
