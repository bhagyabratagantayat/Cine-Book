import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar';
import { Ticket as TicketIcon, MapPin, Calendar, Clock, Armchair, CheckCircle2, Download, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Ticket = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`);
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
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: '#1A1A1A', // Match ticket background
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // A4 width is 210, 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 10, 20, imgWidth, imgHeight);
      pdf.save(`Ticket_${booking.bookingId}.pdf`);
      
      toast.success('Ticket downloaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-rotate" /></div>;

  if (!booking) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-white space-y-6">
       <CheckCircle2 className="w-16 h-16 text-white/5" />
       <h1 className="text-3xl font-black italic uppercase">Invalid Ticket</h1>
       <button onClick={() => navigate('/')} className="bg-primary px-8 py-3 rounded-xl font-black uppercase italic hover:bg-red-600 transition-all">Go Home</button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-20">
      <Navbar />
      
      <div className="max-w-xl mx-auto px-4 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Status Badge */}
          <div className="flex justify-center">
             <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Booking Confirmed</span>
             </div>
          </div>

          {/* THE TICKET CARD */}
          <div className="relative group" ref={ticketRef}>
             {/* Left/Right Punch Holes (Visual Decor) */}
             <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full z-10" />
             <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full z-10" />

             <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
                
                {/* Header (Branding) */}
                <div className="bg-primary p-1 bg-gradient-to-r from-primary to-primary/80" />

                <div className="p-8 space-y-10">
                   {/* Movie Info */}
                   <div className="flex justify-between items-start">
                      <div className="space-y-2 max-w-[70%]">
                         <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">{booking.movieTitle}</h2>
                         <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.1em]">
                            <span className="bg-white/10 px-2 py-0.5 rounded italic">English</span>
                            <span className="bg-white/10 px-2 py-0.5 rounded italic whitespace-nowrap">Laser 4K</span>
                         </div>
                      </div>
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl">
                         <QRCodeSVG value={`CINEBOOK-${booking.bookingId}`} size={64} level="H" />
                      </div>
                   </div>

                   {/* Venue Details Grid */}
                   <div className="grid grid-cols-2 gap-y-8 border-y border-white/5 py-10">
                      <div className="space-y-1">
                         <p className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                            <MapPin className="w-3 h-3" /> Location
                         </p>
                         <p className="text-sm font-black uppercase italic text-white/80">{booking.theatreName}</p>
                      </div>
                      <div className="space-y-1 pl-4 border-l border-white/5">
                         <p className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> Date
                         </p>
                         <p className="text-sm font-black uppercase italic text-white/80">{booking.showDate}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> Showtime
                         </p>
                         <p className="text-sm font-black uppercase italic text-white/80">{booking.showTime}</p>
                      </div>
                      <div className="space-y-1 pl-4 border-l border-white/5">
                         <p className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                            <Armchair className="w-3 h-3" /> Seat IDs
                         </p>
                         <p className="text-sm font-black uppercase italic text-primary">{booking.seats.join(', ')}</p>
                      </div>
                   </div>

                   {/* Secondary Info */}
                   <div className="flex justify-between items-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                      <div className="space-y-1">
                         <p>Booking ID</p>
                         <p className="text-white/60 font-bold tracking-normal">{booking.bookingId}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <p>Total Paid</p>
                         <p className="text-white/60 font-bold tracking-normal">₹{booking.totalAmount}</p>
                      </div>
                   </div>
                </div>

                {/* Footer Tear-off part */}
                <div className="border-t border-dashed border-white/10 p-8 flex justify-between items-center bg-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                         <TicketIcon className="w-5 h-5" />
                      </div>
                      <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em] leading-tight max-w-[120px]">Scan this QR at the theatre entrance</p>
                   </div>
                   <div className="flex gap-4">
                      <button 
                         onClick={handleDownloadPDF}
                         disabled={isDownloading}
                         className={`bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-white/60 flex items-center gap-2 min-w-[140px] justify-center ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         {isDownloading ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                         ) : (
                           <Download className="w-5 h-5" />
                         )}
                         <span className="text-[10px] font-black uppercase italic">
                           {isDownloading ? 'Generating...' : 'Download PDF'}
                         </span>
                      </button>
                      <button className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-white/60">
                         <Share2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
             Please arrive 15 minutes before the show starts
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Ticket;
