import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key)
    },
    setItem: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value)
    },
    removeItem: (key: string) => {
        SecureStore.deleteItemAsync(key)
    },
}

const getEnvOrDie = (key: string) => {
    const value = process.env[key]
    console.log("accesing env var: ", key)
    if (!value) {
        throw new Error(`Missing env var ${key}`)
    }
    return value
}

const supabaseUrl = getEnvOrDie("EXPO_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = getEnvOrDie("EXPO_PUBLIC_SUPABASE_ANON_KEY")

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})