import layout from '@/layout/index.vue'

const logRouter = {
  path: '/monitor',
  component: layout,
  redirect: 'noRedirect',
  alwaysShow: true, // will always show the root menu
  name: 'Monitor',
  meta: {
    title: '日志管理',
    icon: 'log',
    roles: ['sys:log:manage'] // you can set roles in root nav
  },
  children: [
    {
      path: 'login-Log',
      component: () => import('@/views/monitor/login-log'),
      name: 'LoginLog',
      meta: {
        title: '登录日志',
        icon: 'logininfor',
        roles: ['sys:loginlog:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'oper-Log',
      component: () => import('@/views/monitor/oper-log'),
      name: 'OperLog',
      meta: {
        title: '操作日志',
        icon: 'form',
        roles: ['sys:operlog:manage'] // or you can only set roles in sub nav
      }
    }
  ]
}
export default logRouter
