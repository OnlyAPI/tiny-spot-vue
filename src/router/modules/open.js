import Layout from '@/layout/index.vue'

const openRouter = {

  path: '/open',
  component: Layout,
  redirect: 'noRedirect',
  alwaysShow: true, // will always show the root menu
  name: 'Open',
  meta: {
    title: '探索发现',
    icon: 'el-icon-magic-stick',
    roles: ['sys:open:tool']
  },
  children: [
    {
      path: 'chatroom',
      component: () => import('@/views/open/chatroom/index'),
      name: 'Chatroom',
      meta: {
        title: '简聊',
        icon: 'el-icon-chat-dot-square',
        roles: ['sys:open:chat']
      }
    },
    {
      path: 'takeaway',
      component: () => import('@/views/open/takeaway/index'),
      name: 'OpenTakeaway',
      meta: {
        title: '外卖好评',
        icon: 'el-icon-food',
        roles: ['sys:open:takeaway']
      }
    }
  ]
}

export default openRouter
