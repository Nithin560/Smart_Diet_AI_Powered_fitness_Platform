import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

export default function Login() {
    const { login, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // View modes: 'login' | 'forgot-password' | 'otp-request' | 'otp-verify'
    const [viewMode, setViewMode] = useState('login');

    // Common State
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Login State
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Forgot Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    // OTP Login State
    const [otpCode, setOtpCode] = useState('');

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const loggedInUser = await login(email, password);
            setLoginSuccess(true);
            setTimeout(() => {
                if (loggedInUser.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    const validateNewPassword = (pw) => {
        const errors = [];
        if (pw.length < 10) errors.push("At least 10 characters");
        if (!/[a-z]/.test(pw)) errors.push("At least one lowercase letter");
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) errors.push("At least one special symbol");
        return errors;
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const pwErrors = validateNewPassword(newPassword);
        if (pwErrors.length > 0) {
            setError("Requirements not met: " + pwErrors[0]);
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/reset-password', { email, new_password: newPassword });
            setSuccessMsg("Password reset successful!");
            setTimeout(() => {
                setViewMode('login');
                setPassword('');
                setSuccessMsg('');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to reset password.");
        }
        setLoading(false);
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiClient.post('/auth/send-otp', { email });
            setSuccessMsg("Check your inbox for code");
            setViewMode('otp-verify');
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send OTP.");
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiClient.post('/auth/verify-otp', { email, otp_code: otpCode });
            localStorage.setItem('token', res.data.access_token);
            const profileRes = await apiClient.get('/users/me');
            if (setUser) setUser(profileRes.data);
            setLoginSuccess(true);
            setTimeout(() => {
                if (profileRes.data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid or expired code.");
            setLoading(false);
        }
    };

    const switchView = (mode) => {
        setViewMode(mode);
        setError('');
        setSuccessMsg('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617] text-slate-200">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md relative z-10"
            >
                <div className="card-glass backdrop-blur-3xl border border-white/10 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div 
                          className="w-16 h-16 bg-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center mx-auto mb-4 text-primary shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <ShieldCheck size={32} />
                        </motion.div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">
                            {viewMode === 'login' ? 'Welcome Back' : viewMode === 'forgot-password' ? 'Reset Password' : 'OTP Login'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium tracking-wide">
                            {viewMode === 'login' ? 'Access your personalized diet dashboard' :
                                viewMode === 'forgot-password' ? 'Strengthen your account security' :
                                    viewMode === 'otp-request' ? 'Secure login via email code' :
                                        'Validating your one-time identification'}
                        </p>
                    </div>

                    {/* Feedback Messages */}
                    <AnimatePresence mode="wait">
                      {error && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                          >
                              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                                  <AlertCircle size={16} />
                                  <span>{error}</span>
                              </div>
                          </motion.div>
                      )}
                      {successMsg && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                          >
                              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                                  <CheckCircle2 size={16} />
                                  <span>{successMsg}</span>
                              </div>
                          </motion.div>
                      )}
                    </AnimatePresence>

                    {/* --- Forms Container --- */}
                    <div className="space-y-6">
                      <AnimatePresence mode="wait">
                        {/* --- LOGIN VIEW --- */}
                        {viewMode === 'login' && (
                          <motion.form 
                            key="login-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handlePasswordLogin} 
                            className="space-y-4"
                          >
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Identity</label>
                              <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                  type="email" 
                                  required 
                                  placeholder="name@example.com" 
                                  className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-sm font-medium" 
                                  value={email} 
                                  onChange={(e) => setEmail(e.target.value)} 
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Security Key</label>
                                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors" onClick={() => switchView('forgot-password')}>Lost Access?</button>
                              </div>
                              <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                  type={showPassword ? 'text' : 'password'} 
                                  required 
                                  placeholder="••••••••" 
                                  className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 pr-11 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-sm font-medium" 
                                  value={password} 
                                  onChange={(e) => setPassword(e.target.value)} 
                                />
                                <button 
                                  type="button" 
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>

                            <button 
                              type="submit" 
                              disabled={loading || loginSuccess}
                              className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2 group"
                            >
                              <span>{loginSuccess ? 'Logging In...' : loading ? 'Identifying...' : 'Login'}</span>
                              {!loading && !loginSuccess && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <div className="relative py-4 flex items-center gap-4">
                                <div className="h-px bg-white/5 flex-1" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Alternative Login</span>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <button 
                              type="button" 
                              className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                              onClick={() => switchView('otp-request')}
                            >
                                <KeyRound size={16} />
                                Login with OTP
                            </button>
                          </motion.form>
                        )}

                        {/* --- FORGOT PASSWORD VIEW --- */}
                        {viewMode === 'forgot-password' && (
                          <motion.form 
                            key="reset-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleForgotPassword} 
                            className="space-y-4"
                          >
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Identity Confirmation</label>
                              <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="email" required placeholder="name@example.com" className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">New Security Key</label>
                              <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type={showNewPassword ? 'text' : 'password'} required placeholder="10+ characters" className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Verify Key</label>
                              <input type="password" required placeholder="Match new key" className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>

                            <button type="submit" className="btn-primary w-full py-4 mt-2" disabled={loading}>
                                {loading ? 'Updating Shield...' : 'Update Security Protocol'}
                            </button>

                            <button type="button" className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors pt-2 flex items-center justify-center gap-2" onClick={() => switchView('login')}>
                                <ChevronLeft size={14} /> Back to standard access
                            </button>
                          </motion.form>
                        )}

                        {/* --- OTP REQUEST VIEW --- */}
                        {viewMode === 'otp-request' && (
                          <motion.form 
                            key="otp-req"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleRequestOTP} 
                            className="space-y-4"
                          >
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Contact Point</label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="email" required placeholder="name@example.com" className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
                              </div>
                            </div>
                            <button type="submit" className="btn-primary w-full py-4 mt-2" disabled={loading}>
                                {loading ? 'Transmitting Code...' : 'Request Validation Code'}
                            </button>
                            <button type="button" className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors pt-2 flex items-center justify-center gap-2" onClick={() => switchView('login')}>
                                <ChevronLeft size={14} /> Key-based identification
                            </button>
                          </motion.form>
                        )}

                        {/* --- OTP VERIFY VIEW --- */}
                        {viewMode === 'otp-verify' && (
                          <motion.form 
                            key="otp-ver"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleVerifyOTP} 
                            className="space-y-6"
                          >
                            <div className="space-y-3">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 text-center block w-full">6-Digit Access Token</label>
                              <input 
                                type="text" 
                                required 
                                maxLength="6" 
                                placeholder="0 0 0 0 0 0" 
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-xl outline-none focus:border-primary text-center text-2xl font-black tracking-[0.5em] text-white" 
                                value={otpCode} 
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                              />
                            </div>
                            <button type="submit" className="btn-primary w-full py-4 mt-2" disabled={loading || loginSuccess || otpCode.length !== 6}>
                                {loginSuccess ? 'Validating...' : loading ? 'Authenticating...' : 'Establish Secure Session'}
                            </button>
                            <button type="button" className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2" onClick={() => switchView('otp-request')}>
                                <ShieldCheck size={14} /> Re-transmit credential
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom Footer */}
                    <motion.div 
                      className="mt-10 pt-8 border-t border-white/5 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                        <p className="text-sm font-medium text-slate-500">
                            First time accessing our systems?{' '}
                            <Link to="/register" className="text-primary font-black uppercase tracking-widest text-xs ml-1 hover:text-primary/70 transition-colors underline-offset-4 hover:underline">
                                Register
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
