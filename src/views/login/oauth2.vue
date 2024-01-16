<template>
  <h1></h1>
</template>

<script>
import { Message } from 'element-ui'
import { authLogin } from '@/api/login/oauth2'

export default {
  name: 'OAuth2',
  data() {
    return {
      codeUrl: '',
      loading: false
    }
  },
  created() {
    if (this.$route.path == '/oAuth2/login/gitee') {
      this.handlerLogin('gitee')
    } else if (this.$route.path == '/oAuth2/login/github') {
      this.handlerLogin('github')
    } else if (this.$route.path == '/oAuth2/login/qq') {
      this.handlerLogin('qq')
    }
  },
  methods: {
    handlerLogin(authType) {
      const code = this.$route.query.code
      const state = this.$route.query.state
      const errorMsg = this.$route.query.error_description
      if (code === undefined) {
        Message({ message: errorMsg, type: 'error' })
        this.$router.push({ path: '/login' })
      } else {
        authLogin(code, authType, state).then(response => {
          const token = response.data
          this.$store.dispatch('user/ReSetToken', token).then(() => {
            Message({ message: '登录成功', type: 'success' })
            this.$router.push({ path: '/' })
          }).catch(() => {})
        })
      }
    }
  }
}
</script>
