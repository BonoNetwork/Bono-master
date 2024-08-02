import { ref, computed } from 'vue';
import { useWallet } from 'solana-wallets-vue';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export function useBonoWallet() {
  const { connected, publicKey, signTransaction, sendTransaction, connect } = useWallet();
  const balance = ref(0);

  const shortenedAddress = computed(() => {
    if (publicKey.value) {
      const addr = publicKey.value.toBase58();
      return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    }
    return '';
  });

  const fetchBalance = async () => {
    if (connected.value && publicKey.value) {
      const connection = new Connection(process.env.VUE_APP_SOLANA_RPC_URL as string);
      balance.value = await connection.getBalance(publicKey.value);
    }
  };

  const signAndSendTransaction = async (transaction: Transaction) => {
    if (!connected.value) throw new Error('Wallet not connected');
    if (!signTransaction.value) throw new Error('Wallet does not support signing');
    
    const signed = await signTransaction.value(transaction);
    const connection = new Connection(process.env.VUE_APP_SOLANA_RPC_URL as string);
    const signature = await sendTransaction(signed, connection);
    
    await connection.confirmTransaction(signature as string, 'confirmed');
    return signature as string;
  };
  

  return {
    connected,
    publicKey,
    balance,
    shortenedAddress,
    fetchBalance,
    signAndSendTransaction,
    connect,
    sendTransaction
  };
}