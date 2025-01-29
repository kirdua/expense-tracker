import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/contexts/authContext'
import ProfileModal from './(modals)/profileModal'

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='(modals)/profileModal'
        options={{ presentation: 'modal' }}
      ></Stack.Screen>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({})
