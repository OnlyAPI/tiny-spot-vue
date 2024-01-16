import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import toolRouter from '@/router/modules/tool'
import blogRouter from '@/router/modules/blog'
import systemRouter from '@/router/modules/system'
import logRouter from '@/router/modules/log'
import chatRouter from '@/router/modules/chat'

// 公开访问路由
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login'),
    hidden: true
  },
  {
    path: '/oAuth2/login/gitee',
    component: () => import('@/views/login/oauth2'),
    hidden: true
  },
  {
    path: '/oAuth2/login/github',
    component: () => import('@/views/login/oauth2'),
    hidden: true
  },
  {
    path: '/oAuth2/login/qq',
    component: () => import('@/views/login/oauth2'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },

  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [{
      path: 'index',
      name: 'Index',
      component: () => import('@/views/index/index'),
      meta: { title: '首页', icon: 'dashboard', affix: true }
    }]
  },

  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noRedirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/user/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

// 异步挂载的路由
// 动态需要根据权限加载的路由表
export const asyncRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user', roles: ['sys:user:auth', 'sys:role:auth'] }
      }
    ]
  },
  {
    path: '/blog/edit',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'article/:articleId(\\d+)',
        component: () => import('@/views/blog/article/edit.vue'),
        name: 'ArticleEdit',
        meta: { title: '编辑文章', activeMenu: '/blog/article', roles: ['sys:blog:update', 'sys:blog:add'] }
      }
    ]
  },
  {
    path: '/blog/read',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'article/:articleId(\\d+)',
        component: () => import('@/views/blog/article/read.vue'),
        name: 'ArticleRead',
        meta: { title: '预览文章', activeMenu: '/blog/article', roles: ['sys:blog:list'] }
      }
    ]
  },
  chatRouter,
  systemRouter,
  blogRouter,
  toolRouter,
  logRouter,
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
