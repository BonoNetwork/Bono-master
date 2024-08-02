import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
// import CampaignDetails from '@/views/CampaignDetails.vue'
// import CreateCampaign from '@/views/CreateCampaign.vue'
// import MyCampaigns from '@/views/MyCampaigns.vue'
// import HighTableDashboard from '@/views/HighTableDashboard.vue'
import Error from '@/views/Error.vue'
import Create from '@/views/Create.vue'
import Private from '@/views/Private.vue'
import Public from '@/views/Public.vue'
import Index from '@/views/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/index',
      name: 'index',
      component: Index
    },
    {
      path: '/create',
      name: 'create',
      component: Create
    },
    {
      path: '/private/:id',
      name: 'private',
      component: Private
    },
    {
      path: '/public/:id',
      name: 'public',
      component: Public
    },
    //implement these views later
    // {
    //   path: '/campaign/:id',
    //   name: 'campaignDetails',
    //   component: CampaignDetails
    // },
    // {
    //   path: '/create',
    //   name: 'createCampaign',
    //   component: CreateCampaign
    // },
    // {
    //   path: '/my-campaigns',
    //   name: 'myCampaigns',
    //   component: MyCampaigns
    // },
    // {
    //   path: '/high-table',
    //   name: 'highTableDashboard',
    //   component: HighTableDashboard
    // },
    {
      path: '/:pathMatch(.*)*',
      name: 'error',
      component: Error
    }
  ]
})
export default router