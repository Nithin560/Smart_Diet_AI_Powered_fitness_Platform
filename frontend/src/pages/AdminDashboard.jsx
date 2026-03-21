import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  LogOut, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Database
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const [usersRes, statsRes] = await Promise.all([
                    apiClient.get('/users/'),
                    apiClient.get('/users/admin/stats')
                ]);
                setUsers(usersRes.data);
                setStats(statsRes.data);
            } catch (err) {
                setError('Failed to load admin data or unauthorized access.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;
        try {
            await apiClient.delete(`/users/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            if (stats) {
                setStats({...stats, total_users: stats.total_users - 1});
            }
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Admin Neural Link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary/30 p-4 lg:p-8 relative overflow-hidden">
            {/* Fixed Background Image with Overlay */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2000&auto=format&fit=crop" 
                    alt="Healthy Food Background" 
                    className="w-full h-full object-cover opacity-20 contrast-100"
                />
                <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[2px]" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-6 mb-10 card-glass p-6 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Admin Dashboard</h1>
                            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Overview & Diagnostics • Protocol v4.2</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-black uppercase tracking-widest text-xs group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Logout
                    </button>
                </header>

                {error ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-glass border-red-500/20 p-12 text-center"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Access Denied</h2>
                        <p className="text-slate-400 font-medium mb-6">{error}</p>
                        <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3">Return to Identification</button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Users', value: stats?.total_users || users.length, icon: <Users size={20} />, color: 'emerald' },
                                { label: 'Avg User BMI', value: stats?.avg_bmi || '0', icon: <Activity size={20} />, color: 'amber' },
                                { label: 'Database Status', value: 'Healthy', icon: <Database size={20} />, color: 'sky' },
                                { label: 'System Load', value: 'Optimal', icon: <Zap size={20} />, color: 'purple' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="card-glass p-5 border border-white/5 relative overflow-hidden group"
                                >
                                    <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${stat.color}-500/10 blur-2xl rounded-full group-hover:bg-${stat.color}-500/20 transition-all`} />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 border border-${stat.color}-500/30 flex items-center justify-center text-${stat.color}-400`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white">{stat.value}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Area */}
                        {stats?.goal_distribution && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card-glass p-8 border border-white/10"
                            >
                                <div className="flex items-center gap-2 mb-8">
                                    <BarChart3 size={20} className="text-primary" />
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Goal Distribution Metrics</h2>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.goal_distribution}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={100}
                                                paddingAngle={5} dataKey="value"
                                                stroke="none"
                                            >
                                                {stats.goal_distribution.map((entry, index) => {
                                                    const colors = ['#10b981', '#3b82f6', '#f43f5e'];
                                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="focus:outline-none" />;
                                                })}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ 
                                                    background: 'rgba(2, 6, 23, 0.9)', 
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255,255,255,0.1)', 
                                                    borderRadius: '12px', 
                                                    padding: '12px' 
                                                }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={36} 
                                                iconType="circle" 
                                                formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* User Table Container */}
                        <div className="card-glass border border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Users size={20} className="text-primary" />
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Registry Management</h2>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search Identity..." 
                                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:border-primary focus:bg-primary/5 transition-all w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/2">
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Identity</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Role</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Health Specs</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Neural Activity</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <AnimatePresence mode="popLayout">
                                            {filteredUsers.slice().sort((a,b) => (b.role === 'admin') - (a.role === 'admin')).map((u) => (
                                                <motion.tr 
                                                    key={u.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className={`group hover:bg-white/2 transition-colors ${u.role === 'admin' ? 'bg-primary/5' : ''}`}
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${u.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                                                                    {u.name}
                                                                    {u.role === 'admin' && <ShieldCheck size={12} className="text-primary" />}
                                                                </div>
                                                                <div className="text-[10px] font-medium text-slate-500">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-slate-500/20 text-slate-400'}`}>
                                                            {u.role || 'USER'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-xs font-bold text-slate-300 capitalize">{u.goal?.replace('_', ' ')}</div>
                                                        <div className="text-[10px] text-slate-500 tracking-tight">{u.height}cm • {u.weight}kg</div>
                                                    </td>
                                                    <td className="p-4">
                                                        {(() => {
                                                            const loginTime = u.last_login ? new Date(u.last_login) : (u.created_at ? new Date(u.created_at) : new Date());
                                                            const isActive = (new Date() - loginTime) < 24 * 60 * 60 * 1000;
                                                            return (
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                                            {isActive ? 'Syncing' : 'Offline'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[9px] text-slate-600 font-bold uppercase">{loginTime.toLocaleDateString()}</div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-4">
                                                        {u.role !== 'admin' && (
                                                            <button 
                                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:scale-110 transition-all group"
                                                                title="Delete Identity"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs italic opacity-50">
                                                    No neural signatures found matching search criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
