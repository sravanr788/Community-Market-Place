import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    // Extract username from email (before @)
    const username = user?.displayName || user?.email?.split('@')[0] || 'User';
    const email = user?.email || 'No email';

    // Dummy product counts
    const productsListed = 0;
    const productsPurchased = 0;

    return (
        <ThemedView style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header with Logout Button */}
                <ThemedView style={styles.header}>
                    <ThemedText type="title" style={styles.headerTitle}>
                        Profile
                    </ThemedText>
                    <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: cardColor }]}>
                        <Ionicons name="log-out-outline" size={24} color={primaryColor} />
                    </TouchableOpacity>
                </ThemedView>

                {/* Avatar Section */}
                <ThemedView style={styles.avatarSection}>
                    {user?.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    ) : (
                        <ThemedView style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                            <Ionicons name="person" size={60} color="#fff" />
                        </ThemedView>
                    )}
                </ThemedView>

                {/* User Info Section */}
                <ThemedView style={styles.userInfoSection}>
                    <ThemedText type="subtitle" style={styles.username}>
                        {username}
                    </ThemedText>
                    <ThemedText style={[styles.email, { color: textSecondary }]}>
                        {email}
                    </ThemedText>
                </ThemedView>

                {/* Edit Profile Button */}
                <TouchableOpacity
                    onPress={handleEditProfile}
                    style={[styles.editButton, { backgroundColor: primaryColor }]}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
                </TouchableOpacity>

                {/* Product Statistics */}
                <ThemedView style={styles.statsContainer}>
                    {/* Products Listed Card */}
                    <ThemedView style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
                        <ThemedView style={[styles.statIconContainer, { backgroundColor: primaryColor + '20' }]}>
                            <Ionicons name="pricetag" size={28} color={primaryColor} />
                        </ThemedView>
                        <ThemedText type="defaultSemiBold" style={styles.statCount}>
                            {productsListed}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
                            Products Listed
                        </ThemedText>
                    </ThemedView>

                    {/* Products Purchased Card */}
                    <ThemedView style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
                        <ThemedView style={[styles.statIconContainer, { backgroundColor: primaryColor + '20' }]}>
                            <Ionicons name="cart" size={28} color={primaryColor} />
                        </ThemedView>
                        <ThemedText type="defaultSemiBold" style={styles.statCount}>
                            {productsPurchased}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
                            Products Purchased
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    headerTitle: {
        fontSize: 28,
    },
    logoutButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    userInfoSection: {
        alignItems: 'center',
        marginBottom: 32,
        gap: 8,
    },
    username: {
        fontSize: 24,
        fontWeight: '600',
    },
    email: {
        fontSize: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 32,
        gap: 8,
        shadowColor: '#0a7ea4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        gap: 12,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCount: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        textAlign: 'center',
    },
});
