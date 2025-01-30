import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { placeholder } from '../node_modules/@babel/types/lib/index-legacy.d'
import { ImageUploadProps } from '@/types'

const ImageUpload = ({
  file = null,
  onSelect,
  onClear,
  containerStyle,
  imageStyle,
  placeholder
}: ImageUploadProps) => {
  return <View>{!file && (
    <Tou
  )}</View>
}

export default ImageUpload

const styles = StyleSheet.create({})
