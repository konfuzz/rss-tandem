import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '../stores/auth';
import DashboardView from '../views/DashboardView.vue';
import HomeView from '../views/HomepageView.vue';
import LoginView from '../views/LoginView.vue';
import NotFoundView from '../views/NotFound.vue';
import QuizView from '../views/QuizView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
  {
    component: HomeView,
    name: 'home',
    path: '/',
  },
  {
    component: QuizView,
    meta: { requiresAuth: true },
    name: 'quiz',
    path: '/quiz',
  },
  {
    component: DashboardView,
    meta: { requiresAuth: true },
    name: 'dashboard',
    path: '/dashboard',
  },
  {
    component: LoginView,
    name: 'login',
    path: '/login',
  },
  {
    component: RegisterView,
    name: 'register',
    path: '/register',
  },
  {
    component: NotFoundView,
    name: 'NotFound',
    path: '/:pathMatch(.*)*',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
