import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Plus, Trash2, Tag, Calendar, Percent, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ 
        code: '', discountType: 'percentage', value: '', minAmount: 0, expiryDate: '' 
    });

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/coupon/available`);
            setCoupons(res.data);
        } catch (e) {
            toast.error('Failed to fetch coupons');
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleAdd = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/coupon/create`, newCoupon);
            toast.success('Coupon created');
            setIsAdding(false);
            setNewCoupon({ code: '', discountType: 'percentage', value: '', minAmount: 0, expiryDate: '' });
            fetchCoupons();
        } catch (e) {
            toast.error('Creation failed');
        }
    };

    return (
        <div className="bg-background min-h-screen pb-20">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 mt-16">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manage Coupons</h1>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="bg-primary px-8 py-3 rounded-2xl font-black italic uppercase text-xs tracking-widest flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Coupon
                    </button>
                </div>

                {isAdding && (
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Code</label>
                            <input placeholder="E.g. SUMMER50" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none uppercase" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Discount Type</label>
                            <select value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none">
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Value</label>
                            <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Min Purchase (₹)</label>
                            <input type="number" value={newCoupon.minAmount} onChange={e => setNewCoupon({...newCoupon, minAmount: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Expiry Date</label>
                            <input type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAdd} className="bg-green-600 px-6 py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex-1">Save Coupon</button>
                            <button onClick={() => setIsAdding(false)} className="bg-white/10 px-6 py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {coupons.map(coupon => (
                        <div key={coupon._id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 bg-primary/20 rounded-bl-3xl">
                                <Tag className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">{coupon.code}</h3>
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2 text-white/40 font-bold uppercase text-[10px] tracking-widest">
                                        <Percent className="w-3 h-3" /> {coupon.discountType === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                                    </div>
                                    <div className="flex items-center gap-2 text-white/40 font-bold uppercase text-[10px] tracking-widest">
                                        <IndianRupee className="w-3 h-3" /> Min. ₹{coupon.minAmount}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageCoupons;
