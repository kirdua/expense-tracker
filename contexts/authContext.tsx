import { auth, firestore } from '@/config/firebase'
import { AuthContextType, UserType } from '@/types'
import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'expo-router'

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<UserType>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          name: firebaseUser?.displayName
        })
        updateUserData(firebaseUser.uid)
        router.replace('/(tabs)')
      } else {
        setUser(null)
        router.replace('/welcome')
      }
    })

    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return {
        success: true
      }
    } catch (error: any) {
      let msg = error.message
      if (msg.includes('auth/invalid-credential')) msg = 'Wrong Credentials'
      if (msg.includes('auth/invalid-email')) msg = 'Invalid email'
      return { success: false, msg }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      let res = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(firestore, 'users', res?.user?.uid), {
        name,
        email,
        uid: res?.user?.uid
      })
      return {
        success: true
      }
    } catch (error: any) {
      let msg = error.message
      if (msg.includes('auth/invalid-email')) msg = 'Invalid email'
      if (msg.includes('auth/email-already-in-use')) msg = 'Already in use'

      return { success: false, msg }
    }
  }

  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, 'users', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const userData: UserType = {
          uid: data?.uid,
          email: data.email || null,
          name: data.name || null,
          image: data.image || null
        }

        setUser({ ...userData })
      }
    } catch (error: any) {
      let msg = error.message
      // return { success: false, msg }
      console.error(msg)
    }
  }

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be wrapped inside AuthProvider')
  }
  return context
}
