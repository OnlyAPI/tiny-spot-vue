import Layout from '@/layout'

const aiRouter = {
  path: '/ai',
  component: Layout,
  redirect: '/chat',
  children: [{
    path: 'chat',
    name: 'Chat',
    component: () => import('@/views/chat/chat.vue'),
    meta: {
      title: 'AI 聊天',
      icon: 'el-icon-s-comment',
      affix: true,
      roles: ['sys:ai:chat']
    }
  }]
}

export default aiRouter
