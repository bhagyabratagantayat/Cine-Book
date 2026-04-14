import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar';
import { 
  Ticket as TicketIcon, MapPin, Calendar, Clock, Armchair, 
  CheckCircle2, Download, Share2, Loader2, Star, 
  UtensilsCrossed, Tag, Wallet, IndianRupee 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import usePageTitle from '../hooks/usePageTitle';

const Ticket = () => {
  usePageTitle('CineBook | Your Ticket');
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Fetch booking error:', error);
        toast.error('Booking not found!');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    const loadingToast = toast.loading('Generating your ticket PDF...');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#111111',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      pdf.save(`CineBook_Ticket_${booking.bookingId}.pdf`);
      
      toast.success('Ticket downloaded!', { id: loadingToast });
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
       <XCircle className="w-16 h-16 text-primary/20" />
       <h1 className="text-3xl font-black uppercase italic">Ticket Not Found</h1>
       <button onClick={() => navigate('/')} className="bg-primary px-8 py-3 rounded-xl font-black uppercase italic">Go Home</button>
    </div>
  );

  return (
    <div className="bg-black min-h-screen pb-20 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header Status */}
          <div className="flex justify-center">
             <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Booking Confirmed</span>
             </div>
          </div>

          <div className="relative" ref={ticketRef}>
            {/* TICKET BACKGROUND */}
            <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              
              {/* Vibe Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />

              {/* MOVIE HEADER */}
              <div className="p-8 pb-4 relative border-b border-white/5">
                <div className="flex gap-8 items-start">
                   <img src={booking.moviePoster} className="w-24 h-36 object-cover rounded-2xl shadow-2xl border border-white/10" alt="" />
                   <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2">
                         <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                         <span className="text-white text-[10px] font-black tracking-widest uppercase">{booking.movieRating?.toFixed(1) || '8.5'} Rating</span>
                      </div>
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{booking.movieTitle}</h2>
                      <div className="bg-white rounded-lg p-1.5 w-fit">
                         <QRCodeCanvas value={`CB-${booking.bookingId}`} size={40} level="H" />
                      </div>
                   </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="p-8 grid grid-cols-2 gap-y-10 border-b border-white/5">
                 <DetailBlock icon={<MapPin className="w-3 h-3" />} label="Theatre" value={booking.theatreName} />
                 <DetailBlock icon={<Calendar className="w-3 h-3" />} label="Date" value={booking.showDate} />
                 <DetailBlock icon={<Clock className="w-3 h-3" />} label="Showtime" value={booking.showTime} />
                 <DetailBlock icon={<Armchair className="w-3 h-3 text-primary" />} label="Seats" value={booking.seats.join(', ')} />
              </div>

              {/* FOOD ORDER SECTION (Conditional) */}
              {booking.foodItems && booking.foodItems.length > 0 && (
                <div className="p-8 bg-white/5 border-b border-white/5">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-3">
                      <UtensilsCrossed className="w-4 h-4 text-primary" /> Food Order
                   </h3>
                   <div className="space-y-4">
                      {booking.foodItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                           <div className="space-y-0.5">
                              <p className="font-black italic uppercase text-white/80">{item.name}</p>
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Qty: {item.quantity} • ₹{item.price}/ea</p>
                           </div>
                           <span className="font-black italic text-white/60">₹{item.total || item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center font-black uppercase italic text-[10px]">
                         <span className="text-white/30 tracking-widest">Food Total</span>
                         <span className="text-white">₹{booking.foodTotal || 0}</span>
                      </div>
                   </div>
                </div>
              )}

              {/* BILLING & CASHBACK */}
              <div className="p-8 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Booking ID</p>
                       <p className="text-xs font-black text-white/60 uppercase">{booking.bookingId}</p>
                    </div>
                    {booking.couponCode && (
                       <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                          <Tag className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-black uppercase text-primary tracking-widest">{booking.couponCode}</span>
                       </div>
                    )}
                 </div>

                 {/* Money Breakdown Card */}
                 <div className="bg-white/5 rounded-3xl p-6 space-y-4">
                    <BreakdownRow label="Subtotal" value={booking.subTotal} />
                    {booking.couponCode && <BreakdownRow label="Discount" value={`- ₹${booking.couponDiscount}`} isHighlight />}
                    <BreakdownRow label="Convenience Fee" value={`+ ₹${Math.round(booking.subTotal * 0.1)}`} />
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                       <h4 className="text-xs font-black uppercase italic text-white/30">Total Paid</h4>
                       <p className="text-3xl font-black italic tracking-tighter text-primary leading-none">₹{booking.totalAmount}</p>
                    </div>
                 </div>

                 {/* Cashback Badge */}
                 <div className="bg-green-500/10 border border-dashed border-green-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Wallet className="w-5 h-5 text-green-500" />
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-green-500/60">Wallet Cashback Earned</p>
                          <p className="text-xs font-black text-white uppercase italic">Added to your Cine Wallet</p>
                       </div>
                    </div>
                    <span className="text-xl font-black italic text-green-500">+ ₹{booking.cashbackEarned || booking.seats.length * 10}</span>
                 </div>
              </div>

              {/* Footer Tear-off */}
              <div className="p-8 border-t border-dashed border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                 <p>CineBook Confirmations</p>
                 <div className="flex gap-1.5 translate-y-0.5">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
                 </div>
                 <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 px-8 py-5 rounded-[2rem] font-black uppercase italic text-xs tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] hover:bg-white/10 transition-all">
               <Share2 className="w-6 h-6 text-white/40" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const DetailBlock = ({ icon, label, value }) => (
  <div className="space-y-2">
     <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
        {icon} {label}
     </div>
     <p className="text-sm font-black uppercase italic text-white/80">{value}</p>
  </div>
);

const BreakdownRow = ({ label, value, isHighlight }) => (
  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
     <span className="text-white/20 italic">{label}</span>
     <span className={isHighlight ? 'text-green-500' : 'text-white'}>{typeof value === 'number' ? `₹${value}` : value}</span>
  </div>
);

export default Ticket;
