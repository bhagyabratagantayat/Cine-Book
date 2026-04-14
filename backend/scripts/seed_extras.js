const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');

dotenv.config();

const foods = [
  {
    name: "Classic Salted Popcorn (L)",
    price: 350,
    image: "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=400&auto=format&fit=crop",
    category: "Snacks",
    isAvailable: true
  },
  {
    name: "Caramel Popcorn (M)",
    price: 180,
    image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=400&auto=format&fit=crop",
    category: "Snacks",
    isAvailable: true
  },
  {
    name: "Coca-Cola (500ml)",
    price: 120,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
    category: "Drinks",
    isAvailable: true
  },
  {
    name: "Pepsi (500ml)",
    price: 110,
    image: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?q=80&w=400&auto=format&fit=crop",
    category: "Drinks",
    isAvailable: true
  },
  {
    name: "Nachos with Extra Cheese",
    price: 250,
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&auto=format&fit=crop",
    category: "Snacks",
    isAvailable: true
  },
  {
    name: "Movie Combo (Popcorn + Coke)",
    price: 450,
    image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=400&auto=format&fit=crop",
    category: "Combos",
    isAvailable: true
  }
];

const coupons = [
  "PILU10", "MUNU10", "CINE10", "MOVIE10", "SEAT10", 
  "SHOW10", "FOOD10", "TICKET10", "BOOK10", "ENJOY10"
].map(code => ({
  code,
  discountType: "percentage",
  value: 10,
  minAmount: 0,
  expiryDate: new Date("2026-12-31"),
  isActive: true,
  usageLimit: 1
}));

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    await Food.deleteMany({});
    await Food.insertMany(foods);
    console.log('Food items seeded');

    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log('Coupons seeded');

    mongoose.connection.close();
    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
