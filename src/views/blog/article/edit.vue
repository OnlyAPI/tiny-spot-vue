<template>
  <div class="app-container">
    <el-form ref="articleform" :model="form" label-width="auto">
      <el-row>
        <el-col :span="12">
          <el-form-item label="标题" prop="title" :rules="[{ required: true, message: '标题不能为空'}]">
            <el-input v-model="form.title" placeholder="请输入文章标题"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="副标题" prop="subTitle" :rules="[{ required: true, message: '副标题不能为空'}]">
            <el-input type="textarea" v-model="form.subTitle" placeholder="请输入文章副标题"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文章状态:" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">存为草稿</el-radio>
              <el-radio :label="1">发布文章</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="置顶:" prop="isTop">
            <el-radio-group v-model="form.isTop">
              <el-radio :label="0">不置顶</el-radio>
              <el-radio :label="1">置顶</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="评论:" prop="allowComment">
            <el-radio-group v-model="form.allowComment">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="标签">
            <el-select v-model="form.tagIds" multiple filterable allow-create default-first-option placeholder="请选择标签">
              <el-option
                v-for="item in tagsOptions"
                :key="item.id"
                :label="item.title"
                :value="item.id"
                :disabled="item.status == 0"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="分类">
            <el-select v-model="form.classifyId" allow-create filterable default-first-option placeholder="请选择分类">
              <el-option
                v-for="item in classifyOptions"
                :key="item.classifyId"
                :label="item.title"
                :value="item.classifyId"
                :disabled="item.status == 0"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="点击量" prop="hits">
            <el-input-number :disabled="true" v-model="form.hits" controls-position="right" :min="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="form.sort" controls-position="right" :min="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="文章内容" prop="content">
            <mavon-editor toolbarsBackground="#b4daa2" ref=md @imgAdd="imgAdd" codeStyle="a11y-dark" v-model="form.content"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel('articleform')">取 消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { update, getById, add } from '@/api/blog/article/index'
import { getAll } from '@/api/blog/tag'
import { getAllClassify } from '@/api/blog/classify'
import checkPermission from '@/utils/permission'
import { Message } from 'element-ui'
import router from '@/router'

export default {
  name: 'ArticleEdit',
  data() {
    return {
      // 文件上传地址
      uploadFileUrl: process.env.VUE_APP_BASE_API + '/file/upload',
      // 标签选项
      tagsOptions: [],
      // 分类选项
      classifyOptions: [],
      // 标题
      title: '',
      form: {},
      articleId: 0
    }
  },
  created() {
    this.reset()
    this.articleId = this.$route.params && this.$route.params.articleId
    getAll().then(response => {
      this.tagsOptions = response.data
    })
    getAllClassify().then(response => {
      this.classifyOptions = response.data
    })
    if (this.articleId == 0) {
      this.title = '撰写文章'
    } else {
      this.title = '修改文章'
      getById(this.articleId).then(response => {
        this.form = response.data
      })
    }
  },
  methods: {
    checkPermission,
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        title: '',
        subTitle: undefined,
        content: '',
        hits: 0,
        tagIds: [],
        classifyId: undefined,
        allowComment: 0,
        sort: 0,
        isTop: 0,
        status: 0
      }
    },
    submitForm() {
      this.$refs['articleform'].validate(valid => {
        if (valid) {
          if (this.articleId == 0) {
            add(this.form).then(response => {
              Message({ message: '撰写成功', type: 'success' })
            })
          } else {
            update(this.form, this.form.id).then(response => {
              Message({ message: '修改成功', type: 'success' })
            })
          }
          router.push('/blog/article')
        }
      })
    },
    cancel(formName) {
      this.reset()
      this.title = ''
      this.$refs[formName].resetFields()
      router.push('/blog/article')
    },
    // 复制路径到剪切板
    // copyUrl() {
    //   var input = document.createElement('input')
    //   input.value = this.articlePicUrl
    //   document.body.appendChild(input)
    //   input.select()
    //   document.execCommand('Copy')
    //   document.body.removeChild(input)
    //   Message({ message: '复制成功', type: 'success' })
    // },
    // 绑定@imgAdd event
    imgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData();
      formdata.append('file', $file)
      axios({
        url: this.uploadFileUrl,
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((response) => {
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        /**
         * $vm 指为mavonEditor实例，可以通过如下两种方式获取
         * 1. 通过引入对象获取: `import {mavonEditor} from ...` 等方式引入后，`$vm`为`mavonEditor`
         * 2. 通过$refs获取: html声明ref : `<mavon-editor ref=md ></mavon-editor>，`$vm`为 `this.$refs.md`
         */
        this.$refs.md.$img2Url(pos, response.data.data)
      })
    }
  }
}
</script>
<style>
.inline-block {
  display: inline-block;
  margin-right: 10px;
}

.margin-change {
  display: inline-block;
  margin-left: 10px;
}
</style>

