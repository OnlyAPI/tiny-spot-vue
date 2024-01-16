import Layout from '@/layout'

const blogRouter = {
  path: '/blog',
  component: Layout,
  redirect: 'noRedirect',
  alwaysShow: true, // will always show the root menu
  name: 'Blog',
  meta: {
    title: '博客管理',
    icon: 'post',
    roles: ['sys:blog:manage'] // you can set roles in root nav
  },
  children: [
    {
      path: 'article',
      component: () => import('@/views/blog/article/index.vue'),
      name: 'Article',
      meta: {
        title: '文章管理',
        icon: 'el-icon-document',
        roles: ['sys:article:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'tag',
      component: () => import('@/views/blog/tag/index.vue'),
      name: 'Tag',
      meta: {
        title: '标签管理',
        icon: 'tag',
        roles: ['sys:articleTag:manage'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'classify',
      component: () => import('@/views/blog/classify/index.vue'),
      name: 'Classify',
      meta: {
        title: '分类管理',
        icon: 'el-icon-s-data',
        roles: ['sys:articleClassify:manage'] // or you can only set roles in sub nav
      }
    }
  ]
}

export default blogRouter
