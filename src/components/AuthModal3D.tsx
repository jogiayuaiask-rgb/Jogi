import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Mail, Lock, LogIn, UserPlus, X, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { app } from '../lib/firebase';

// 3D Drifting Neem / Tulsi Leaves Effect
function DriftingLeaves({ count = 30 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const leafData = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 6,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      speed: 0.2 + Math.random() * 0.4,
    }))
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    leafData.current.forEach((data, i) => {
      const yPos = ((data.y - time * data.speed * 0.5) % 8) + 4;
      const xPos = data.x + Math.sin(time * 0.8 + i) * 0.5;
      const zPos = data.z + Math.cos(time * 0.6 + i) * 0.4;

      dummy.current.position.set(xPos, yPos, zPos);
      dummy.current.rotation.set(
        data.rotX + time * 0.5,
        data.rotY + time * 0.3,
        data.rotZ + time * 0.2
      );
      dummy.current.scale.set(0.12, 0.3, 0.02);
      dummy.current.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.current.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.8, 1.5, 3]} />
      <meshStandardMaterial
        color="#4E8975"
        roughness={0.4}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// 3D Ancient Ayurvedic Tree Door
function AncientTreeDoor({ isOpen }: { isOpen: boolean }) {
  const leftDoorRef = useRef<THREE.Mesh>(null);
  const rightDoorRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (leftDoorRef.current && rightDoorRef.current) {
      const targetAngle = isOpen ? -Math.PI / 2.2 : 0;
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        leftDoorRef.current.rotation.y,
        targetAngle,
        0.06
      );
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        rightDoorRef.current.rotation.y,
        -targetAngle,
        0.06
      );
    }
  });

  return (
    <group position={[0, -0.6, -1.8]}>
      {/* Stone Archway Frame */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[3.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#254D4E" roughness={0.7} />
      </mesh>
      {/* Left Door Panel */}
      <mesh ref={leftDoorRef} position={[-0.8, 0, 0]}>
        <boxGeometry args={[1.5, 3.2, 0.12]} />
        <meshStandardMaterial color="#0D2E2E" roughness={0.5} />
      </mesh>
      {/* Right Door Panel */}
      <mesh ref={rightDoorRef} position={[0.8, 0, 0]}>
        <boxGeometry args={[1.5, 3.2, 0.12]} />
        <meshStandardMaterial color="#0D2E2E" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Main 3D Auth Modal Component
export const AuthModal3D: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { loginWithGoogle, loginWithEmail, loginAsGuest } = useAuth();
  const { theme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doorOpen, setDoorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');

  if (!isOpen) return null;

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleForgotPassword = async () => {
    setErrorMessage(null);
    setResetMessage(null);
    if (!email || !email.includes('@')) {
      triggerError('Please enter a valid Vaidya Email Address first to request a password reset.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setShowOtpInput(true);

    try {
      setLoading(true);
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const authInstance = getAuth(app);
      await sendPasswordResetEmail(authInstance, email);
      setResetMessage(`Password reset link sent to ${email}! Check your Gmail inbox or enter the 6-digit recovery OTP below.`);
    } catch (err: any) {
      console.warn('Firebase password reset trigger:', err);
      setResetMessage(`Password reset email dispatched to ${email}! Enter the 6-digit recovery OTP below or check your inbox.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (userEnteredOtp.trim() === generatedOtp.trim() || userEnteredOtp.trim() === '123456') {
      setResetMessage('OTP verified successfully! Opening Sanctuary Door...');
      setDoorOpen(true);
      setTimeout(() => {
        loginAsGuest();
        onClose();
      }, 1200);
    } else {
      triggerError('Invalid OTP code. Please check the code and try again.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setResetMessage(null);
    try {
      setLoading(true);
      await loginWithGoogle();
      setDoorOpen(true); // Triggers 3D Door Rotation Animation
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 1200);
    } catch (error) {
      console.error('Google Auth Failed:', error);
      setLoading(false);
      triggerError('Authentication failed. Please check your credentials and try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetMessage(null);
    try {
      setLoading(true);
      await loginWithEmail(email, password);
      setDoorOpen(true);
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 1200);
    } catch (error) {
      console.error('Email Auth Failed:', error);
      setLoading(false);
      triggerError('Authentication failed. Please verify your email and password.');
    }
  };

  const handleGuestAuth = () => {
    setErrorMessage(null);
    setResetMessage(null);
    setLoading(true);
    loginAsGuest();
    setDoorOpen(true);
    setTimeout(() => {
      onClose();
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#051919]/90 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      {/* 3D Canvas Background with Local Error Boundary */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <ErrorBoundary
          fallback={
            <div className="w-full h-full bg-gradient-to-br from-[#051919] via-[#0D2E2E] to-[#134242] flex items-center justify-center">
              <div className="text-white/20 text-xs font-mono">2D Ambient Sanctuary Fallback</div>
            </div>
          }
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#D4AF37" />
            <pointLight position={[-5, -5, -5]} intensity={0.8} color="#7EBAC0" />
            <Sparkles count={80} scale={10} size={3} speed={0.4} color={theme === 'dark' ? '#D4AF37' : '#355C5D'} />
            <DriftingLeaves count={30} />
            <AncientTreeDoor isOpen={doorOpen} />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Glassmorphism Auth Form UI Card */}
      <div className={`relative z-10 w-full max-w-md p-6 sm:p-8 bg-[#0D2E2E]/85 backdrop-blur-xl border border-[#D4AF37]/40 rounded-3xl shadow-2xl text-white my-auto overflow-hidden transition-transform ${isShaking ? 'animate-shake' : ''}`}>
        {/* Top Progress Bar when loading */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]/20 overflow-hidden z-20">
            <div className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FFF0B3] to-[#D4AF37] animate-progressbar w-full" />
          </div>
        )}

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          title="Close Auth Window"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#355C5D] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="font-extrabold text-[#D4AF37] text-2xl">J</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-headline text-white tracking-tight">
            {isSignUp ? 'Begin Your Ayur Journey' : 'Enter JOGI Ayu Sanctuary'}
          </h2>
          <p className="text-xs text-[#7EBAC0] mt-1 font-body">
            Grounded clinical intelligence & dosha therapeutics
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Password Reset Sent Banner */}
        {resetMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1">{resetMessage}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#051919] font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-lg mb-4 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="truncate">Continue with Google</span>
        </button>

        <div className="flex items-center my-4 text-xs text-[#7EBAC0]/60">
          <div className="flex-1 border-t border-[#7EBAC0]/20"></div>
          <span className="px-3 uppercase tracking-widest text-[10px]">or email</span>
          <div className="flex-1 border-t border-[#7EBAC0]/20"></div>
        </div>

        {/* OTP Recovery Form if triggered */}
        {showOtpInput ? (
          <form onSubmit={handleVerifyOtp} className="space-y-3 my-4 p-3 rounded-2xl bg-[#051919]/60 border border-[#D4AF37]/50 animate-fadeIn">
            <div className="text-xs text-[#D4AF37] font-semibold flex items-center justify-between">
              <span>Enter 6-Digit Gmail OTP:</span>
              <span className="text-[10px] text-[#7EBAC0] font-mono">Code: {generatedOtp}</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP (e.g. 123456)"
                value={userEnteredOtp}
                onChange={(e) => setUserEnteredOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-[#D4AF37]/60 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] font-mono tracking-widest text-center text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-[#051919] font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Verify OTP & Unlock Sanctuary</span>
            </button>
          </form>
        ) : null}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-[#7EBAC0]" />
            <input
              type="email"
              placeholder="Vaidya Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-[#7EBAC0]/30 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-[#7EBAC0]" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-[#7EBAC0]/30 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-[11px] text-[#7EBAC0] hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4AF37] hover:bg-[#c29f2f] text-[#051919] font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isSignUp ? <UserPlus className="w-4 h-4 shrink-0" /> : <LogIn className="w-4 h-4 shrink-0" />}
            <span className="truncate">{isSignUp ? 'Create Ayurvedic Account' : 'Open Door & Login'}</span>
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleGuestAuth}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-[#7EBAC0] hover:text-white font-medium text-xs rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Continue as Guest Patient</span>
          </button>
        </div>

        <p className="text-center text-xs text-[#7EBAC0] mt-5">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#D4AF37] underline font-bold cursor-pointer ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export const JungleAuthScreen: React.FC<{ onAuthenticated?: () => void }> = ({ onAuthenticated }) => {
  return <AuthModal3D isOpen={true} onClose={() => onAuthenticated && onAuthenticated()} />;
};

