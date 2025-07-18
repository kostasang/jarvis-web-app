'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  Home,
  Zap,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react'
import { userApi } from '@/lib/api'
import { User as UserType } from '@/types/user'
import ReCaptcha from '@/components/ReCaptcha'

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const router = useRouter()

  const fetchUserData = async () => {
    try {
      const userData = await userApi.getMe()
      setUser(userData)
      setError('')
    } catch (err: any) {
      console.error('Failed to fetch user data:', err)
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load profile. Please try refreshing the page.')
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('jarvis_token')
    if (!token) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      setIsLoading(true)
      await fetchUserData()
      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setDeleteError('Password is required to delete your account.')
      return
    }

    setIsDeleting(true)
    setDeleteError('')
    try {
      await userApi.deleteAccount(password)
      // Clear token and redirect to login
      localStorage.removeItem('jarvis_token')
      router.push('/login')
    } catch (err: any) {
      console.error('Failed to delete account:', err)
      const errorMessage = err.response?.status === 401 || err.response?.status === 422 
        ? 'Incorrect password. Please try again.' 
        : 'Failed to delete account. Please try again later.'
      setDeleteError(errorMessage)
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setPassword('')
    setShowPassword(false)
    setDeleteError('')
  }

  const handleUpdatePassword = async () => {
    // Reset previous errors
    setPasswordError('')
    
    // Validation
    if (!currentPassword.trim()) {
      setPasswordError('Current password is required.')
      return
    }
    
    if (!newPassword.trim()) {
      setPasswordError('New password is required.')
      return
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await userApi.updatePassword(currentPassword, newPassword)
      setPasswordSuccess('Password updated successfully!')
      
      // Reset form after success
      setTimeout(() => {
        handleCancelPasswordChange()
      }, 2000)
    } catch (err: any) {
      console.error('Failed to update password:', err)
      const errorMessage = err.response?.status === 401 || err.response?.status === 422 
        ? 'Current password is incorrect. Please try again.' 
        : 'Failed to update password. Please try again later.'
      setPasswordError(errorMessage)
      setIsUpdatingPassword(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPasswordError('')
    setPasswordSuccess('')
    setIsUpdatingPassword(false)
  }

  const handleUpdateEmail = async () => {
    // Reset previous errors
    setEmailError('')
    
    // Validation
    if (!newEmail.trim()) {
      setEmailError('New email is required.')
      return
    }
    
    if (!emailPassword.trim()) {
      setEmailError('Password is required to change email.')
      return
    }
    
    if (!recaptchaToken) {
      setEmailError('Please complete the reCAPTCHA verification.')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    
    if (newEmail === user?.email) {
      setEmailError('New email must be different from current email.')
      return
    }

    setIsUpdatingEmail(true)
    try {
      await userApi.updateEmail(newEmail, emailPassword, recaptchaToken)
      setEmailSuccess('Email updated successfully! Please check your new email for verification.')
      
      // Refresh user data to show new email
      await fetchUserData()
      
      // Reset form after success
      setTimeout(() => {
        handleCancelEmailChange()
      }, 3000)
    } catch (err: any) {
      console.error('Failed to update email:', err)
      const errorMessage = err.response?.status === 401 || err.response?.status === 422 
        ? 'Incorrect password or invalid email. Please try again.' 
        : 'Failed to update email. Please try again later.'
      setEmailError(errorMessage)
      setIsUpdatingEmail(false)
    }
  }

  const handleCancelEmailChange = () => {
    setShowEmailModal(false)
    setNewEmail('')
    setEmailPassword('')
    setShowEmailPassword(false)
    setEmailError('')
    setEmailSuccess('')
    setIsUpdatingEmail(false)
    setRecaptchaToken('')
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token || '')
    if (emailError && token) {
      setEmailError('')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 ml-16">
            <div className="flex items-center">
                             <button
                 onClick={() => router.push('/dashboard')}
                 className="mr-4 p-2 text-dark-400 hover:text-white transition-colors"
               >
                 <Home className="w-5 h-5" />
               </button>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-primary-500 mr-2" />
                <span className="text-xl font-bold text-white">Jarvis</span>
              </div>
              <div className="ml-6 hidden md:block">
                <span className="text-dark-400">Profile Settings</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {error}
          </div>
        )}

                 {/* Profile Header */}
         <div className="glass-card p-8 mb-8">
           <div className="flex items-center">
             <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mr-6">
               <User className="w-10 h-10 text-white" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
               <p className="text-dark-400 flex items-center gap-2">
                 <Mail className="w-4 h-4" />
                 {user.email}
               </p>
             </div>
           </div>
         </div>

                 {/* Profile Details */}
         <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* User ID */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">User ID</h3>
            </div>
            <p className="text-dark-300 font-mono text-sm break-all">{user.id}</p>
          </div>

          {/* Registration Date */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Member Since</h3>
            </div>
            <p className="text-dark-300 font-medium">{formatDate(user.dateRegistered)}</p>
            <p className="text-dark-400 text-sm mt-1">{getTimeAgo(user.dateRegistered)}</p>
          </div>

          
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </h3>
                     <div className="grid md:grid-cols-2 gap-4">
             <button 
               onClick={() => setShowEmailModal(true)}
               className="flex flex-col items-center gap-3 p-4 rounded-lg bg-dark-700/30 hover:bg-dark-700/50 transition-colors text-center"
             >
               <Mail className="w-6 h-6 text-primary-400" />
               <span className="text-white font-medium">Change Email</span>
               <span className="text-dark-400 text-xs">Update your email address</span>
             </button>
             <button 
               onClick={() => setShowPasswordModal(true)}
               className="flex flex-col items-center gap-3 p-4 rounded-lg bg-dark-700/30 hover:bg-dark-700/50 transition-colors text-center"
             >
               <Shield className="w-6 h-6 text-secondary-400" />
               <span className="text-white font-medium">Security</span>
               <span className="text-dark-400 text-xs">Change password</span>
             </button>
           </div>
        </div>

                          {/* Coming Soon Features */}
         <div className="mt-8 p-6 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 rounded-xl border border-primary-500/20">
           <h4 className="text-lg font-semibold text-white mb-2">🚀 Coming Soon</h4>
           <p className="text-dark-300 text-sm">
             Email change functionality, password reset options, and two-factor authentication.
           </p>
         </div>

         {/* Danger Zone */}
         <div className="mt-8 glass-card p-6 border-red-500/20">
           <button
             onClick={() => setShowDangerZone(!showDangerZone)}
             className="w-full flex items-center justify-between text-red-400 hover:text-red-300 transition-colors"
           >
             <h3 className="text-xl font-bold flex items-center gap-2">
               <AlertTriangle className="w-5 h-5" />
               Danger Zone
             </h3>
             {showDangerZone ? (
               <ChevronUp className="w-5 h-5" />
             ) : (
               <ChevronDown className="w-5 h-5" />
             )}
           </button>
           
           <div 
             className={`overflow-hidden transition-all duration-500 ease-in-out ${
               showDangerZone ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
             }`}
           >
             <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
               <div className="flex items-start justify-between gap-4">
                 <div>
                   <h4 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h4>
                   <p className="text-red-300 text-sm mb-3">
                     Permanently delete your account and all associated data. This action cannot be undone.
                   </p>
                   <ul className="text-red-300 text-xs space-y-1 mb-4">
                     <li>• All your hubs and devices will be unlinked</li>
                     <li>• All your data will be permanently deleted</li>
                     <li>• You will not be able to recover your account</li>
                   </ul>
                 </div>
                 <button
                   onClick={() => {
                     setShowDeleteConfirm(true)
                     setDeleteError('')
                   }}
                   disabled={isDeleting}
                   className="btn-secondary bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:text-red-300 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                 >
                   <Trash2 className="w-4 h-4" />
                   Delete Account
                 </button>
                                </div>
               </div>
             </div>
           </div>
       </main>

       {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
           <>
             <div 
               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
               onClick={() => !isDeleting && handleCancelDelete()}
             />
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="glass-card p-6 max-w-md w-full border-red-500/20">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                     <AlertTriangle className="w-6 h-6 text-red-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
                     <p className="text-red-300 text-sm">This action is irreversible</p>
                   </div>
                 </div>
                 
                 <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                   <p className="text-red-300 text-sm mb-3">
                     You are about to permanently delete your account <span className="font-mono font-bold">{user?.username}</span>.
                   </p>
                   <p className="text-red-300 text-sm font-semibold">
                     This will immediately:
                   </p>
                   <ul className="text-red-300 text-xs mt-2 space-y-1">
                     <li>• Delete all your personal data</li>
                     <li>• Unlink all connected hubs and devices</li>
                     <li>• Remove all your areas and configurations</li>
                     <li>• Sign you out permanently</li>
                   </ul>
                 </div>

                 {/* Password Input */}
                 <div className="mb-6">
                   <label className="block text-sm font-medium text-red-300 mb-2">
                     Confirm your password to proceed:
                   </label>
                   <div className="relative">
                     <input
                       type={showPassword ? 'text' : 'password'}
                       value={password}
                       onChange={(e) => {
                         setPassword(e.target.value)
                         if (deleteError) setDeleteError('')
                       }}
                       className="w-full px-3 py-2.5 bg-dark-800 border border-red-500/30 text-red-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-red-400/50"
                       placeholder="Enter your password"
                       disabled={isDeleting}
                       autoFocus
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-300 transition-colors"
                       disabled={isDeleting}
                     >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                 </div>

                 {/* Error Display */}
                 {deleteError && (
                   <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3 transition-opacity duration-300 opacity-100">
                     <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                     <div>
                       <p className="text-red-300 text-sm font-medium">Deletion Failed</p>
                       <p className="text-red-300/80 text-xs mt-1">{deleteError}</p>
                     </div>
                   </div>
                 )}

                 <div className="flex gap-3">
                   <button
                     onClick={handleCancelDelete}
                     disabled={isDeleting}
                     className="flex-1 btn-secondary disabled:opacity-50"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleDeleteAccount}
                     disabled={isDeleting || !password.trim()}
                     className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isDeleting ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         Deleting...
                       </>
                     ) : (
                       <>
                         <Trash2 className="w-4 h-4" />
                         Delete Forever
                       </>
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </>
         )}

         {/* Email Change Modal */}
         {showEmailModal && (
           <>
             <div 
               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
               onClick={() => !isUpdatingEmail && handleCancelEmailChange()}
             />
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="glass-card p-6 max-w-md w-full">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
                     <Mail className="w-6 h-6 text-primary-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-white">Change Email</h3>
                     <p className="text-dark-400 text-sm">Update your email address</p>
                   </div>
                 </div>

                 {/* Success Message */}
                 {emailSuccess && (
                   <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-start gap-3">
                     <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                       <div className="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                     <div>
                       <p className="text-green-300 text-sm font-medium">Email Updated</p>
                       <p className="text-green-300/80 text-xs mt-1">{emailSuccess}</p>
                     </div>
                   </div>
                 )}

                 {/* Error Message */}
                 {emailError && (
                   <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                     <div>
                       <p className="text-red-300 text-sm font-medium">Update Failed</p>
                       <p className="text-red-300/80 text-xs mt-1">{emailError}</p>
                     </div>
                   </div>
                 )}

                 {/* Email Form */}
                 <div className="space-y-4 mb-6">
                   {/* Current Email */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       Current Email
                     </label>
                     <input
                       type="email"
                       value={user?.email || ''}
                       className="input-field bg-dark-700/50 cursor-not-allowed"
                       disabled
                       readOnly
                     />
                   </div>

                   {/* New Email */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       New Email Address
                     </label>
                     <input
                       type="email"
                       value={newEmail}
                       onChange={(e) => {
                         setNewEmail(e.target.value)
                         if (emailError) setEmailError('')
                       }}
                       className="input-field"
                       placeholder="Enter new email address"
                       disabled={isUpdatingEmail || !!emailSuccess}
                     />
                   </div>

                   {/* Password Confirmation */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       Confirm Password
                     </label>
                     <div className="relative">
                       <input
                         type={showEmailPassword ? 'text' : 'password'}
                         value={emailPassword}
                         onChange={(e) => {
                           setEmailPassword(e.target.value)
                           if (emailError) setEmailError('')
                         }}
                         className="input-field pr-12"
                         placeholder="Enter your current password"
                         disabled={isUpdatingEmail || !!emailSuccess}
                       />
                       <button
                         type="button"
                         onClick={() => setShowEmailPassword(!showEmailPassword)}
                         className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-dark-200 transition-colors"
                         disabled={isUpdatingEmail || !!emailSuccess}
                       >
                         {showEmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                     </div>
                   </div>

                   {/* reCAPTCHA */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       Security Verification
                     </label>
                     <ReCaptcha
                       onVerify={handleRecaptchaChange}
                       onExpired={() => {
                         setRecaptchaToken('')
                         if (emailError) setEmailError('')
                       }}
                       onError={() => {
                         setRecaptchaToken('')
                         setEmailError('reCAPTCHA verification failed. Please try again.')
                       }}
                       disabled={isUpdatingEmail || !!emailSuccess}
                     />
                   </div>
                 </div>

                 {/* Buttons */}
                 <div className="flex gap-3">
                   <button
                     onClick={handleCancelEmailChange}
                     disabled={isUpdatingEmail}
                     className="flex-1 btn-secondary disabled:opacity-50"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleUpdateEmail}
                     disabled={isUpdatingEmail || !newEmail.trim() || !emailPassword.trim() || !recaptchaToken || Boolean(emailSuccess)}
                     className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isUpdatingEmail ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         Updating...
                       </>
                     ) : (
                       <>
                         <Mail className="w-4 h-4" />
                         Update Email
                       </>
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </>
         )}

         {/* Password Change Modal */}
         {showPasswordModal && (
           <>
             <div 
               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
               onClick={() => !isUpdatingPassword && handleCancelPasswordChange()}
             />
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="glass-card p-6 max-w-md w-full">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 bg-secondary-600/20 rounded-xl flex items-center justify-center">
                     <Shield className="w-6 h-6 text-secondary-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-white">Change Password</h3>
                     <p className="text-dark-400 text-sm">Update your account password</p>
                   </div>
                 </div>

                 {/* Success Message */}
                 {passwordSuccess && (
                   <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-start gap-3">
                     <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                       <div className="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                     <div>
                       <p className="text-green-300 text-sm font-medium">Password Updated</p>
                       <p className="text-green-300/80 text-xs mt-1">{passwordSuccess}</p>
                     </div>
                   </div>
                 )}

                 {/* Error Message */}
                 {passwordError && (
                   <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                     <div>
                       <p className="text-red-300 text-sm font-medium">Update Failed</p>
                       <p className="text-red-300/80 text-xs mt-1">{passwordError}</p>
                     </div>
                   </div>
                 )}

                 {/* Password Form */}
                 <div className="space-y-4 mb-6">
                   {/* Current Password */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       Current Password
                     </label>
                     <div className="relative">
                       <input
                         type={showCurrentPassword ? 'text' : 'password'}
                         value={currentPassword}
                         onChange={(e) => {
                           setCurrentPassword(e.target.value)
                           if (passwordError) setPasswordError('')
                         }}
                         className="input-field pr-12"
                         placeholder="Enter current password"
                         disabled={isUpdatingPassword || passwordSuccess}
                       />
                       <button
                         type="button"
                         onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                         className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-dark-200 transition-colors"
                         disabled={isUpdatingPassword || passwordSuccess}
                       >
                         {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                     </div>
                   </div>

                   {/* New Password */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       New Password
                     </label>
                     <div className="relative">
                       <input
                         type={showNewPassword ? 'text' : 'password'}
                         value={newPassword}
                         onChange={(e) => {
                           setNewPassword(e.target.value)
                           if (passwordError) setPasswordError('')
                         }}
                         className="input-field pr-12"
                         placeholder="Enter new password (min 8 characters)"
                         disabled={isUpdatingPassword || passwordSuccess}
                       />
                       <button
                         type="button"
                         onClick={() => setShowNewPassword(!showNewPassword)}
                         className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-dark-200 transition-colors"
                         disabled={isUpdatingPassword || passwordSuccess}
                       >
                         {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                     </div>
                   </div>

                   {/* Confirm Password */}
                   <div>
                     <label className="block text-sm font-medium text-dark-200 mb-2">
                       Confirm New Password
                     </label>
                     <div className="relative">
                       <input
                         type={showConfirmPassword ? 'text' : 'password'}
                         value={confirmPassword}
                         onChange={(e) => {
                           setConfirmPassword(e.target.value)
                           if (passwordError) setPasswordError('')
                         }}
                         className="input-field pr-12"
                         placeholder="Confirm new password"
                         disabled={isUpdatingPassword || passwordSuccess}
                       />
                       <button
                         type="button"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                         className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-dark-200 transition-colors"
                         disabled={isUpdatingPassword || passwordSuccess}
                       >
                         {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                     </div>
                   </div>

                   {/* Password Requirements */}
                   <div className="text-xs text-dark-400 space-y-1">
                     <p>Password requirements:</p>
                     <ul className="list-disc list-inside space-y-0.5 ml-2">
                       <li className={newPassword.length >= 8 ? 'text-green-400' : 'text-dark-400'}>
                         At least 8 characters
                       </li>
                       <li className={newPassword !== currentPassword && newPassword ? 'text-green-400' : 'text-dark-400'}>
                         Different from current password
                       </li>
                       <li className={newPassword === confirmPassword && newPassword ? 'text-green-400' : 'text-dark-400'}>
                         Passwords match
                       </li>
                     </ul>
                   </div>
                 </div>

                 {/* Buttons */}
                 <div className="flex gap-3">
                   <button
                     onClick={handleCancelPasswordChange}
                     disabled={isUpdatingPassword}
                     className="flex-1 btn-secondary disabled:opacity-50"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleUpdatePassword}
                     disabled={isUpdatingPassword || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || passwordSuccess}
                     className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isUpdatingPassword ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         Updating...
                       </>
                     ) : (
                       <>
                         <Shield className="w-4 h-4" />
                         Update Password
                       </>
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </>
         )}
     </div>
   )
 } 