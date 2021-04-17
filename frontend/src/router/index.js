import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MainView from '../views/MainView.vue';
import LoginView from '../views/LoginView.vue';
import EditorView from '../views/EditorView.vue';
import ProfileView from '../views/ProfileView.vue';
import NotFoundView from '../views/404.vue';
import store from '../store/index';

Vue.use(VueRouter);

function isAuthed() {
  return store.getters.isAuthenticated;
}

const routes = [
  {
    path: '/',
    name: 'Root',
    component: {
      render: (c) => c(isAuthed() ? HomeView : MainView),
    },
  },
  {
    path: '/editor',
    name: 'Editor',
    component: EditorView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/signin',
    alias: '/signup',
    name: 'Login',
    component: LoginView,
    props: true,
    meta: {
      requiresDisAuth: true,
    },
  },
  { path: '/login', redirect: '/signin' },
  { path: '/register', redirect: '/signup' },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: ProfileView,
  },
  {
    path: '/404',
    component: NotFoundView,
  },
  {
    path: '*',
    redirect: '/404'
    ,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (isAuthed() && to.matched.some((record) => record.meta.requiresDisAuth)) {
    next(from);
  } else if (!isAuthed() && to.matched.some((record) => record.meta.requiresAuth)) {
    next('/signin');
  } else {
    next();
  }
});

export default router;
