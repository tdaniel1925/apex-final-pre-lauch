'use client';

// =============================================
// Password Reset Modal
// Manual password reset for distributors by admins
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PasswordResetModalProps {
  distributorId: string;
  distributorName: string;
  distributorEmail: string;
  onClose: () => void;
}

export default function PasswordResetModal({
  distributorId,
  distributorName,
  distributorEmail,
  onClose,
}: PasswordResetModalProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [showPassword, setShowPassword] = useState(true); // Changed to true by default
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    // Generate a secure random password
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setShowPassword(true); // Auto-show when generated
    setCopied(false); // Reset copied state
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReset = async () => {
    // Validation
    if (!newPassword) {
      setError('Password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsResetting(true);
      setError(null);

      const response = await fetch(`/api/admin/distributors/${distributorId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          sendNotification,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      const data = await response.json();
      setSuccess(
        `Password reset successfully. ${
          data.data.notificationSent
            ? `Email notification sent to ${data.data.distributorEmail}`
            : 'No email notification sent.'
        }`
      );

      // Wait 2 seconds before closing to show success message
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-green-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successfully</h3>
            <p className="text-sm text-gray-600">{success}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manually reset password for <span className="font-semibold">{distributorName}</span>
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Distributor Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Resetting password for</p>
              <p className="text-sm font-semibold text-gray-900">{distributorName}</p>
              <p className="text-xs text-gray-600 mt-0.5">{distributorEmail}</p>
            </div>

            {/* Generate Password Button - PROMINENT */}
            <button
              type="button"
              onClick={generatePassword}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 text-base shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Generate Secure Password
            </button>

            {/* Password Display with Copy Button */}
            {newPassword && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-900">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-600 hover:text-gray-900 text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-lg font-semibold text-gray-900 break-all">
                    {showPassword ? newPassword : '••••••••••••'}
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className={`px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Click "Copy" to securely share this password with the distributor
                </p>
              </div>
            )}

            {/* Manual Entry (Optional) */}
            {!newPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">Or enter manually</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setConfirmPassword(''); // Reset confirm when manually typing
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}

            {/* Send Notification */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="send-notification"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <label htmlFor="send-notification" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Send email notification
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Notify distributor at {distributorEmail} about the password change
                </p>
              </div>
            </div>

            {/* Critical Warning */}
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">IMPORTANT - Read Before Proceeding</p>
                  <ul className="mt-2 text-xs text-red-800 space-y-1 list-disc list-inside">
                    <li><span className="font-semibold">Password will NOT be shown again</span> after closing this modal</li>
                    <li>Make sure to <span className="font-semibold">copy the password</span> before clicking "Reset Password"</li>
                    <li>The distributor's current password will be <span className="font-semibold">immediately invalidated</span></li>
                    <li>This action is <span className="font-semibold">logged in the audit trail</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isResetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
