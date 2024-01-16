import Layout from '@/layout/index.vue'

const toolRouter = {
  path: '/tool',
  component: Layout,
  redirect: 'noRedirect',
  alwaysShow: true, // will always show the root menu
  name: 'Tool',
  meta: {
    title: '功能管理',
    icon: 'tool',
    roles: ['sys:tool:manage'] // you can set roles in root nav
  },
  children: [
    {
      path: 'upload',
      component: () => import('@/views/tool/upload/index'),
      name: 'Upload',
      meta: {
        title: '上传管理',
        icon: 'el-icon-upload',
        roles: ['sys:upRecord:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'music',
      component: () => import('@/views/tool/music/index'),
      name: 'MusicSet',
      meta: {
        title: '音乐管理',
        icon: 'el-icon-service',
        roles: ['sys:music:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'takeaway',
      component: () => import('@/views/tool/takeaway/index'),
      name: 'TakeawaySet',
      meta: {
        title: '好评管理',
        icon: 'el-icon-food',
        roles: ['sys:takeaway:manage'] // or you can only set roles in sub nav
      }
    }
  ]
}

export default toolRouter
