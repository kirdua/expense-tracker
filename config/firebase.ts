// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDHWhZ0YCIvybDzR-v0uBoJa9k3YOKk2wA',
  authDomain: 'expense-tracker-f0d2c.firebaseapp.com',
  projectId: 'expense-tracker-f0d2c',
  storageBucket: 'expense-tracker-f0d2c.firebasestorage.app',
  messagingSenderId: '454350863249',
  appId: '1:454350863249:web:30ad8e2e5b0ad62b3e7830'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

//auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

//db
export const firestore = getFirestore()
