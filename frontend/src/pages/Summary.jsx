import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Ticket, CreditCard, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Summary = () => {
  const { showId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { seats, totalPrice, show } = location.state || { seats: [], totalPrice: 0, show: null };
  const movie = show?.movie;
  const theatre = show?.theatre;
  
  const convenienceFee = Math.round(totalPrice * 0.1);
  const finalPayable = totalPrice + convenienceFee;

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const loadingToast = toast.loading('Processing payment...');
    
    try {
      // 1. Simulate Payment (Fake Success)
      const paymentId = 'PAY' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // 2. Persist Booking to Backend
      const response = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings', {
        showId: showId,
        movieId: show?.movieId,
        movieTitle: show?.movieTitle,
        theatreName: theatre?.name,
        showTime: new Date(show?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showDate: new Date(show?.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        seats: seats.map(s => s.id),
        totalAmount: finalPayable,
        paymentId: paymentId,
        paymentMethod: 'UPI'
      });

      toast.success('Payment Successful! Ticket Generated.', { id: loadingToast });
      
      // 3. Navigate to Ticket Page
      navigate(`/ticket/${response.data.bookingId}`);
    } catch (error) {
      toast.error('Booking failed: ' + (error.response?.data?.message || 'Server error'), { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!seats.length) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-white space-y-4">
       <Ticket className="w-16 h-16 text-white/10" />
       <p className="font-bold text-white/40">No seats selected to review.</p>
       <button onClick={() => navigate('/')} className="text-primary font-black uppercase italic">Back to Home</button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-20">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="space-y-10">
          <div className="text-center space-y-4">
             <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
                <CreditCard className="w-10 h-10" />
             </div>
             <h1 className="text-4xl font-black italic tracking-tighter uppercase">Payment Checkout</h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl">
            <div className="p-10 space-y-10">
              {/* Order Info */}
              <div className="flex justify-between items-start border-b border-white/5 pb-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">CineBook Experience</p>
                   <h2 className="text-3xl font-black tracking-tight uppercase italic text-primary">{show?.movieTitle}</h2>
                   <p className="text-xs font-bold text-white/50">{theatre?.name} • {show && new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Seats</p>
                   <p className="text-xl font-black tracking-tight text-white/80">{seats.map(s => s.id).join(', ')}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm font-bold text-white/40">
                   <span>Tickets Cost</span>
                   <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white/40">
                   <span>Convenience Fee (Tax Incl.)</span>
                   <span>₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                   <span className="text-xl font-black uppercase text-white/20 italic">Total To Pay</span>
                   <span className="text-5xl font-black tracking-tighter text-primary italic">₹{finalPayable}</span>
                </div>
              </div>

              {/* Final Step */}
              <div className="space-y-6 pt-6">
                 <button 
                  disabled={isProcessing}
                  onClick={handlePayment}
                  className="w-full bg-primary hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-3xl text-xl flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(255,24,24,0.3)]"
                 >
                    {isProcessing ? 'PROCESSING...' : 'PAY SECURELY NOW'}
                    {!isProcessing && <ArrowRight className="w-6 h-6" />}
                 </button>
                 
                 <div className="flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                       <ShieldCheck className="w-4 h-4 text-green-500/50" /> Secure Checkout
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                       <QrCode className="w-4 h-4" /> Digital E-Ticket
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-6 text-center border-t border-white/5">
               <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                 Transactions are protected by 256-bit encryption. Booking IDs are generated post-payment.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
