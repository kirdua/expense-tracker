import { WalletType, ResponseType } from '@/types'
export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    let walletToSave = { ...walletData }
    if (walletData.image) {
    }
  } catch (error: any) {
    console.error('error with wallet: ', error)
    return { success: false, msg: error.message }
  }
}
