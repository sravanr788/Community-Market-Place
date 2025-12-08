import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

export function Header() {
    const insets = useSafeAreaInsets();

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.titleWrapper}>
                <ThemedText type="subtitle">Community Marketplace</ThemedText>
                <ThemedText style={styles.subtitle}>Discover items nearby</ThemedText>
            </View>
            <View style={styles.iconButton}>
                <Ionicons name="search-outline" size={24} color="#888" />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleWrapper: {
        gap: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
