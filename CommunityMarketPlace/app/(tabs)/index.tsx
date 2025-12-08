import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { ThemedView } from '@/components/themed-view';

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Vintage Film Camera',
    price: '$120',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    title: 'Modern Lamp',
    price: '$45',
    category: 'Home & Living',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTlednML_LSGmZQq-kN4aGbHQkFRPRyb-2Dw&s',
  },
  {
    id: '3',
    title: 'Leather Backpack',
    price: '$85',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '4',
    title: 'Wireless Headphones',
    price: '$199',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '5',
    title: 'Succulent Plant',
    price: '$15',
    category: 'Plants',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '6',
    title: 'Mechanical Keyboard',
    price: '$150',
    category: 'Electronics',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShX72VjMtF80D9Gsk24CKQJ6ao9T_-Xfg7Ag&s',
  },
];

export default function HomeScreen() {
  const renderItem = ({ item }: { item: typeof MOCK_PRODUCTS[0] }) => (
    <ProductCard
      title={item.title}
      price={item.price}
      category={item.category}
      image={item.image}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <Header />
      <FlatList
        data={MOCK_PRODUCTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100, // Bottom tab bar offset
  },
});
