import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Ticket, CreditCard, ShieldCheck, QrCode, ArrowRight, Tag, Wallet, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import usePageTitle from '../hooks/usePageTitle';

const Summary = () => {
  usePageTitle('CineBook | Checkout');
  const { showId } = useParams();
  const navigate = useNavigate();
  const { bookingData, clearBooking } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }
  const [walletInfo, setWalletInfo] = useState({ balance: 0, cashback: 0 });
  const [useWallet, setUseWallet] = useState(true);
  
  const { seats, totalPrice, movie, theatre, showTime, showDate, selectedFoods, totalFoodPrice, guestUserId } = bookingData;
  
  const ticketCost = totalPrice;
  const foodCost = totalFoodPrice || 0;
  // User Formula: subtotal = ticketPrice + foodTotal
  const subTotal = ticketCost + foodCost;
  const convenienceFee = Math.round(subTotal * 0.1); // Assuming 10% fee
  
  const discount = appliedCoupon ? Math.round(subTotal * 0.1) : 0;
  const afterDiscount = subTotal + convenienceFee - discount;
  
  const walletDeduction = useWallet ? Math.min(afterDiscount, walletInfo.balance) : 0;
  const finalPayable = afterDiscount - walletDeduction;

  // Fetch Wallet info on mount
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet/balance/${guestUserId}`);
        setWalletInfo(response.data);
      } catch (error) {
        console.error('Wallet error:', error);
      }
    };
    fetchWallet();
  }, [guestUserId]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const loadingToast = toast.loading('Validating coupon...');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/coupon/apply`, {
        code: couponCode,
        amount: subTotal,
        userId: guestUserId
      });
      setAppliedCoupon({ code: response.data.couponCode, discount: response.data.discount });
      toast.success(`₹${response.data.discount} discount applied!`, { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon', { id: loadingToast });
    }
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const loadingToast = toast.loading('Finalizing booking...');
    
    try {
      const paymentId = finalPayable > 0 ? 'PAY' + Math.random().toString(36).substr(2, 9).toUpperCase() : null;
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings`, {
        showId: showId,
        movieId: movie?.id,
        movieTitle: movie?.title,
        moviePoster: movie?.poster,
        movieRating: movie?.rating,
        theatreName: theatre?.name,
        showTime,
        showDate,
        seats: seats.map(s => s.id),
        subTotal: ticketCost + foodCost,
        totalAmount: finalPayable,
        paymentId: paymentId,
        paymentMethod: finalPayable === 0 ? 'WALLET' : 'UPI',
        userId: guestUserId,
        foodItems: selectedFoods,
        couponCode: appliedCoupon?.code,
        discountAmount: discount,
        walletPaidAmount: walletDeduction
      });

      toast.success('Booking Confirmed! Enjoy your movie.', { id: loadingToast });
      clearBooking();
      navigate(`/ticket/${response.data.bookingId}`);
    } catch (error) {
      toast.error('Booking failed: ' + (error.response?.data?.message || 'Server error'), { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!seats || !seats.length) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-white space-y-4">
       <Ticket className="w-16 h-16 text-white/10" />
       <p className="font-bold text-white/40">No seats selected to review.</p>
       <button onClick={() => navigate('/')} className="text-primary font-black uppercase italic">Back to Home</button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT: ORDER SUMMARY */}
          <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                 <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Checkout</h1>
                 <p className="text-white/40 text-sm font-bold">Review your order and select payment method</p>
              </div>

              {/* Movie & Seats Card */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                 <div className="relative flex flex-col md:flex-row gap-10 items-start">
                    <img src={movie?.poster} alt={movie?.title} className="w-32 h-44 object-cover rounded-2xl shadow-2xl" />
                    <div className="space-y-6 flex-1">
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">{theatre?.name}</p>
                          <h2 className="text-4xl font-black italic uppercase tracking-tighter">{movie?.title}</h2>
                          <p className="text-sm font-bold text-white/60">{showDate} • {showTime}</p>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          {seats.map(s => (
                             <span key={s.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase italic tracking-widest">{s.id}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Food Summary Card */}
              {selectedFoods?.length > 0 && (
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                       <CheckCircle2 className="text-green-500 w-5 h-5" /> Snacks & Drinks
                    </h3>
                    <div className="space-y-4">
                       {selectedFoods.map(food => (
                          <div key={food.foodId} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-4">
                                <img src={food.image} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                   <p className="text-xs font-black uppercase italic">{food.name}</p>
                                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Qty: {food.quantity} • ₹{food.price}</p>
                                </div>
                             </div>
                             <span className="font-black italic text-sm">₹{food.price * food.quantity}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
          </div>

          {/* RIGHT: BILLING & PAYMENT */}
          <div className="space-y-8">
              {/* Promo Code Block */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Have a Coupon?
                 </h4>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold w-full uppercase focus:border-primary outline-none transition-all"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-primary hover:bg-red-600 px-6 py-3 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all"
                    >
                       Apply
                    </button>
                 </div>
                 {appliedCoupon && (
                   <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-green-500 tracking-widest leading-none">Code {appliedCoupon.code} Applied</span>
                      <span className="text-sm font-black text-green-500">- ₹{appliedCoupon.discount}</span>
                   </div>
                 )}
              </div>

              {/* Wallet Block */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                 <div className="flex justify-between items-center font-black">
                    <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                       <Wallet className="w-4 h-4" /> Cine Wallet
                    </h4>
                    <span className="text-primary italic">₹{walletInfo.balance}</span>
                 </div>
                 <label className="flex items-center gap-4 cursor-pointer group bg-black/40 p-4 rounded-2xl border border-white/10 hover:border-primary/50 transition-all">
                    <div className="relative w-6 h-6 border-2 border-white/20 rounded-lg flex items-center justify-center group-hover:border-primary">
                       <input 
                         type="checkbox" 
                         checked={useWallet} 
                         onChange={() => setUseWallet(!useWallet)}
                         className="hidden" 
                       />
                       {useWallet && <div className="w-3 h-3 bg-primary rounded-[2px]" />}
                    </div>
                    <span className="text-xs font-black uppercase italic tracking-widest flex-1">Use Wallet Balance</span>
                 </label>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10 relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 shadow-[0_0_20px_rgba(255,24,24,0.5)]" />
                 
                 <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                       <span>Tickets Total ({seats.length})</span>
                       <span className="text-white">₹{ticketCost}</span>
                    </div>
                    {foodCost > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <span>Food & Add-ons</span>
                        <span className="text-white">₹{foodCost}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                       <span>Convenience Fee</span>
                       <span className="text-white">₹{convenienceFee}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-bold text-green-500 uppercase tracking-widest">
                        <span>Coupon Discount</span>
                        <span>- ₹{discount}</span>
                      </div>
                    )}
                    {walletDeduction > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        <span>Wallet Deduction</span>
                        <span>- ₹{walletDeduction}</span>
                      </div>
                    )}
                    
                    <div className="pt-8 border-t border-white/5 space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-white/20 uppercase italic leading-none">Final Payable</span>
                          <span className="text-5xl font-black tracking-tighter text-primary italic leading-none">₹{finalPayable}</span>
                       </div>
                    </div>
                 </div>

                 <button 
                  disabled={isProcessing}
                  onClick={handlePayment}
                  className="w-full bg-primary hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-3xl text-xl flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(255,24,24,0.3)]"
                 >
                    {isProcessing ? 'PROCESSING...' : finalPayable === 0 ? 'PAY WITH WALLET' : 'CONFIRM & PAY'}
                    {!isProcessing && <ArrowRight className="w-6 h-6" />}
                 </button>
                 
                 <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                       <ShieldCheck className="w-3 h-3 text-green-500/50" /> Secure SSL
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                       <QrCode className="w-3 h-3" /> E-Ticket
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
