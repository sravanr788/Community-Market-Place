import React, { useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateProfile, updateEmail } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebaseConfig';

const EditProfileSchema = Yup.object().shape({
    username: Yup.string()
        .min(2, 'Username must be at least 2 characters')
        .max(50, 'Username is too long')
        .required('Username is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
});

interface EditProfileFormValues {
    username: string;
    email: string;
    photoURL: string | null;
}

// Helper function to upload image using XHR (same as in sell.tsx)
function uriToBlobXHR(uri: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.onerror = () => reject(new Error('uriToBlobXHR: network request failed'));
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`uriToBlobXHR: bad status ${xhr.status}`));
                    }
                }
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        } catch (err) {
            reject(err);
        }
    });
}

async function uploadProfileImage(uri: string, userId: string): Promise<string> {
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storagePath = `profile_photos/${userId}_${Date.now()}_${filename}`;

    try {
        const blob = await uriToBlobXHR(uri);
        const ext = filename.split('.').pop()?.toLowerCase();
        const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const metadata = { contentType };

        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    console.error('Upload failed:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
                    resolve(downloadURL);
                }
            );
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
}

export default function EditProfileScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const pickImage = async (setFieldValue: (field: string, value: any) => void) => {
        Alert.alert(
            'Update Profile Photo',
            'Choose a source',
            [
                {
                    text: 'Camera',
                    onPress: async () => {
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                        });
                        if (!result.canceled) {
                            setFieldValue('photoURL', result.assets[0].uri);
                        }
                    },
                },
                {
                    text: 'Library',
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                        });
                        if (!result.canceled) {
                            setFieldValue('photoURL', result.assets[0].uri);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleSave = async (values: EditProfileFormValues) => {
        if (!user) {
            Alert.alert('Error', 'No user logged in');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            let photoURL = values.photoURL;

            // Upload new photo if it's a local file
            if (photoURL && !photoURL.startsWith('http')) {
                console.log('Uploading new profile photo...');
                photoURL = await uploadProfileImage(photoURL, user.uid);
                setUploadProgress(50);
            }

            // Update display name and photo URL
            await updateProfile(user, {
                displayName: values.username,
                photoURL: photoURL || user.photoURL,
            });
            setUploadProgress(75);

            // Update email if changed
            if (values.email !== user.email) {
                await updateEmail(user, values.email);
            }
            setUploadProgress(100);

            console.log('Profile updated successfully');
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            let errorMessage = 'Failed to update profile. Please try again.';

            if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Please log out and log in again to update your email.';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use by another account.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                {/* Header */}
                <ThemedView style={[styles.header, { backgroundColor: cardColor }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>
                        Edit Profile
                    </ThemedText>
                    <ThemedView style={styles.placeholder} />
                </ThemedView>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Formik<EditProfileFormValues>
                        initialValues={{
                            username: user?.displayName || '',
                            email: user?.email || '',
                            photoURL: user?.photoURL || null,
                        }}
                        validationSchema={EditProfileSchema}
                        onSubmit={handleSave}
                    >
                        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                            <ThemedView style={styles.form}>
                                {/* Avatar Section */}
                                <ThemedView style={styles.avatarSection}>
                                    <TouchableOpacity
                                        onPress={() => pickImage(setFieldValue)}
                                        style={styles.avatarContainer}
                                        disabled={uploading}
                                    >
                                        {values.photoURL ? (
                                            <Image
                                                source={{ uri: values.photoURL }}
                                                style={styles.avatar}
                                            />
                                        ) : (
                                            <ThemedView style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                                                <Ionicons name="person" size={60} color="#fff" />
                                            </ThemedView>
                                        )}
                                        <ThemedView style={[styles.editBadge, { backgroundColor: primaryColor }]}>
                                            <Ionicons name="camera" size={16} color="#fff" />
                                        </ThemedView>
                                    </TouchableOpacity>
                                    <ThemedText style={styles.avatarHint}>Tap to change photo</ThemedText>
                                </ThemedView>

                                {/* Username Input */}
                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText type="defaultSemiBold" style={styles.label}>
                                        Username
                                    </ThemedText>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { color: textColor, borderColor, backgroundColor: cardColor },
                                        ]}
                                        onChangeText={handleChange('username')}
                                        onBlur={handleBlur('username')}
                                        value={values.username}
                                        placeholder="Enter your username"
                                        placeholderTextColor="#999"
                                    />
                                    {errors.username && touched.username ? (
                                        <ThemedText style={styles.errorText}>{errors.username}</ThemedText>
                                    ) : null}
                                </ThemedView>

                                {/* Email Input */}
                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText type="defaultSemiBold" style={styles.label}>
                                        Email
                                    </ThemedText>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { color: textColor, borderColor, backgroundColor: cardColor },
                                        ]}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {errors.email && touched.email ? (
                                        <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
                                    ) : null}
                                </ThemedView>

                                {/* Save Button */}
                                <TouchableOpacity
                                    onPress={() => handleSubmit()}
                                    style={[
                                        styles.saveButton,
                                        { backgroundColor: primaryColor },
                                        uploading && styles.saveButtonDisabled,
                                    ]}
                                    disabled={uploading}
                                >
                                    <ThemedText style={styles.saveButtonText}>
                                        {uploading ? 'Saving...' : 'Save Changes'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    form: {
        gap: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarHint: {
        marginTop: 12,
        fontSize: 14,
        opacity: 0.6,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginLeft: 4,
    },
    saveButton: {
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#0a7ea4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
});
