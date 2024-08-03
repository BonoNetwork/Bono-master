// main.ts
import './style.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import 'solana-wallets-vue/styles.css';
import SolanaWallets from 'solana-wallets-vue';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
  ],
  autoConnect: true,
};

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(SolanaWallets, walletOptions);

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info);
  // You could also send this error to an error tracking service
};

app.mount('#app');
