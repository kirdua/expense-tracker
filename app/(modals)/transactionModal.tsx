import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Text,
  Pressable,
  Platform
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale, scale } from '@/utils/styling'
import ModalWrapper from '../../components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import Typo from '@/components/Typo'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/imageService'
import * as Icons from 'phosphor-react-native'
import Input from '@/components/Input'
import { TransactionType, UserDataType, WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { updateUser } from '@/services/userService'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import ImageUpload from '@/components/imageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'
import { Dropdown } from 'react-native-element-dropdown'
import { expenseCategories, transactionTypes } from '@/constants/data'
import useFetchData from '@/hooks/useFetchData'
import { orderBy, where } from 'firebase/firestore'
import DateTimePicker, {
  DateTimePickerAndroid
} from '@react-native-community/datetimepicker'
import { createOrUpdateTransaction } from '@/services/transactionService'

const TransactionModal = () => {
  const { user } = useAuth()
  const [transaction, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    category: '',
    date: new Date(),
    description: '',
    image: null,
    walletId: ''
  })
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const router = useRouter()

  const {
    data: wallets,
    error: walletError,
    loading: walletLoading
  } = useFetchData<WalletType>('wallets', [
    where('uid', '==', user?.uid),
    orderBy('created', 'desc')
  ])

  const oldTransaction: { name: string; image: string; id: string } =
    useLocalSearchParams()

  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || transaction.date
    setTransaction({ ...transaction, date: currentDate })
    setShowDatePicker(Platform.OS == 'ios' ? true : false)
  }

  // useEffect(() => {
  //   if (oldTransaction?.id) {
  //     setTransaction({
  //       name: oldWallet?.name,
  //       image: oldWallet?.image
  //     })
  //   }
  // }, [])

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } =
      transaction

    if (!walletId || !date || !amount || (type == 'expense' && !category)) {
      Alert.alert('Transaction', 'Please fill in the fields')
      return
    }

    let transactionData: TransactionType = {
      type,
      amount,
      description,
      date,
      walletId,
      image,
      uid: user?.uid
    }

    //todo: add transaction id for update

    setLoading(true)
    const res = await createOrUpdateTransaction(transactionData)
    setLoading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert('Transaction', res.msg)
    }
  }

  const onDelete = async () => {
    if (!oldTransaction?.id) return
    setLoading(true)
    const res = await deleteWallet(oldTransaction?.id)
    setLoading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert('Transaction', res.msg)
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
          title={oldTransaction?.id ? 'Update Wallet' : 'New Wallet'}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* image */}
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/* type */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Type
            </Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              // placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={transactionTypes}
              maxHeight={300}
              labelField='label'
              valueField='value'
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              // placeholder={!isFocus ? 'Select item' : '...'}
              value={transaction.type}
              onChange={(item) => {
                setTransaction({ ...transaction, type: item.value })
              }}
            />
          </View>
          {/* wallet */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Wallet
            </Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={wallets.map((wallet) => ({
                label: `${wallet?.name} ($${wallet.amount})`,
                value: wallet?.id
              }))}
              maxHeight={300}
              labelField='label'
              valueField='value'
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              placeholder={'Select wallet'}
              value={transaction.walletId}
              onChange={(item) => {
                setTransaction({ ...transaction, walletId: item.value || '' })
              }}
            />
          </View>
          {/* expense category */}
          {transaction.type == 'expense' && (
            <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Expense Category</Typo>
              <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={Object.values(expenseCategories)}
                maxHeight={300}
                labelField='label'
                valueField='value'
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                placeholder={'Select category'}
                value={transaction.category?.value} //
                onChange={(item) => {
                  setTransaction({
                    ...transaction,
                    category: item,
                    type: item.value
                  })
                }}
              />
            </View>
          )}

          {/* date picker */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Date
            </Typo>
            {!showDatePicker && (
              <Pressable
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Typo size={14}>
                  {(transaction.date as Date).toLocaleDateString()}
                </Typo>
              </Pressable>
            )}

            {showDatePicker && (
              <View
                size={16}
                style={Platform.OS == 'ios' && styles.iosDatePicker}
              >
                <DateTimePicker
                  themeVariant='dark'
                  value={transaction.date as Date}
                  textColor={colors.white}
                  mode='date'
                  display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                />
              </View>
            )}

            {Platform.OS == 'ios' && (
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Typo size={15} fontWeight={'500'}>
                  Ok
                </Typo>
              </TouchableOpacity>
            )}
          </View>

          {/* amount */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Amount
            </Typo>
            <Input
              keyboardType='numeric'
              value={transaction.amount?.toString()}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  amount: Number(value.replace(/[^0-9]/g, ''))
                })
              }
            />
          </View>

          {/* description */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo size={16} color={colors.neutral200}>
                Description
              </Typo>
              <Typo size={14} color={colors.neutral500}>
                (optional)
              </Typo>
            </View>

            <Input
              value={transaction.description}
              multiline
              containerStyle={{
                flexDirection: 'row',
                height: verticalScale(100),
                alignItems: 'flex-start',
                paddingVertical: 15
              }}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  description: value
                })
              }
            />
          </View>
          {/* upload receipt */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo size={16} color={colors.neutral200}>
                Receipt
              </Typo>
              <Typo size={14} color={colors.neutral500}>
                (optional)
              </Typo>
            </View>

            <ImageUpload
              file={transaction.image}
              onClear={() => setTransaction({ ...transaction, image: null })}
              onSelect={(file) =>
                setTransaction({ ...transaction, image: file })
              }
              placeholder='Upload Image'
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldTransaction?.id && (
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
            {oldTransaction?.id ? 'Update' : 'Submit'}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20
  },
  form: {
    gap: spacingY._20,
    paddingVertical: spacingY._20,
    paddingBottom: spacingX._40
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1
  },
  inputContainer: {
    gap: spacingY._10
  },
  iosDropDown: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15
  },
  androidDropDown: {
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous'
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5
  },
  dateInput: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15
  },
  iosDatePicker: {},
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: 'flex-end',
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: 'continuous'
  },
  dropdownItemText: {
    color: colors.white
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14)
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5
  },
  dropdownPlaceholder: {
    color: colors.white
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14
  }
})
