import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

type ProductCardProps = {
    title: string;
    price: string;
    category: string;
    image: string;
};

export function ProductCard({ title, price, category, image }: ProductCardProps) {
    return (
        <ThemedView style={styles.card} lightColor="#fff" darkColor="#1a1a1a">
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.favoriteButton}>
                <Ionicons name="heart-outline" size={20} color="#fff" />
            </View>
            <View style={styles.content}>
                <ThemedText style={styles.category}>{category}</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
                    {title}
                </ThemedText>
                <ThemedText style={styles.price}>{price}</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#eee',
    },
    content: {
        padding: 12,
    },
    category: {
        fontSize: 12,
        opacity: 0.5,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 16,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0a7ea4',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
