import React from 'react';
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Save,
  ShieldCheck,
} from 'lucide-react';

import { BrandSettings } from '../../../types';
import { Logo } from '../../brand/Logo';

interface SettingsPanelProps {
  localSettings: BrandSettings;
  setLocalSettings: React.Dispatch<
    React.SetStateAction<BrandSettings>
  >;

  settingsSavedFeedback: boolean;

  logoInputRef: React.RefObject<HTMLInputElement | null>;

  handleLogoFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  handleSaveBoutiqueSettings: (
    e?: React.FormEvent
  ) => void;

  handleChangePassword?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  localSettings,
  setLocalSettings,
  settingsSavedFeedback,
  logoInputRef,
  handleLogoFileUpload,
  handleSaveBoutiqueSettings,
  handleChangePassword,
}) => {
  /* =========================
     PASSWORD STATE
  ========================= */

  const [currentPassword, setCurrentPassword] =
    React.useState('');

  const [newPassword, setNewPassword] =
    React.useState('');

  const [confirmPassword, setConfirmPassword] =
    React.useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    React.useState(false);

  const [showNewPassword, setShowNewPassword] =
    React.useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState(false);

  const [passwordLoading, setPasswordLoading] =
    React.useState(false);

  const [passwordSuccess, setPasswordSuccess] =
    React.useState(false);

  const [passwordError, setPasswordError] =
    React.useState('');

  /* =========================
     PASSWORD HANDLER
  ========================= */

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword.trim()) {
      setPasswordError(
        'Please enter your current password.'
      );
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError(
        'Please enter your new password.'
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        'New password must be at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New passwords do not match.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'New password must be different from your current password.'
      );
      return;
    }

    if (!handleChangePassword) {
      setPasswordError(
        'Password change service is not configured.'
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await handleChangePassword(
        currentPassword,
        newPassword
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setPasswordSuccess(true);
    } catch (error: any) {
      setPasswordError(
        error?.message ||
          'Unable to change password. Please try again.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">

      {/* =====================================================
          STORE SETTINGS FORM
      ===================================================== */}

      <form
        onSubmit={handleSaveBoutiqueSettings}
        className="space-y-6"
      >

        {/* ===================================================
            BRAND LOGO
        =================================================== */}

        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">

          <div className="pb-3 border-b border-rose-100">

            <h4 className="font-serif font-bold text-base text-[#241B20]">
              Brand Logo &amp; Visual Identity
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Upload your custom boutique logo image to
              appear in navigation, footer, and invoice headers.
            </p>

          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">

            {/* Logo Preview */}

            <div className="w-24 h-24 rounded-2xl bg-rose-50 border-2 border-dashed border-rose-200 flex items-center justify-center p-2 relative shrink-0 overflow-hidden">

              {localSettings.customLogoUrl ? (

                <img
                  src={localSettings.customLogoUrl}
                  alt="Custom Logo"
                  className="w-full h-full object-contain"
                />

              ) : (

                <div className="text-center">

                  <Logo
                    variant="icon-only"
                    size="sm"
                  />

                  <span className="text-[9px] text-[#8C5D6C] font-semibold block mt-1">
                    Default Logo
                  </span>

                </div>

              )}

            </div>

            {/* Logo Controls */}

            <div className="space-y-2.5 flex-1">

              <div className="flex items-center gap-2 flex-wrap">

                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    logoInputRef.current?.click()
                  }
                  className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >

                  <Camera className="w-3.5 h-3.5" />

                  Upload Logo Image

                </button>

                {localSettings.customLogoUrl && (

                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        customLogoUrl: '',
                      }))
                    }
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reset to Default
                  </button>

                )}

              </div>

              <div>

                <label className="text-[11px] text-[#8C5D6C] block mb-1">
                  Or paste logo image URL directly:
                </label>

                <input
                  type="url"
                  placeholder="https://example.com/brand-logo.png"
                  value={
                    localSettings.customLogoUrl || ''
                  }
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      customLogoUrl: e.target.value,
                    }))
                  }
                  className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
                />

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            STORE INFORMATION
        =================================================== */}

        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-5">

          <div className="pb-3 border-b border-rose-100">

            <h4 className="font-serif font-bold text-base text-[#241B20]">
              Store Information
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Manage your boutique information displayed
              throughout the storefront.
            </p>

          </div>


          {/* Brand Name */}

          <div>

            <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
              Brand Name
            </label>

            <input
              type="text"
              value={localSettings.brandName}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  brandName: e.target.value,
                }))
              }
              className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
            />

          </div>


          {/* Tagline */}

          <div>

            <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
              Tagline / Subtitle
            </label>

            <input
              type="text"
              value={localSettings.tagline}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  tagline: e.target.value,
                }))
              }
              className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
            />

          </div>


          {/* WhatsApp + Phone */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
                WhatsApp Number
              </label>

              <input
                type="text"
                value={localSettings.whatsappNumber}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    whatsappNumber: e.target.value,
                  }))
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

            </div>

            <div>

              <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
                Formatted Phone
              </label>

              <input
                type="text"
                value={localSettings.formattedPhone}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    formattedPhone: e.target.value,
                  }))
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

            </div>

          </div>


          {/* Email + Address */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
                Official Email
              </label>

              <input
                type="email"
                value={localSettings.email}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

            </div>

            <div>

              <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
                Location / Address
              </label>

              <input
                type="text"
                value={localSettings.address || ''}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

            </div>

          </div>


          {/* TikTok + Instagram */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
                TikTok Handle
              </label>

              <input
                type="text"
                value={localSettings.tiktokHandle}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    tiktokHandle: e.target.value,
                  }))
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

            </div>

            <div>

              <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
                Instagram Handle
              </label>

              <input
                type="text"
                value={localSettings.instagramHandle}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    instagramHandle: e.target.value,
                  }))
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

            </div>

          </div>


          {/* Announcement */}

          <div>

            <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
              Top Announcement Bar Notice
            </label>

            <input
              type="text"
              value={localSettings.announcementText}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  announcementText: e.target.value,
                }))
              }
              className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
            />

          </div>


          {/* Rental */}

          <div className="pt-4 border-t border-rose-100">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h4 className="font-serif font-bold text-sm text-[#241B20]">
                  Future Capability: Buy + Rent Mode
                </h4>

                <p className="text-xs text-[#5A4550] mt-0.5">
                  Architectural switch for bridal rental
                  inquiry workflow.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    enableRentalMode:
                      !prev.enableRentalMode,
                  }))
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  localSettings.enableRentalMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-rose-100 text-[#9E315A]'
                }`}
              >

                {localSettings.enableRentalMode
                  ? 'Enabled'
                  : 'Disabled'}

              </button>

            </div>

          </div>

        </div>


        {/* ===================================================
            SAVE STORE SETTINGS
        =================================================== */}

        <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="text-xs text-[#8C5D6C]">
            Changes will take effect immediately across
            all storefront pages.
          </div>

          <button
            type="submit"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold shadow-md transition-colors ${
              settingsSavedFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-[#9E315A] hover:bg-[#832247] text-white'
            }`}
          >

            {settingsSavedFeedback ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            <span>
              {settingsSavedFeedback
                ? 'Settings Saved Successfully!'
                : 'Save Changes'}
            </span>

          </button>

        </div>

      </form>


      {/* =====================================================
          CHANGE PASSWORD
      ===================================================== */}

      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-5">

        {/* Header */}

        <div className="flex items-start gap-3 pb-4 border-b border-rose-100">

          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#9E315A]" />
          </div>

          <div>

            <h4 className="font-serif font-bold text-base text-[#241B20]">
              Account Security
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-0.5">
              Change your administrator password to
              keep your account secure.
            </p>

          </div>

        </div>


        {/* Password Fields */}

        <div className="space-y-4">

          {/* Current Password */}

          <div>

            <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
              Current Password
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5D6C]" />

              <input
                type={
                  showCurrentPassword
                    ? 'text'
                    : 'password'
                }
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                placeholder="Enter your current password"
                autoComplete="current-password"
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5D6C] hover:text-[#9E315A]"
                aria-label={
                  showCurrentPassword
                    ? 'Hide current password'
                    : 'Show current password'
                }
              >

                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}

              </button>

            </div>

          </div>


          {/* New Password */}

          <div>

            <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
              New Password
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5D6C]" />

              <input
                type={
                  showNewPassword
                    ? 'text'
                    : 'password'
                }
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                placeholder="Enter your new password"
                autoComplete="new-password"
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5D6C] hover:text-[#9E315A]"
                aria-label={
                  showNewPassword
                    ? 'Hide new password'
                    : 'Show new password'
                }
              >

                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}

              </button>

            </div>

            <p className="text-[10px] text-[#8C5D6C] mt-1">
              Minimum 8 characters.
            </p>

          </div>


          {/* Confirm Password */}

          <div>

            <label className="text-xs font-bold text-[#9E315A] uppercase block mb-1">
              Confirm New Password
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5D6C]" />

              <input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5D6C] hover:text-[#9E315A]"
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >

                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}

              </button>

            </div>

          </div>

        </div>


        {/* Password Error */}

        {passwordError && (

          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-medium">
            {passwordError}
          </div>

        )}


        {/* Password Success */}

        {passwordSuccess && (

          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2">

            <Check className="w-4 h-4 shrink-0" />

            Password changed successfully.

          </div>

        )}


        {/* Change Password Button */}

        <div className="flex justify-end pt-1">

          <button
            type="button"
            disabled={passwordLoading}
            onClick={handlePasswordSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E315A] hover:bg-[#832247] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition-colors"
          >

            {passwordLoading ? (

              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                Updating...
              </>

            ) : passwordSuccess ? (

              <>
                <Check className="w-4 h-4" />

                Password Updated
              </>

            ) : (

              <>
                <Lock className="w-4 h-4" />

                Change Password
              </>

            )}

          </button>

        </div>

      </div>

    </div>
  );
};