"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  KeyRound,
  Mail,
  UserPlus,
  X,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  checkAuthState,
  clearVerificationStatus,
  resendVerificationEmail,
} from "@/app/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { AiOutlineGoogle } from "react-icons/ai";

type TabType = "signin" | "signup";

interface UserAvatarProps {
  externalTrigger?: boolean;
}

export default function UserAvatar({ externalTrigger }: UserAvatarProps) {
  const dispatch = useAppDispatch();
  const { user, loading, error, verificationEmailSent } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("signin");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [passwordValid, setPasswordValid] = useState({
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    if (externalTrigger) {
      setIsModalOpen(true);
    }
  }, [externalTrigger]);

  useEffect(() => {
    if (signupPassword) {
      setPasswordValid({
        length: signupPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(signupPassword),
        hasLowercase: /[a-z]/.test(signupPassword),
        hasNumber: /[0-9]/.test(signupPassword),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
          signupPassword
        ),
      });
    } else {
      setPasswordValid({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      });
    }
  }, [signupPassword]);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      dispatch(clearVerificationStatus());
      setResendSuccess(false);
    }
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    dispatch(clearVerificationStatus());
    setResendSuccess(false);
  };

  const toggleSigninPasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSigninPassword(!showSigninPassword);
  };

  const toggleSignupPasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSignupPassword(!showSignupPassword);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSigninEmail("");
      setSigninPassword("");
      setSignupEmail("");
      setSignupPassword("");
      setShowSigninPassword(false);
      setShowSignupPassword(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (activeTab === "signin") {
      setSignupEmail("");
      setSignupPassword("");
      setShowSignupPassword(false);
    } else {
      setSigninEmail("");
      setSigninPassword("");
      setShowSigninPassword(false);
    }

    if (activeTab === "signup") {
      setPasswordValid({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      });
    }
  }, [activeTab]);

  const handleResendVerificationEmail = async () => {
    setResendingEmail(true);
    try {
      await dispatch(resendVerificationEmail()).unwrap();
      setResendSuccess(true);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSuccessfulAuth = () => {
    setIsModalOpen(false);
    
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Small delay to ensure scroll completes
    setTimeout(() => {
      router.push("/animation");
    }, 100);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        signInWithEmail({ email: signinEmail, password: signinPassword })
      ).unwrap();

      handleSuccessfulAuth();
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const allRequirementsMet = Object.values(passwordValid).every(
      (value) => value === true
    );

    if (!allRequirementsMet) {
      return; 
    }

    try {
      await dispatch(
        signUpWithEmail({ email: signupEmail, password: signupPassword })
      ).unwrap();
    } catch (err) {
      console.error("Sign-up failed:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
      
      handleSuccessfulAuth();
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      
      // Scroll to top before navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Small delay to ensure scroll completes
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  const getPasswordStrength = () => {
    const criteria = Object.values(passwordValid);
    return criteria.filter(Boolean).length;
  };

  const renderPasswordStrengthIndicator = () => {
    const strength = getPasswordStrength();
    const strengthLabels = ["Very weak", "Weak", "Medium", "Good", "Strong"];
    const strengthColors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
    ];

    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">{strengthLabels[strength]}</span>
          <span className="text-xs">{strength}/5</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthColors[strength]} transition-all duration-300`}
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderEmailVerificationMessage = () => {
    return (
      <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/20 rounded-md text-amber-400 text-sm">
        <div className="flex items-start mb-2">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Email verification required</p>
            <p>
              Please verify your email address before signing in. A verification email
              has been sent to your inbox.
            </p>
          </div>
        </div>
        <div className="mt-2">
          <button
            onClick={handleResendVerificationEmail}
            disabled={resendingEmail || resendSuccess}
            className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-md 
              ${resendSuccess
                ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                : resendingEmail
                  ? "bg-blue-500/20 text-blue-400 cursor-wait"
                  : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              }`}
          >
            {resendingEmail ? (
              <>
                <RefreshCw size={14} className="mr-1.5 animate-spin" />
                Sending...
              </>
            ) : resendSuccess ? (
              <>
                <CheckCircle size={14} className="mr-1.5" />
                Email sent!
              </>
            ) : (
              <>
                <RefreshCw size={14} className="mr-1.5" />
                Resend verification email
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800">
        <span className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></span>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={user ? handleSignOut : toggleModal}
        className={`flex items-center justify-center w-8 h-8 rounded-full ${user
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-zinc-800 hover:bg-zinc-700"
          } transition-colors`}
        aria-label="User profile"
      >
        <User size={16} className="text-white" />
      </button>
      <AnimatePresence>
        {isModalOpen && !user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={toggleModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 z-50 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={toggleModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {error === 'email-not-verified' && renderEmailVerificationMessage()}
              {error && error !== 'email-not-verified' && (
                <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-md text-red-400 text-sm flex items-start">
                  <AlertCircle
                    size={18}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    {error.includes('invalid-credential') ? 'Invalid email or password.' :
                      error.includes('user-not-found') ? 'Account not found. Please sign up.' :
                        error.includes('wrong-password') ? 'Incorrect password. Please try again.' :
                          error.includes('email-already-in-use') ? 'Email already registered. Please sign in.' :
                            error.includes('weak-password') ? 'Password is too weak. Please use a stronger password.' :
                              error.includes('too-many-requests') ? 'Too many attempts. Please try again later.' :
                                'Authentication failed. Please try again.'}
                  </div>
                </div>
              )}
              {verificationEmailSent && !error && (
                <div className="mb-4 p-3 bg-green-400/10 border border-green-400/20 rounded-md text-green-400 text-sm flex items-start">
                  <CheckCircle
                    size={18}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium">Registration successful!</p>
                    <p>
                      Verification email sent. Please check your inbox and verify your email before signing in.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex mb-6 border-b border-zinc-800">
                <button
                  onClick={() => switchTab("signin")}
                  className={`flex items-center px-4 py-2 font-medium ${activeTab === "signin"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </button>
                <button
                  onClick={() => switchTab("signup")}
                  className={`flex items-center px-4 py-2 font-medium ${activeTab === "signup"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  <UserPlus size={16} className="mr-2" />
                  Sign Up
                </button>
              </div>
              {activeTab === "signin" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4">
                    Welcome back
                  </h2>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="signin-email"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signin-email"
                          type="email"
                          value={signinEmail}
                          onChange={(e) => setSigninEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="signin-password"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <KeyRound size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signin-password"
                          type={showSigninPassword ? "text" : "password"}
                          value={signinPassword}
                          onChange={(e) => setSigninPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleSigninPasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                        >
                          {showSigninPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Sign In
                    </button>
                  </form>
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-zinc-900 text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full px-4 py-2 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center"
                      >
                        <AiOutlineGoogle
                          size={20}
                          className="mr-2 text-blue-400"
                        />
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "signup" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4">
                    Create an account
                  </h2>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="signup-email"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="signup-password"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <KeyRound size={16} className="text-gray-400" />
                        </div>
                        <input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleSignupPasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                        >
                          {showSignupPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>

                      {signupPassword && renderPasswordStrengthIndicator()}

                      <div className="mt-3 space-y-1.5">
                        <p className="text-sm text-gray-400 flex items-center mb-1">
                          <Info size={14} className="mr-1.5" />
                          Password requirements:
                        </p>
                        <p
                          className={`text-xs ${passwordValid.length
                            ? "text-green-400"
                            : "text-gray-500"
                            }`}
                        >
                          • At least 8 characters
                        </p>
                        <p
                          className={`text-xs ${passwordValid.hasUppercase
                            ? "text-green-400"
                            : "text-gray-500"
                            }`}
                        >
                          • At least 1 uppercase letter (A-Z)
                        </p>
                        <p
                          className={`text-xs ${passwordValid.hasLowercase
                            ? "text-green-400"
                            : "text-gray-500"
                            }`}
                        >
                          • At least 1 lowercase letter (a-z)
                        </p>
                        <p
                          className={`text-xs ${passwordValid.hasNumber
                            ? "text-green-400"
                            : "text-gray-500"
                            }`}
                        >
                          • At least 1 number (0-9)
                        </p>
                        <p
                          className={`text-xs ${passwordValid.hasSpecial
                            ? "text-green-400"
                            : "text-gray-500"
                            }`}
                        >
                          • At least 1 special character (!@#$%^&*...)
                        </p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={`w-full px-4 py-2 ${getPasswordStrength() === 5
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "bg-blue-600/50 cursor-not-allowed"
                        } text-white rounded-md transition-colors`}
                      disabled={
                        getPasswordStrength() < 5 || verificationEmailSent
                      }
                    >
                      {verificationEmailSent ? "Account Created" : "Sign Up"}
                    </button>
                  </form>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}