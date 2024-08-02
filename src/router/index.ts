import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import CampaignDetails from '@/views/CampaignDetails.vue'
import CreateCampaign from '@/views/CreateCampaign.vue'
import MyCampaigns from '@/views/MyCampaigns.vue'
import HighTableDashboard from '@/views/HighTableDashboard.vue'
import Error from '@/views/Error.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/campaign/:id',
      name: 'campaignDetails',
      component: CampaignDetails
    },
    {
      path: '/create',
      name: 'createCampaign',
      component: CreateCampaign
    },
    {
      path: '/my-campaigns',
      name: 'myCampaigns',
      component: MyCampaigns
    },
    {
      path: '/high-table',
      name: 'highTableDashboard',
      component: HighTableDashboard
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'error',
      component: Error
    }
  ]
})

export default router