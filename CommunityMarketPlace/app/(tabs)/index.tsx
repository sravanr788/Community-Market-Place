import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, useWindowDimensions, ActivityIndicator, Text } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { ThemedView } from '@/components/themed-view';

interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  image: string;
}



export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive column calculation
  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

  useEffect(() => {
    const db = getFirestore(app);
    const productsRef = collection(db, 'products');

    const unsubscribe = onSnapshot(productsRef,
      (snapshot) => {
        const productsData: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            title: data.title || 'Untitled',
            price: typeof data.price === 'number' ? `$${data.price}` : data.price || '$0',
            category: data.category || 'Uncategorized',
            image: data.image || 'https://via.placeholder.com/400', // Fallback image
          });
        });
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      title={item.title}
      price={item.price}
      category={item.category}
      image={item.image}
    />
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header />
      <FlatList
        key={numColumns} // Force re-render when columns change
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});
