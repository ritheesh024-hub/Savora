
import { FoodItem } from './store';
import placeholderData from './placeholder-images.json';

const getImg = (id: string) => placeholderData.placeholderImages.find(img => img.id === id)?.imageUrl || '';

export const MENU_ITEMS: FoodItem[] = [
  // Existing Items
  { id: '1', name: 'Classic Veg Maggie', description: 'Freshly prepared spicy masala maggie with garden fresh veggies.', price: 69, category: 'Snacks', imageUrl: getImg('food-maggie-1'), isVeg: true, rating: 4.5, isAvailable: true },
  { id: '2', name: 'Egg Maggie Special', description: 'Maggie infused with scrambled eggs and special cafe spices.', price: 89, category: 'Snacks', imageUrl: getImg('food-maggie-2'), isVeg: false, rating: 4.2, isAvailable: true },
  { id: '4', name: 'Hyderabadi Chicken Biryani', description: 'Long grain basmati rice cooked with tender chicken and authentic spices.', price: 249, category: 'Biryani', imageUrl: getImg('food-biryani-1'), isVeg: false, rating: 4.9, isAvailable: true },
  
  // Tea Items
  { id: 'tea-1', name: 'Masala Tea', description: 'Authentic Indian tea brewed with ginger, cardamom, and secret spices.', price: 25, category: 'Drinks', imageUrl: getImg('tea-masala'), isVeg: true, rating: 4.8, isAvailable: true, isBeverage: true, isBestSeller: true },
  { id: 'tea-2', name: 'Ginger Tea', description: 'Refreshing tea with the strong punch of fresh grated ginger.', price: 25, category: 'Drinks', imageUrl: getImg('tea-ginger'), isVeg: true, rating: 4.6, isAvailable: true, isBeverage: true },
  { id: 'tea-3', name: 'Green Tea', description: 'Healthy and antioxidant-rich pure green tea leaves.', price: 35, category: 'Drinks', imageUrl: getImg('tea-green'), isVeg: true, rating: 4.4, isAvailable: true, isBeverage: true },
  { id: 'tea-4', name: 'Lemon Tea', description: 'Tangy and refreshing lemon-infused black tea.', price: 30, category: 'Drinks', imageUrl: getImg('tea-lemon'), isVeg: true, rating: 4.5, isAvailable: true, isBeverage: true },
  { id: 'tea-8', name: 'Ice Tea', description: 'Chilled peach infused black tea served with ice and mint.', price: 69, category: 'Drinks', imageUrl: getImg('tea-ice'), isVeg: true, rating: 4.7, isAvailable: true, isBeverage: true, isPopular: true },

  // Coffee Items
  { id: 'coffee-1', name: 'Classic Coffee', description: 'Rich and aromatic instant coffee brewed to perfection.', price: 35, category: 'Drinks', imageUrl: getImg('coffee-classic'), isVeg: true, rating: 4.5, isAvailable: true, isBeverage: true },
  { id: 'coffee-2', name: 'Filter Coffee', description: 'Traditional South Indian decoction coffee with frothy milk.', price: 45, category: 'Drinks', imageUrl: getImg('coffee-filter'), isVeg: true, rating: 4.9, isAvailable: true, isBeverage: true, isBestSeller: true },
  { id: 'coffee-3', name: 'Cold Coffee', description: 'Creamy blended coffee served chilled with chocolate syrup.', price: 99, category: 'Drinks', imageUrl: getImg('coffee-cold'), isVeg: true, rating: 4.8, isAvailable: true, isBeverage: true, isPopular: true },
  { id: 'coffee-4', name: 'Cappuccino', description: 'Double shot espresso with steamed milk and thick foam.', price: 129, category: 'Drinks', imageUrl: getImg('coffee-cappuccino'), isVeg: true, rating: 4.7, isAvailable: true, isBeverage: true },
  { id: 'coffee-7', name: 'Mocha', description: 'The perfect blend of rich chocolate and bold espresso.', price: 149, category: 'Drinks', imageUrl: getImg('coffee-mocha'), isVeg: true, rating: 4.6, isAvailable: true, isBeverage: true }
];

export const CATEGORIES = [
  'All', 
  'Biryani', 
  'Momos', 
  'Noodles', 
  'Fried Rice', 
  'Pizza', 
  'Burgers', 
  'Drinks', 
  'Desserts', 
  'Snacks'
];
