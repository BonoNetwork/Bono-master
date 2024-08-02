<template>
  <div class="w-[100dvw] min-h-[100dvh] bg-black lg:pt-[calc((100dvh_-_675px)/2)]">
    <main class="relative bg-white lg:rounded-2xl font-['Space_Mono'] flex flex-col lg:flex-row items-center w-full lg:max-w-[1200px] min-h-[100dvh] lg:min-h-fit lg:h-[675px] p-5 lg:p-0 lg:m-auto">
      <img
        v-if="mock.image"
        :src="'/' + mock.image"
        class="lg:absolute w-[100px] lg:w-[200px] lg:-top-[150px] lg:left-[calc((100%_-_200px)_/_2)]"
      />
      <div class="lg:rounded-2xl h-auto m-auto lg:py-[120px] lg:px-[140px] w-full flex flex-col gap-[50px] items-center">
        <div class="font-bold text-base lg:text-[40px] leading-5 lg:leading-none text-center" v-html="errorTitle"></div>
        <div class="text-xs leading-5 text-[#656565] text-center lg:mt-2 lg:text-[30px] lg:leading-[50px]" v-html="errorDescription"></div>
        <RouterLink
          class="w-full p-[10px] bg-black rounded-[5px] text-white text-sm leading-5 text-center lg:mx-[25px] lg:w-[350px] cursor-pointer no-underline"
          :to="{name: 'home'}"
        >
          Return to Home
        </RouterLink>
        <button
          @click="reportError"
          class="w-full p-[10px] bg-gray-300 rounded-[5px] text-black text-sm leading-5 text-center lg:mx-[25px] lg:w-[350px] cursor-pointer"
        >
          Report this error
        </button>
      </div>


      <div class="hidden lg:absolute lg:bottom-[-60px] lg:right-0 lg:flex lg:flex-row lg:gap-[10px]">
        
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { mock } from '@/utils/mocks/error';
import { showToast } from '@/composables/toast';

const route = useRoute();

const errorTitle = computed(() => {
  switch (route.query.type) {
    case 'not-found':
      return 'Page Not Found';
    case 'unauthorized':
      return 'Unauthorized Access';
    default:
      return mock.title;
  }
});

const errorDescription = computed(() => {
  switch (route.query.type) {
    case 'not-found':
      return 'The page you are looking for does not exist. It might have been moved or deleted.';
    case 'unauthorized':
      return 'You do not have permission to access this page. Please log in or contact support if you believe this is an error.';
    default:
      return mock.description;
  }
});

const reportError = () => {
  // Implement error reporting logic here
  showToast('Error reported. Our team will look into it.', 'success');
};
</script>