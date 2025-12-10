import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

const STORAGE_KEY = 'user_session';

export const storeUserSession = async (user: User) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        console.log('User session stored');
    } catch (error) {
        console.error('Error storing user session:', error);
    }
};

export const getUserSession = async (): Promise<User | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('User session retrieved', jsonValue ? 'found' : 'empty');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error retrieving user session:', error);
        return null;
    }
};

export const clearUserSession = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('User session cleared');
    } catch (error) {
        console.error('Error clearing user session:', error);
    }
};
