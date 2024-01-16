<template>
  <div class="app-container">
    <h1>{{ form.title }}</h1>
    <span style="font-size: 15px">{{ form.subTitle }}</span>
    <el-divider></el-divider>
<!--    <mavon-editor toolbarsBackground="#b4daa2" codeStyle="a11y-dark" :editable="false" :toolbars="this.toolbars" v-model="form.content"/>-->
    <v-md-preview :text="form.content"></v-md-preview>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-120px;margin-top:30px;">
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { getById } from '@/api/blog/article/index'
import router from '@/router'

export default {
  name: 'ArticleRead',
  data() {
    return {
      form: {},
      articleId: undefined,
      toolbars: {
        readmodel: true, // 沉浸式阅读
        navigation: true, // 导航目录
        subfield: true, // 单双栏模式
        preview: true, // 预览
        fullscreen: true // 全屏编辑
      }
    }
  },
  created() {
    this.articleId = this.$route.params && this.$route.params.articleId
    getById(this.articleId).then(response => {
      this.form = response.data
    })
  },
  methods: {
    /** 关闭按钮 */
    close() {
      this.reset()
      router.push('/blog/article')
    },
    reset() {
      this.articleId = undefined
      this.form = {}
    }
  }
}
</script>

<style scoped>

</style>
