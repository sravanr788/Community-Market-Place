import React from 'react';
import { StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
});

export default function SellScreen() {
    const insets = useSafeAreaInsets();
    const inputBgColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <ThemedText type="title" style={styles.header}>Sell Item</ThemedText>

                    <Formik
                        initialValues={{ title: '', price: '', description: '' }}
                        validationSchema={ProductSchema}
                        onSubmit={(values, { resetForm }) => {
                            Alert.alert('Success', 'Product listed successfully! (Demo)', [
                                { text: 'OK', onPress: () => resetForm() }
                            ]);
                            console.log(values);
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                            <ThemedView style={styles.form}>
                                {/* Image Placeholder */}
                                <TouchableOpacity style={styles.imagePlaceholder}>
                                    <Ionicons name="camera-outline" size={48} color="#ccc" />
                                    <ThemedText style={styles.imageText}>Tap to add photos</ThemedText>
                                </TouchableOpacity>

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
                                <TouchableOpacity onPress={() => handleSubmit()} style={styles.submitButton}>
                                    <ThemedText style={styles.submitButtonText}>Post Item</ThemedText>
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
});
