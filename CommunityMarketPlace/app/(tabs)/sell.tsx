import { StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { ref, getDownloadURL, uploadString, uploadBytesResumable } from "firebase/storage";
import { getDocs, collection, getFirestore } from "firebase/firestore";
import { app, storage } from '../../firebaseConfig';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

const ProductSchema = Yup.object().shape({
    title: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    price: Yup.number()
        .typeError('Price must be a number')
        .positive('Price must be positive')
        .required('Required'),
    description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .required('Required'),
    image: Yup.string(),
});

interface SellFormValues {
    title: string;
    price: string;
    description: string;
    image: string | null;
}

/* -------------------------
   Helper: multi-strategy upload
   Tries: XHR -> fetch -> base64 fallback
   ------------------------- */

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

async function uriToBlobFetch(uri: string): Promise<Blob> {
    const res = await fetch(uri);
    if (!res.ok) throw new Error(`uriToBlobFetch: fetch failed status ${res.status}`);
    return await res.blob();
}

async function uploadBase64Fallback(uri: string, storagePath: string, filename: string) {
    try {
        const base64 = await FileSystemLegacy.readAsStringAsync(uri, { encoding: FileSystemLegacy.EncodingType.Base64 });
        const storageRef = ref(storage, storagePath);
        const metadata = { contentType: filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' };
        const snapshot = await uploadString(storageRef, base64, 'base64', metadata);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    } catch (err: any) {
        throw new Error(`uploadBase64Fallback failed: ${err?.message ?? err}`);
    }
}

async function uploadImage(uri: string, onProgress?: (progress: number) => void): Promise<string> {
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storagePath = `images/${Date.now()}_${filename}`;

    let blob: Blob | null = null;

    // try XHR
    try {
        blob = await uriToBlobXHR(uri);
        console.log('uploadImage: got blob via XHR');
    } catch (xhrErr) {
        console.warn('uriToBlobXHR failed:', xhrErr);
        // try fetch
        try {
            blob = await uriToBlobFetch(uri);
            console.log('uploadImage: got blob via fetch');
        } catch (fetchErr) {
            console.warn('uriToBlobFetch failed:', fetchErr);
            // fallthrough to base64 fallback
        }
    }

    if (blob) {
        return new Promise((resolve, reject) => {
            const ext = filename.split('.').pop()?.toLowerCase();
            const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
            const metadata = { contentType };

            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    if (onProgress) onProgress(progress);

                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    // @ts-ignore
                    if (blob && typeof blob.close === 'function') blob.close();
                    console.error('uploadBytesResumable failed:', error);
                    reject(error);
                },
                () => {
                    // @ts-ignore
                    if (blob && typeof blob.close === 'function') blob.close();
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        resolve(downloadURL);
                    });
                }
            );
        });
    }

    // fallback
    try {
        console.warn('uploadImage: falling back to base64 upload (legacy FileSystem).');
        const url = await uploadBase64Fallback(uri, storagePath, filename);
        console.log('uploadImage: uploaded via base64 ->', url);
        return url;
    } catch (finalErr) {
        console.error('uploadImage: all methods failed. final error:', finalErr);
    }

    return "";
}

// fetch the products collection from firebase
async function fetchProducts() {
    const db = getFirestore(app);

    console.log("Fetching products...");
    try {
        const colRef = collection(db, "products");
        const snapshot = await getDocs(colRef);

        if (snapshot.empty) {
            console.log("⚠️ No documents found in 'products' collection.");
            return;
        }


        console.info("✅ Fetch finished. Total docs:", snapshot.size);
    } catch (err) {
        console.error("❌ Error fetching products:", err);
    }
}

useEffect(() => {
    fetchProducts();
}, []);

export default function SellScreen() {
    const insets = useSafeAreaInsets();
    const inputBgColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const pickImage = async (setFieldValue: (field: string, value: any) => void) => {
        Alert.alert(
            "Upload Photo",
            "Choose a source",
            [
                {
                    text: "Camera",
                    onPress: async () => {
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 1,
                        });
                        if (!result.canceled) {
                            setFieldValue('image', result.assets[0].uri);
                        }
                    }
                },
                {
                    text: "Library",
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 1,
                        });
                        if (!result.canceled) {
                            setFieldValue('image', result.assets[0].uri);
                        }
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <ThemedText type="title" style={styles.header}>Sell Item</ThemedText>

                    <Formik<SellFormValues>
                        initialValues={{ title: '', price: '', description: '', image: null }}
                        validationSchema={ProductSchema}
                        onSubmit={async (values, { resetForm }) => {
                            if (!values.image) {
                                Alert.alert('Error', 'Please select an image');
                                return;
                            }

                            setUploading(true);
                            setUploadProgress(0);
                            try {
                                let imageUrl = values.image;
                                // Only upload if it's a local file (not already an HTTP URL)
                                if (!imageUrl.startsWith('http')) {
                                    imageUrl = await uploadImage(imageUrl, (p) => setUploadProgress(p));
                                }

                                const finalData = { ...values, image: imageUrl };
                                console.log('Product Data:', finalData);
                                Alert.alert('Success', 'Product listed successfully!', [
                                    { text: 'OK', onPress: () => resetForm() }
                                ]);
                            } catch (error) {
                                console.error('onSubmit upload error:', error);
                                Alert.alert('Error', 'Failed to upload image. Please try again.');
                            } finally {
                                setUploading(false);
                            }
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                            <ThemedView style={styles.form}>
                                {/* Image Placeholder */}
                                <TouchableOpacity
                                    style={styles.imagePlaceholder}
                                    onPress={() => pickImage(setFieldValue)}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <ThemedView style={styles.progressContainer}>
                                            <ThemedText style={styles.progressText}>{Math.round(uploadProgress)}%</ThemedText>
                                            <ActivityIndicator size="small" color="#0a7ea4" />
                                        </ThemedView>
                                    ) : values.image ? (
                                        <Image
                                            source={{ uri: values.image }}
                                            style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                        />
                                    ) : (
                                        <>
                                            <Ionicons name="camera-outline" size={48} color="#ccc" />
                                            <ThemedText style={styles.imageText}>Tap to add photos</ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                                {errors.image && touched.image ? (
                                    <ThemedText style={styles.errorText}>{errors.image}</ThemedText>
                                ) : null}

                                {/* Title Input */}
                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText type="defaultSemiBold" style={styles.label}>Title</ThemedText>
                                    <TextInput
                                        style={[styles.input, { color: textColor, borderColor: '#ddd' }]}
                                        onChangeText={handleChange('title')}
                                        onBlur={handleBlur('title')}
                                        value={values.title}
                                        placeholder="What are you selling?"
                                        placeholderTextColor="#999"
                                    />
                                    {errors.title && touched.title ? (
                                        <ThemedText style={styles.errorText}>{errors.title}</ThemedText>
                                    ) : null}
                                </ThemedView>

                                {/* Price Input */}
                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText type="defaultSemiBold" style={styles.label}>Price</ThemedText>
                                    <TextInput
                                        style={[styles.input, { color: textColor, borderColor: '#ddd' }]}
                                        onChangeText={handleChange('price')}
                                        onBlur={handleBlur('price')}
                                        value={values.price}
                                        placeholder="0.00"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                    />
                                    {errors.price && touched.price ? (
                                        <ThemedText style={styles.errorText}>{errors.price}</ThemedText>
                                    ) : null}
                                </ThemedView>

                                {/* Description Input */}
                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText type="defaultSemiBold" style={styles.label}>Description</ThemedText>
                                    <TextInput
                                        style={[styles.input, styles.textArea, { color: textColor, borderColor: '#ddd' }]}
                                        onChangeText={handleChange('description')}
                                        onBlur={handleBlur('description')}
                                        value={values.description}
                                        placeholder="Describe your item..."
                                        placeholderTextColor="#999"
                                        multiline
                                        numberOfLines={4}
                                    />
                                    {errors.description && touched.description ? (
                                        <ThemedText style={styles.errorText}>{errors.description}</ThemedText>
                                    ) : null}
                                </ThemedView>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    onPress={() => handleSubmit()}
                                    style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                                    disabled={uploading}
                                >
                                    <ThemedText style={styles.submitButtonText}>
                                        {uploading ? 'Uploading...' : 'Post Item'}
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
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    form: {
        gap: 20,
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
        backgroundColor: 'transparent',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    imagePlaceholder: {
        height: 200,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    imageText: {
        marginTop: 12,
        color: '#888',
    },
    progressContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#0a7ea4',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#0a7ea4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
});
