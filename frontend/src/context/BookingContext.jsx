import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};

export const BookingProvider = ({ children }) => {
    // Initial state from localStorage or default
    const [bookingData, setBookingData] = useState(() => {
        const saved = localStorage.getItem('cinebook_booking');
        let guestId = localStorage.getItem('guestUserId');
        
        if (!guestId) {
            guestId = 'G' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('guestUserId', guestId);
        }

        const defaultData = {
            showId: null,
            movie: null,
            theatre: null,
            showTime: null,
            showDate: null,
            seats: [],
            totalPrice: 0,
            selectedFoods: [],
            totalFoodPrice: 0,
            appliedCoupon: null,
            guestUserId: guestId
        };

        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    });

    // Persist to localStorage whenever bookingData changes
    useEffect(() => {
        if (bookingData.showId || bookingData.movie) {
            localStorage.setItem('cinebook_booking', JSON.stringify(bookingData));
        } else {
            localStorage.removeItem('cinebook_booking');
        }
    }, [bookingData]);

    const updateBooking = (newData) => {
        setBookingData(prev => ({ ...prev, ...newData }));
    };

    const clearBooking = () => {
        setBookingData({
            showId: null,
            movie: null,
            theatre: null,
            showTime: null,
            showDate: null,
            seats: [],
            totalPrice: 0
        });
        localStorage.removeItem('cinebook_booking');
    };

    return (
        <BookingContext.Provider value={{ bookingData, updateBooking, clearBooking }}>
            {children}
        </BookingContext.Provider>
    );
};
