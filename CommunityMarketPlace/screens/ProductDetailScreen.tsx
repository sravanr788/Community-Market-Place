import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { RootStackParamList } from '@/types';

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
    const route = useRoute<ProductDetailScreenRouteProp>();
    const navigation = useNavigation<ProductDetailScreenNavigationProp>();
    const { data } = route.params;

    if (!data) {
        return (
            <ThemedView style={[styles.container, styles.center]}>
                <ThemedText>No Product Data</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: data.image }} style={styles.image} />
            <ThemedView style={styles.content}>
                <ThemedText type="subtitle" style={styles.category}>{data.category}</ThemedText>
                <ThemedText type="title" style={styles.title}>{data.title}</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.price}>{data.price}</ThemedText>

                <View style={styles.divider} />

                <ThemedText style={styles.description}>
                    This is a detailed view of the product. Here you would typically see a full description, seller information, and more details.
                </ThemedText>

                <View style={styles.buttonContainer}>
                    <Button title="View Seller Profile" onPress={() => navigation.navigate('Profile')} />
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#eee',
    },
    content: {
        padding: 20,
    },
    category: {
        fontSize: 14,
        opacity: 0.6,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        color: '#0a7ea4',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.8,
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 12,
    }
});
