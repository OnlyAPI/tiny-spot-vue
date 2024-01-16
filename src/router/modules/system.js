import Layout from '@/layout/index.vue'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: 'noRedirect',
  alwaysShow: true, // will always show the root menu
  name: 'System',
  meta: {
    title: '系统管理',
    icon: 'system',
    roles: ['sys:sys:manage'] // you can set roles in root nav
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user/index'),
      name: 'User',
      meta: {
        title: '用户管理',
        icon: 'user',
        roles: ['sys:user:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'role',
      component: () => import('@/views/system/role/index'),
      name: 'Role',
      meta: {
        title: '角色管理',
        icon: 'peoples',
        roles: ['sys:role:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'menu',
      component: () => import('@/views/system/menu/index'),
      name: 'Menu',
      meta: {
        title: '菜单管理',
        icon: 'tree-table',
        roles: ['sys:menu:manage'] // or you can only set roles in sub nav
      }
    }
  ]
}
export default systemRouter
