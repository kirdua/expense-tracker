import { Pressable, StyleSheet, Text, View, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import Button from '@/components/Button'
import * as Icons from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/authContext'

const Login = () => {
  const router = useRouter()
  const emailRef = useRef('')
  const passwordRef = useRef('')
  const [isLoading, setIsLoading] = useState(false)
  const { login: loginUser } = useAuth()

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', 'Please fill in all the fields')
      return
    }
    setIsLoading(true)
    const res = await loginUser(emailRef.current, passwordRef.current)
    setIsLoading(false)

    if (!res.success) {
      Alert.alert('Login', res.msg)
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={'800'}>
            Hey,
          </Typo>
          <Typo size={30} fontWeight={'800'}>
            Welcome back
          </Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Login now to track all your expenses
          </Typo>
          <Input
            placeholder='Enter your email'
            onChangeText={(value) => (emailRef.current = value)}
            icon={
              <Icons.At
                size={verticalScale(26)}
                color={colors.neutral300}
                weight='fill'
              />
            }
          />

          <Input
            placeholder='Enter your password'
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={
              <Icons.Lock
                size={verticalScale(26)}
                color={colors.neutral300}
                weight='fill'
              />
            }
          />

          <Typo size={14} color={colors.text} style={{ alignSelf: 'flex-end' }}>
            Forgot Password?
          </Typo>
          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo fontWeight={'700'} color={colors.black} size={21}>
              Login
            </Typo>
          </Button>
        </View>

        <View style={styles.footer}>
          <Typo size={15}>Don't have an account?</Typo>
          <Pressable onPress={() => router.navigate('/register')}>
            <Typo size={15} fontWeight={'700'} color={colors.primary}>
              Sign up
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: colors.text
  },
  form: {
    gap: spacingY._20
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: '500',
    color: colors.text
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  footerText: {
    textAlign: 'center',
    color: colors.text,
    fontSize: verticalScale(15)
  }
})
