import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale, scale } from '@/utils/styling'
import ModalWrapper from '../../components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import Typo from '@/components/Typo'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/imageService'
import * as Icons from 'phosphor-react-native'
import Input from '@/components/Input'
import { UserDataType, WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { updateUser } from '@/services/userService'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import ImageUpload from '@/components/imageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'

const WalletModal = () => {
  const { user, updateUserData } = useAuth()
  const [wallet, setWallet] = useState<WalletType>({
    name: '',
    image: null
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const oldWallet: { name: string; image: string; id: string } =
    useLocalSearchParams()

  useEffect(() => {
    if (oldWallet?.id) {
      setWallet({
        name: oldWallet?.name,
        image: oldWallet?.image
      })
    }
  }, [])

  const onSubmit = async () => {
    let { name, image } = wallet
    if (!name.trim() || !image) {
      Alert.alert('Wallet', 'Please fill in all the fields.')
      return
    }

    const data: WalletType = {
      name,
      image,
      uid: user?.uid
    }

    if (oldWallet?.id) data.id = oldWallet?.id

    setLoading(true)
    const res = await createOrUpdateWallet(data)
    setLoading(false)

    if (res.success) {
      router.back()
    } else {
      Alert.alert('Wallet', res.msg)
    }
  }

  const onDelete = async () => {
    if (!oldWallet?.id) return
    setLoading(true)
    const res = await deleteWallet(oldWallet?.id)
    setLoading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert('Wallet', res.msg)
    }
  }

  const showDeleteAlert = () => {
    Alert.alert(
      'Confirm',
      'Are you sure want to remove this wallet along with its transactions?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('cancel'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => onDelete(),
          style: 'destructive'
        }
      ]
    )
  }

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldWallet?.id ? 'Update Wallet' : 'New Wallet'}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* image */}
        <ScrollView contentContainerStyle={styles.form}>
          {/* form */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Name</Typo>
            <Input
              placeholder='Salary'
              value={wallet.name}
              onChangeText={(value) => setWallet({ ...wallet, name: value })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Icon</Typo>
            {/* image input */}
            <ImageUpload
              file={wallet.image}
              onClear={() => setWallet({ ...wallet, image: null })}
              onSelect={(file) => setWallet({ ...wallet, image: file })}
              placeholder='Upload Image'
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldWallet?.id && (
          <Button
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15
            }}
            onPress={showDeleteAlert}
          >
            <Icons.Trash
              color={colors.white}
              size={verticalScale(24)}
              weight='bold'
            />
          </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={'700'}>
            {oldWallet?.id ? 'Update Wallet' : 'Add Wallet'}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default WalletModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingY._20
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._20,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15
  },
  avatarContainter: {
    position: 'relative',
    alignSelf: 'center'
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500
  },
  editIcon: {
    position: 'absolute',
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7
  },
  inputContainer: {
    gap: spacingY._10
  }
})
