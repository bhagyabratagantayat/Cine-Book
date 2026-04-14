import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Coffee, Pizza, Cookie, Plus, Minus, ArrowRight, ShoppingCart, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import usePageTitle from '../hooks/usePageTitle';

const FoodSelection = () => {
    usePageTitle('CineBook | Food & Snacks');
    const { showId } = useParams();
    const navigate = useNavigate();
    const { bookingData, updateBooking } = useBooking();
    
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(bookingData.selectedFoods || []);

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/food');
                setFoods(response.data);
            } catch (error) {
                toast.error('Failed to load menu');
            } finally {
                setLoading(false);
            }
        };
        fetchFoods();
    }, []);

    const updateQuantity = (food, delta) => {
        setSelectedItems(prev => {
            const existing = prev.find(item => item.foodId === food._id);
            if (existing) {
                const newQty = existing.quantity + delta;
                if (newQty <= 0) {
                    return prev.filter(item => item.foodId !== food._id);
                }
                return prev.map(item => item.foodId === food._id ? { ...item, quantity: newQty } : item);
            } else if (delta > 0) {
                return [...prev, { foodId: food._id, name: food.name, price: food.price, quantity: 1, image: food.image }];
            }
            return prev;
        });
    };

    const totalFoodPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleProceed = () => {
        updateBooking({ 
            selectedFoods: selectedItems, 
            totalFoodPrice 
        });
        navigate(`/summary/${showId}`);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

    return (
        <div className="bg-background min-h-screen pb-40">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 mt-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Pre-book Canteen</h4>
                        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">Grab a Snack?</h1>
                        <p className="text-white/40 text-sm font-bold max-w-md">Skip the queue at the counter. Pre-order your favorite snacks and it will be delivered to your seat {bookingData.seats.join(', ')}.</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={() => navigate(`/summary/${showId}`)} className="px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
                            Skip Food
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {foods.map((food) => {
                        const quantity = selectedItems.find(item => item.foodId === food._id)?.quantity || 0;
                        return (
                            <motion.div 
                                layout
                                key={food._id}
                                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 hover:border-primary/50 transition-all duration-500 group"
                            >
                                <div className="relative aspect-square rounded-3xl overflow-hidden mb-6">
                                    <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                        <span className="text-sm font-black italic text-primary">₹{food.price}</span>
                                    </div>
                                    {quantity > 0 && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                                            <span className="text-6xl font-black italic text-white drop-shadow-2xl">{quantity}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1 block">{food.category}</span>
                                        <h3 className="text-xl font-black italic uppercase tracking-tight">{food.name}</h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                                            <button 
                                                onClick={() => updateQuantity(food, -1)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-black italic text-lg">{quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(food, 1)}
                                                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {quantity === 0 && (
                                            <button 
                                                onClick={() => updateQuantity(food, 1)}
                                                className="bg-primary hover:bg-red-600 px-6 py-3 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-primary/20"
                                            >
                                                Add Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* STICKY BOTTOM BAR */}
            <AnimatePresence>
                {selectedItems.length > 0 && (
                    <motion.div 
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-3xl border-t border-white/5 p-4 md:p-6 z-[60] shadow-2xl"
                    >
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex bg-primary/10 p-4 rounded-2xl border border-primary/20">
                                    <ShoppingCart className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Canteen Summary</h4>
                                    <p className="text-lg font-black italic tracking-tighter">
                                        {selectedItems.length} Items Selected
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-center md:text-right">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Food Total</span>
                                    <span className="text-2xl md:text-3xl font-black italic text-primary tracking-tighter">₹{totalFoodPrice}</span>
                                </div>
                                <button 
                                    onClick={handleProceed}
                                    className="bg-primary hover:bg-red-600 px-8 md:px-12 py-3 md:py-4 rounded-2xl font-black italic uppercase text-xs md:text-sm tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center gap-3"
                                >
                                    Review & Pay
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="max-w-xl mx-auto mt-16 p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-start">
                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-loose">
                    Items selected here will be added to your final ticket. You can also buy food directly at the theatre, but online pre-booking comes with exclusive combos and faster service.
                </p>
            </div>
        </div>
    );
};

export default FoodSelection;
