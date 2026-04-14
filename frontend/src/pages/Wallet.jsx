import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Gift, History, Plus, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import toast from 'react-hot-toast';

const Wallet = () => {
    const { bookingData } = useBooking();
    const guestUserId = bookingData.guestUserId;
    
    const [wallet, setWallet] = useState({ balance: 0, cashback: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [amountToAdd, setAmountToAdd] = useState('');

    const fetchData = async () => {
        try {
            const [balanceRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet/balance/${guestUserId}`),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet/history/${guestUserId}`)
            ]);
            setWallet(balanceRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [guestUserId]);

    const handleAddMoney = async () => {
        if (!amountToAdd || amountToAdd <= 0) return;
        const loadingToast = toast.loading('Adding money...');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet/add`, {
                userId: guestUserId,
                amount: Number(amountToAdd)
            });
            toast.success(`₹${amountToAdd} added to wallet!`, { id: loadingToast });
            setAmountToAdd('');
            fetchData();
        } catch (error) {
            toast.error('Failed to add money', { id: loadingToast });
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

    return (
        <div className="bg-background min-h-screen pb-20">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-4 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* LEFT: WALLET CARD & ADD MONEY */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-gradient-to-br from-primary to-red-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-[0_30px_60px_rgba(255,24,24,0.3)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative flex justify-between items-start mb-16">
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-xl border border-white/20">
                                    <WalletIcon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Cine Card</p>
                                    <p className="text-sm font-black italic uppercase tracking-widest">{guestUserId.substring(0, 8)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Available Balance</p>
                                <h2 className="text-6xl font-black italic tracking-tighter">₹{wallet.balance}</h2>
                            </div>
                            
                            <div className="mt-12 flex items-center gap-4 bg-white/10 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
                                <Gift className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Cashback Earned</p>
                                    <p className="font-black italic">₹{wallet.cashback}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Plus className="w-5 h-5 text-primary" /> Top Up Wallet
                            </h3>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Enter amount..."
                                    value={amountToAdd}
                                    onChange={(e) => setAmountToAdd(e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                />
                                <button 
                                    onClick={handleAddMoney}
                                    className="bg-primary hover:bg-red-600 px-8 py-3 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[500, 1000, 2000].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setAmountToAdd(amt.toString())}
                                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-colors"
                                    >
                                        + ₹{amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: TRANSACTION HISTORY */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <History className="w-8 h-8 text-primary" /> Transaction History
                            </h3>
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                                {history.length} Transactions
                            </div>
                        </div>

                        <div className="space-y-4">
                            {history.length > 0 ? history.map((tx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={tx._id}
                                    className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between hover:border-white/20 transition-all cursor-default"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${
                                            tx.type === 'add' ? 'bg-green-500/10 text-green-500' : 
                                            tx.type === 'debit' ? 'bg-red-500/10 text-red-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {tx.type === 'add' ? <ArrowUpRight className="w-6 h-6" /> : 
                                             tx.type === 'debit' ? <ArrowDownLeft className="w-6 h-6" /> :
                                             <Gift className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase italic">{tx.description}</h4>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black italic ${
                                            tx.type === 'add' || tx.type === 'cashback' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {tx.type === 'add' || tx.type === 'cashback' ? '+' : '-'} ₹{tx.amount}
                                        </p>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Conf ID: {tx._id.substring(0, 8)}</p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                    <p className="text-white/20 font-black uppercase italic tracking-widest">No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
