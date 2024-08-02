<template>
  <div
    class="fixed left-0 top-0 bg-[#000000CC] w-[100dvw] h-[100dvh] duration-500 flex justify-center cursor-pointer"
    :class="{ 'z-10 opacity-100': isModalOpened, '-z-[1] opacity-0': !isModalOpened }"
    @click="$emit('close')"
  >
    <div
      v-if="contributors.length > 0"
      class="w-[90%] lg:w-[470px] mt-20 p-5 max-h-[400px] overflow-y-auto bg-[#181B208C] backdrop-blur-[20px] border border-[#FFFFFF1A] flex flex-col gap-2.5 duration-500 cursor-auto"
      :class="{ 'scale-100 opacity-100': isModalOpened, 'scale-50 opacity-50': !isModalOpened }"
      @click.stop
    >
      <div class="text-white">{{ heading }}</div>
      <div
        v-for="item in contributors"
        :key="item.wallet"
        class="flex flex-row gap-5 text-[#FFFFFF4D]"
      >
        <div class="flex-shrink-0">{{ formatWallet(item.wallet) }}</div>
        <div class="text-white flex-shrink-0">{{ formatCurrency(item.amount, 'SOL') }}</div>
        <div v-if="item.name">{{ item.name }}</div>
        <div
          v-if="item.comment"
          class="ml-auto text-wrap break-all"
        >{{ item.comment }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatWallet } from '@/composables/formatWallet';
import { formatCurrency } from '@/composables/currencyFormatter';

interface Contributor {
  wallet: string;
  amount: number;
  name?: string;
  comment?: string;
}

interface Props {
  isModalOpened: boolean;
  contributors: Contributor[];
  heading: string;
}

const props = withDefaults(defineProps<Props>(), {
  heading: 'Recent Contributions'
});

defineEmits<{
  (e: 'close'): void
}>();
</script>