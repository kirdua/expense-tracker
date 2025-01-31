import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Typo from './Typo'
import { WalletType } from '@/types'
import { Router } from 'expo-router'
import { verticalScale } from '@/utils/styling'
import { colors, radius, spacingX } from '@/constants/theme'
import { Image } from 'expo-image'

const WalletItem = ({
  item,
  index,
  router
}: {
  item: WalletType
  index: number
  router: Router
}) => {
  return (
    <View>
      {item.name}
      <TouchableOpacity style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            style={{ flex: 1 }}
            source={item?.image}
            contentFit='cover'
            transition={100}
          />
        </View>
        <View style={styles.nameContainer}>
          <Typo>{item?.name}</Typo>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default WalletItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(17)
  },
  imageContainer: {
    height: verticalScale(45),
    width: verticalScale(45),
    borderWidth: 1,
    borderColor: colors.neutral600,
    borderRadius: radius._12,
    borderCurve: 'continuous',
    overflow: 'hidden'
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginLeft: spacingX._10
  }
})
