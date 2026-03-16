import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Scale, 
  Ruler, 
  Activity, 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', age: 25, gender: 'male',
        height: 170, weight: 70, activity_level: 'moderate', goal: 'maintain'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 2-step form

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const hasMinLength = formData.password.length >= 8;
    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const loggedInUser = await register({
                ...formData,
                age: parseInt(formData.age),
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight)
            });
            if (loggedInUser.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617] text-slate-200 text-sm">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl relative z-10"
            >
                <div className="card-glass backdrop-blur-3xl border border-white/10 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div 
                          className="w-14 h-14 bg-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center mx-auto mb-4 text-primary shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          whileHover={{ scale: 1.05, rotate: -5 }}
                        >
                            <UserPlus size={28} />
                        </motion.div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">
                            Initialize Profile
                        </h1>
                        <p className="text-slate-500 text-xs font-medium tracking-wide">
                            {step === 1 ? 'Configure your authentication credentials' : 'Calibrate your health parameters'}
                        </p>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="flex items-center justify-center gap-3 mb-10 px-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= 1 ? 'bg-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-500'}`}>1</div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-white' : 'text-slate-600'}`}>Auth</span>
                        </div>
                        <div className={`h-0.5 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary/50' : 'bg-white/5'}`} />
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= 2 ? 'bg-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-500'}`}>2</div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'text-white' : 'text-slate-600'}`}>Metrics</span>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mb-8"
                        >
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs font-medium">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <AnimatePresence mode="wait">
                        {/* --- STEP 1: Account Info --- */}
                        {step === 1 && (
                          <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-5"
                          >
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                <div className="relative group">
                                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                  <input 
                                    name="name" type="text" required placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-xs font-medium" 
                                    value={formData.name} onChange={handleChange} 
                                  />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Identity</label>
                                <div className="relative group">
                                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                  <input 
                                    name="email" type="email" required placeholder="name@example.com"
                                    className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-xs font-medium" 
                                    value={formData.email} onChange={handleChange} 
                                  />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Master Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                      name="password" type={showPassword ? 'text' : 'password'}
                                      required placeholder="8+ chars, numbers, symbols"
                                      className="w-full bg-white/5 border border-white/10 p-3.5 pl-11 pr-11 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-xs font-medium"
                                      value={formData.password} onChange={handleChange} 
                                    />
                                    <button 
                                      type="button" 
                                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                  {[
                                    { met: hasMinLength, label: '8+ Chars' },
                                    { met: hasNumber, label: 'Number' },
                                    { met: hasSpecialChar, label: 'Symbol' }
                                  ].map((req, i) => (
                                    <div key={i} className={`h-1 rounded-full ${req.met ? 'bg-primary' : 'bg-white/5'} transition-all duration-500 relative group`}>
                                      <span className={`absolute -bottom-4 left-0 text-[7px] font-black uppercase tracking-tighter ${req.met ? 'text-primary' : 'text-slate-600'}`}>{req.label}</span>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-primary w-full py-4 mt-8 flex items-center justify-center gap-2 group text-xs font-bold"
                                onClick={() => {
                                    if (!formData.name || !formData.email || !formData.password) {
                                        setError('Identity fields must not be void.');
                                        return;
                                    }
                                    if (!isPasswordValid) {
                                        setError('Access key requirements not satisfied.');
                                        return;
                                    }
                                    setError('');
                                    setStep(2);
                                }}
                            >
                                <span>Proceed to Calibration</span>
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </motion.div>
                        )}

                        {/* --- STEP 2: Health Profile --- */}
                        {step === 2 && (
                          <motion.div 
                             key="step2"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="space-y-5"
                          >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Chronological Age</label>
                                    <input name="age" type="number" required min="10" max="120"
                                        className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-xs font-medium text-white" 
                                        value={formData.age} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Biological Gender</label>
                                    <select name="gender" className="w-full bg-[#1e293b] border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-xs font-medium text-white appearance-none" value={formData.gender} onChange={handleChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                      <Ruler size={12} /> Stature (cm)
                                    </label>
                                    <input name="height" type="number" step="0.1" required
                                        className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-xs font-medium text-white" 
                                        value={formData.height} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                      <Scale size={12} /> Mass (kg)
                                    </label>
                                    <input name="weight" type="number" step="0.1" required
                                        className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-xs font-medium text-white" 
                                        value={formData.weight} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                  <Activity size={12} /> Kinetic Intensity
                                </label>
                                <select name="activity_level" className="w-full bg-[#1e293b] border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-xs font-medium text-white" value={formData.activity_level} onChange={handleChange}>
                                    <option value="sedentary">Sedentary (Minimal Movement)</option>
                                    <option value="light">Lightly Active (1–3 days/week)</option>
                                    <option value="moderate">Moderately Active (3–5 days/week)</option>
                                    <option value="active">Very Active (6–7 days/week)</option>
                                    <option value="very_active">Super Active (Physical Occupation)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                  <Target size={12} /> Optimization Objective
                                </label>
                                <select name="goal" className="w-full bg-[#1e293b] border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-xs font-medium text-white" value={formData.goal} onChange={handleChange}>
                                    <option value="weight_loss">Aggressive Mass Reduction</option>
                                    <option value="maintain">Maintain Current Equilibrium</option>
                                    <option value="weight_gain">Hypertrophy / Mass Accrual</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button type="button" className="flex-1 bg-white/5 border border-white/10 p-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2" onClick={() => setStep(1)}>
                                    <ChevronLeft size={18} /> Back
                                </button>
                                <button type="submit" className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group text-xs font-bold" disabled={loading}>
                                    <span>{loading ? 'Initializing...' : 'Commit Protocol'}</span>
                                    {!loading && <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />}
                                </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>

                    {/* Footer */}
                    <motion.div 
                      className="mt-10 pt-8 border-t border-white/5 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                        <p className="text-xs font-medium text-slate-500">
                             Existing identifier detected?{' '}
                            <Link to="/login" className="text-primary font-black uppercase tracking-widest text-[10px] ml-1 hover:text-primary/70 transition-colors underline-offset-4 hover:underline">
                                Request Access
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
