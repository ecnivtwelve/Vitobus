import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/horaires'
  },
  {
    path: '/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/horaires'
      },
      {
        path: 'horaires',
        component: () => import('@/views/HorairesPage.vue')
      },
      {
        path: 'infos',
        component: () => import('@/views/InfoPage.vue')
      },
      {
        path: 'about',
        component: () => import('@/views/AboutPage.vue')
      },
    ]
  },
  {
    path: '/line/:line',
    props: true,
    component: () => import('@/views/LineView.vue')
  },
  {
    path: '/stop/:line/:stop',
    props: true,
    component: () => import('@/views/StopView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
