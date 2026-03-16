import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Scale, 
  Ruler, 
  Activity, 
  Target, 
  TrendingUp, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Info,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        weight: user?.weight || '',
        height: user?.height || '',
        goal: user?.goal || 'maintain',
        activity_level: user?.activity_level || 'moderate'
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                weight: user.weight || '',
                height: user.height || '',
                goal: user.goal || 'maintain',
                activity_level: user.activity_level || 'moderate'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'weight' || name === 'height' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const res = await apiClient.put('/users/me', formData);
            setUser(res.data);
            setMessage({ type: 'success', text: 'Profile successfully updated! Your diet plan will adjust accordingly.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update profile parameters.' });
        }
        setLoading(false);
    };

    if (!user) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
    );

    const chartData = [...(user.weight_history || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 lg:p-12 p-6 overflow-hidden relative">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-1/2 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto relative z-10"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/dashboard')}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl backdrop-blur-xl"
                        >
                            <ArrowLeft size={20} />
                        </motion.button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                                <User className="text-primary text-3xl" /> 
                                Wellness Profile
                            </h1>
                            <p className="text-slate-500 font-medium tracking-wide mt-1">Configure your biological metrics and primary objectives</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* LEFT SIDE: Settings Form (2/5) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="card-glass backdrop-blur-3xl border border-white/10 p-8 h-full">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <Activity size={20} />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-white">Body Metrics & Goals</h2>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                {message.text && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-8"
                                    >
                                        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {message.text}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                            <Scale size={12} /> Mass (kg)
                                        </label>
                                        <input 
                                            type="number" step="0.1" name="weight" 
                                            value={formData.weight} onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-sm font-medium text-white" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                            <Ruler size={12} /> Stature (cm)
                                        </label>
                                        <input 
                                            type="number" step="0.1" name="height" 
                                            value={formData.height} onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary focus:bg-primary/5 transition-all text-sm font-medium text-white" 
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                        <Target size={12} /> Fitness Objective
                                    </label>
                                    <select 
                                        name="goal" value={formData.goal} onChange={handleChange}
                                        className="w-full bg-[#1e293b] border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium text-white appearance-none"
                                    >
                                        <option value="weight_loss">Weight Loss (Deficit)</option>
                                        <option value="maintain">Equilibrium (Maintain)</option>
                                        <option value="weight_gain">Hypertrophy (Gain)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                        <Activity size={12} /> Activity Magnitude
                                    </label>
                                    <select 
                                        name="activity_level" value={formData.activity_level} onChange={handleChange}
                                        className="w-full bg-[#1e293b] border border-white/10 p-3.5 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium text-white appearance-none"
                                    >
                                        <option value="sedentary">Sedentary (Minimal)</option>
                                        <option value="light">Lightly Active (1-3 days)</option>
                                        <option value="moderate">Moderately Active (3-5 days)</option>
                                        <option value="active">Very Active (6-7 days)</option>
                                        <option value="very_active">Super Active (Athlete)</option>
                                    </select>
                                </div>
                                
                                <div className="pt-6">
                                    <button 
                                        type="submit" disabled={loading}
                                        className="btn-primary w-full py-4 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    >
                                        {loading ? 'Processing...' : 'Commit Profile Metrics'}
                                        {!loading && <Save size={18} className="group-hover:scale-110 transition-transform" />}
                                    </button>
                                    <div className="flex items-center gap-2 mt-4 px-2">
                                        <Info size={14} className="text-slate-600 shrink-0" />
                                        <p className="text-[10px] font-bold text-slate-600 leading-tight uppercase tracking-tight">Updating mass will recalibrate all daily nutritional targets automatically.</p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {/* RIGHT SIDE: Progress Chart (3/5) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="card-glass backdrop-blur-3xl border border-white/10 p-8 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                        <TrendingUp size={20} />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Mass Progress Protocol</h2>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-h-[400px] mt-2 relative group">
                                {(() => {
                                    // Prepare data for the chart
                                    let displayData = [...(user.weight_history || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
                                    
                                    // Fallback: If no history exists, create a single point using current weight
                                    if (displayData.length === 0 && user.weight) {
                                        displayData = [{
                                            date: user.created_at || new Date().toISOString(),
                                            weight: user.weight
                                        }];
                                    }

                                    if (displayData.length > 0) {
                                        return (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={displayData}>
                                                    <defs>
                                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        stroke="#475569"
                                                        fontSize={10}
                                                        tickMargin={12}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <YAxis 
                                                        domain={['dataMin - 5', 'dataMax + 5']} 
                                                        stroke="#475569"
                                                        fontSize={10}
                                                        tickFormatter={(tick) => `${tick}kg`}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        width={40}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                                            borderRadius: '16px', 
                                                            border: '1px solid rgba(255,255,255,0.1)', 
                                                            backdropFilter: 'blur(10px)',
                                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                                                        }}
                                                        itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}
                                                        labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                                        formatter={(value) => [`${value} kg`, 'Absolute Mass']}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="weight" 
                                                        stroke="#10b981" 
                                                        strokeWidth={3}
                                                        fillOpacity={1} 
                                                        fill="url(#colorWeight)"
                                                        dot={{ r: 4, fill: '#10b981', stroke: '#020617', strokeWidth: 2 }}
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        );
                                    }

                                    return (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-12">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 opacity-50">
                                                <Scale size={32} />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-xs mb-2">Initial Data Point Missing</p>
                                            <p className="text-[10px] font-medium leading-relaxed">Update your biological mass on the left to initialize chronological tracking protocols.</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
