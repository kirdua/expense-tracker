import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { TransactionItemProps, TransactionListType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { colors, radius, spacingY, spacingX } from '@/constants/theme'
import Typo from './Typo'
import { FlashList } from '@shopify/flash-list'
import Loading from './Loading'
import { expenseCategories, incomeCategory } from '@/constants/data'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Icons from 'phosphor-react-native'

const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage
}: TransactionListType) => {
  const handleClick = () => {
    console.log('handleClick')
  }

  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} fontWeight={'500'}>
          {title}
        </Typo>
      )}

      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem
              item={item}
              index={index}
              handleClick={handleClick}
            />
          )}
          estimatedItemSize={60}
        />
      </View>

      {!loading && data.length == 0 && (
        <Typo
          size={15}
          color={colors.neutral400}
          style={{ textAlign: 'center', marginTop: spacingY._15 }}
        >
          {emptyListMessage}
        </Typo>
      )}

      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}
    </View>
  )
}

const TransactionItem = ({
  item,
  index,
  handleClick
}: TransactionItemProps) => {
  let category =
    item?.type === 'income'
      ? incomeCategory
      : expenseCategories[item.category!] || {
          icon: Icons.MoneyWavy,
          label: 'Expense',
          bgColor: '#be185d'
        }
  console.log(item)
  const IconComponent = category.icon

  const formatFirestoreDate = (date: any) => {
    if (!date) return 'Invalid Date'

    if (date instanceof Date) {
      // ✅ Already a JavaScript Date
      return date.toLocaleDateString()
    }

    if (date.seconds) {
      // ✅ Convert Firestore Timestamp
      return new Date(date.seconds * 1000).toLocaleDateString()
    }

    return 'Invalid Date'
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity style={styles.row} onPress={() => handleClick(item)}>
        <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
          {category.icon ? (
            <category.icon
              size={verticalScale(25)}
              weight='fill'
              color={colors.white}
            />
          ) : (
            <Typo size={16} color={colors.white}>
              ?
            </Typo>
          )}
        </View>

        <View style={styles.categoryDes}>
          <Typo size={17}>{category.label}</Typo>
          <Typo
            size={12}
            color={colors.neutral400}
            textProps={{ numberOfLines: 1 }}
          >
            {item.description || 'No description'}
          </Typo>
        </View>

        <View style={styles.amountDate}>
          <Typo fontWeight='500' color={colors.rose}>
            {item.type === 'income' ? `+ $${item.amount}` : `- $${item.amount}`}
          </Typo>
          <Typo size={13} color={colors.neutral400}>
            {formatFirestoreDate(item.date)}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default TransactionList

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17
  },
  list: {
    minHeight: 3
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._12,
    backgroundColor: colors.neutral800,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius._12,
    borderCurve: 'continuous'
  },
  categoryDes: {
    flex: 1,
    gap: 2.5
  },
  amountDate: {
    alignItems: 'flex-end',
    gap: 3
  }
})
