export const formatWallet = (publicKey: string) => {
  if (!publicKey.toString()) return;
  return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
}