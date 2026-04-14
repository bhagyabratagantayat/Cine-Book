import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Plus, Trash2, Edit, Save, X, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageFoods = () => {
    const [foods, setFoods] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newFood, setNewFood] = useState({ name: '', price: '', image: '', category: 'Snacks' });

    const fetchFoods = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/food`);
            setFoods(res.data);
        } catch (e) {
            toast.error('Failed to fetch food');
        }
    };

    useEffect(() => { fetchFoods(); }, []);

    const handleAdd = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/food/add`, newFood);
            toast.success('Food item added');
            setIsAdding(false);
            setNewFood({ name: '', price: '', image: '', category: 'Snacks' });
            fetchFoods();
        } catch (e) {
            toast.error('Add failed');
        }
    };

    return (
        <div className="bg-background min-h-screen pb-20">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 mt-16">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manage Canteen</h1>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="bg-primary px-8 py-3 rounded-2xl font-black italic uppercase text-xs tracking-widest flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>

                {isAdding && (
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Item Name</label>
                            <input value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Price (₹)</label>
                            <input type="number" value={newFood.price} onChange={e => setNewFood({...newFood, price: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40">Image URL</label>
                            <input value={newFood.image} onChange={e => setNewFood({...newFood, image: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAdd} className="bg-green-600 px-6 py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex-1">Save</button>
                            <button onClick={() => setIsAdding(false)} className="bg-white/10 px-6 py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foods.map(food => (
                        <div key={food._id} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-6">
                            <img src={food.image} className="w-20 h-20 rounded-2xl object-cover" />
                            <div className="flex-1">
                                <h3 className="font-black italic uppercase">{food.name}</h3>
                                <p className="text-primary font-black italic">₹{food.price}</p>
                            </div>
                            <button className="p-3 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageFoods;
