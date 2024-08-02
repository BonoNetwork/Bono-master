<script setup lang="ts">
import { WalletModalProvider } from "solana-wallets-vue";
import { provide, ref } from "vue";
import { RouterView } from 'vue-router';
import Navigation from '@/components/Navigation.vue';

let walletModalProviderRef = ref();

provide('walletModalProviderRef', walletModalProviderRef);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />
    <main class="flex-grow">
      <RouterView />
    </main>
    <WalletModalProvider dark ref="walletModalProviderRef"></WalletModalProvider>
  </div>
</template>