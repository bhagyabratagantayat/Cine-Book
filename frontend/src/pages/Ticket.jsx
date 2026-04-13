import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar';
import { Ticket as TicketIcon, MapPin, Calendar, Clock, Armchair, CheckCircle2, Download, Share2, Loader2, Star } from 'lucide-react';
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

  const generateManualPDF = (booking) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFillColor(20, 20, 20);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(229, 9, 20); // CineBook Red
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CINEBOOK', 20, 25);
    
    // Ticket Body
    pdf.setFillColor(26, 26, 26);
    pdf.roundedRect(20, 50, pageWidth - 40, 180, 5, 5, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text(booking.movieTitle.toUpperCase(), 30, 75);
    
    pdf.setFontSize(12);
    pdf.setTextColor(150, 150, 150);
    pdf.text('BOOKING CONFIRMED', 30, 85);
    
    // Details Grid
    pdf.setDrawColor(50, 50, 50);
    pdf.line(30, 95, pageWidth - 30, 95);
    
    const drawDetail = (label, value, x, y) => {
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(label.toUpperCase(), x, y);
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text(value, x, y + 8);
    };
    
    drawDetail('Theatre', booking.theatreName, 30, 110);
    drawDetail('Date', booking.showDate, 120, 110);
    drawDetail('Time', booking.showTime, 30, 135);
    drawDetail('Seats', booking.seats.join(', '), 120, 135);
    
    pdf.line(30, 155, pageWidth - 30, 155);
    
    drawDetail('Booking ID', booking.bookingId, 30, 175);
    drawDetail('Total Paid', `Rs. ${booking.totalAmount}`, 120, 175);
    
    // QR Substitute
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth - 60, 185, 30, 30, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(6);
    pdf.text('SCAN AT ENTRY', pageWidth - 55, 218);
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('This is a computer generated ticket. No signature required.', pageWidth / 2, 250, { align: 'center' });
    
    pdf.save(`Ticket_Fallback_${booking.bookingId}.pdf`);
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || isDownloading) return;
    
    setIsDownloading(true);
    const loadingToast = toast.loading('Generating your ticket PDF...');

    try {
      // 1. Wait for images and QR to be fully ready
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. Capture using html2canvas
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // Optimal scale as requested
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1A1A1A',
        logging: false,
        onclone: (clonedDoc) => {
          // 3. REMOVE problematic CSS that breaks capture
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach(el => {
             const style = window.getComputedStyle(el);
             if (style.backdropFilter !== 'none' || style.filter !== 'none') {
                el.style.backdropFilter = 'none';
                el.style.filter = 'none';
             }
             // Specifically remove the blur-sm class if present
             el.classList.remove('blur-sm');
          });
          
          // Ensure background is solid
          const container = clonedDoc.querySelector('.ticket-container');
          if (container) {
             container.style.backgroundColor = '#1A1A1A';
             container.style.borderRadius = '2rem';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 40; // 20mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the ticket
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      pdf.save(`CineBook_Ticket_${booking.bookingId}.pdf`);
      
      toast.success('Ticket downloaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error('High-Quality PDF Generation Failed. Switching to manual fallback...', error);
      
      try {
        generateManualPDF(booking);
        toast.success('Generated Standard Ticket (Fallback Mode)', { id: loadingToast });
      } catch (fallbackError) {
        console.error('Ultimate Fallback Failure:', fallbackError);
        toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
      }
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
          <div className="relative group ticket-container" ref={ticketRef} style={{ backgroundColor: '#141414' }}>
             {/* Left/Right Punch Holes (Visual Decor) */}
             <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full z-10" style={{ backgroundColor: '#141414' }} />
             <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full z-10" style={{ backgroundColor: '#141414' }} />

             <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative" style={{ backgroundColor: '#1A1A1A' }}>
                {/* Header (Branding) */}
                <div className="h-1" style={{ backgroundColor: '#E50914' }} />

                {/* Movie Header with Poster Backdrop */}
                <div className="relative h-48 overflow-hidden">
                   <img 
                      src={booking.moviePoster || 'https://via.placeholder.com/500x750?text=CineBook'} 
                      className="w-full h-full object-cover opacity-30 blur-sm scale-110"
                      alt="Backdrop"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
                   <div className="absolute bottom-6 left-8 flex items-end gap-6">
                      <img 
                         src={booking.moviePoster} 
                         className="w-20 rounded-lg shadow-2xl border border-white/10"
                         alt="Poster"
                      />
                      <div className="pb-1">
                         <div className="flex items-center gap-2 mb-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-white text-[10px] font-black">{booking.movieRating ? booking.movieRating.toFixed(1) : 'NR'}</span>
                         </div>
                         <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none" style={{ color: '#FFFFFF' }}>{booking.movieTitle}</h2>
                      </div>
                   </div>
                </div>

                <div className="p-8 pt-4 space-y-10">
                   {/* Sync IDs and QR */}
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                         <span className="px-2 py-0.5 rounded italic text-[10px] font-black uppercase" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>English</span>
                         <span className="px-2 py-0.5 rounded italic text-[10px] font-black uppercase whitespace-nowrap" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Laser 4K</span>
                      </div>
                      <div className="bg-white rounded-lg flex items-center justify-center p-1.5 shadow-2xl">
                         <QRCodeCanvas value={`CINEBOOK-${booking.bookingId}`} size={48} level="H" includeMargin={false} />
                      </div>
                   </div>

                   {/* Venue Details Grid */}
                   <div className="grid grid-cols-2 gap-y-8 border-y border-white/5 py-10">
                      <div className="space-y-1">
                         <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                            <MapPin className="w-3 h-3" /> Location
                         </p>
                         <p className="text-sm font-black uppercase italic" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{booking.theatreName}</p>
                      </div>
                      <div className="space-y-1 pl-4 border-l border-white/5">
                         <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                            <Calendar className="w-3 h-3" /> Date
                         </p>
                         <p className="text-sm font-black uppercase italic" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{booking.showDate}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                            <Clock className="w-3 h-3" /> Showtime
                         </p>
                         <p className="text-sm font-black uppercase italic" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{booking.showTime}</p>
                      </div>
                      <div className="space-y-1 pl-4 border-l border-white/5">
                         <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                            <Armchair className="w-3 h-3" /> Seat IDs
                         </p>
                         <p className="text-sm font-black uppercase italic" style={{ color: '#E50914' }}>{booking.seats.join(', ')}</p>
                      </div>
                   </div>

                   {/* Secondary Info */}
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                      <div className="space-y-1">
                         <p>Booking ID</p>
                         <p className="tracking-normal font-bold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{booking.bookingId}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <p>Total Paid</p>
                         <p className="tracking-normal font-bold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>₹{booking.totalAmount}</p>
                      </div>
                   </div>
                </div>

                {/* Footer Tear-off part */}
                <div className="border-t border-dashed border-white/10 p-8 flex justify-between items-center bg-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary border border-primary/20" style={{ backgroundColor: 'rgba(229, 9, 20, 0.2)' }}>
                         <TicketIcon className="w-5 h-5" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-tight max-w-[120px]" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Scan this QR at the theatre entrance</p>
                   </div>
                   <div className="flex gap-4">
                      <button 
                         onClick={handleDownloadPDF}
                         disabled={isDownloading}
                         className={`p-3 rounded-xl border transition-all text-white/60 flex items-center gap-2 min-w-[140px] justify-center ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                         style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
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
                      <button className="p-3 rounded-xl border hover:bg-white/10 transition-all text-white/60" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                         <Share2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
             Please arrive 15 minutes before the show starts
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Ticket;
