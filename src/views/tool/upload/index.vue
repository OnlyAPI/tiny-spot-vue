<template>
  <div class="app-container">
    <el-row>
      <el-col :span="9">
        <el-upload
          drag
          :action="uploadFileUrl"
          :on-success="handleQuery"
          :on-error="uploadFileError"
          :on-exceed="uploadFileFull"
          :limit="10"
          multiple
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将要上传的文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-col>
      <el-col :span="9">
        <el-upload
          drag
          :action="uploadFileUrl"
          :show-file-list="false"
          :on-success="fileUpdateUploadSuccess"
          :on-error="uploadFileError"
          :on-exceed="fileUpdateFileFull"
          :before-upload="fileUpdateBefore"
          :limit="1"
          multiple>
          <i class="el-icon-upload" />
          <div class="el-upload__text">将要裁剪的图片拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <el-dialog :title="fileUpdateTitle" :visible.sync="fileUpdateOpen" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
          <el-row>
            <el-col :xs="24" :md="12" :style="{height: '350px'}">
              <vue-cropper
                v-if="visible"
                ref="cropper"
                :img="options.img"
                :info="true"
                :auto-crop="options.autoCrop"
                :auto-crop-width="options.autoCropWidth"
                :auto-crop-height="options.autoCropHeight"
                :fixed-box="options.fixedBox"
                :output-type="options.outputType"
                @realTime="realTime"
              />
            </el-col>
            <el-col :xs="24" :md="12" :style="{height: '350px'}">
              <div class="avatar-upload-preview">
                <img :src="previews.url" :style="previews.img">
              </div>
            </el-col>
          </el-row>
          <br>
          <el-row>
            <el-col :lg="{span: 1, offset: 2}" :sm="2" :xs="2">
              <el-button icon="el-icon-plus" size="small" @click="changeScale(1)" />
            </el-col>
            <el-col :lg="{span: 1, offset: 1}" :sm="2" :xs="2">
              <el-button icon="el-icon-minus" size="small" @click="changeScale(-1)" />
            </el-col>
            <el-col :lg="{span: 1, offset: 1}" :sm="2" :xs="2">
              <el-button icon="el-icon-refresh-left" size="small" @click="rotateLeft()" />
            </el-col>
            <el-col :lg="{span: 1, offset: 1}" :sm="2" :xs="2">
              <el-button icon="el-icon-refresh-right" size="small" @click="rotateRight()" />
            </el-col>
            <el-col :lg="{span: 2, offset: 6}" :sm="2" :xs="2">
              <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
            </el-col>
          </el-row>
        </el-dialog>
      </el-col>
    </el-row>

    <el-form v-show="showSearch" ref="queryForm" style="margin-top: 10px;" :model="queryParams" size="small" :inline="true" label-position="left" label-width="80px">
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="源文件名/url/摘要Hash"
          clearable
          style="width: 200px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 200px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button plain icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <right-toolbar style="margin: 5px 1px" :show-search.sync="showSearch" @queryTable="getList" />

    <el-table ref="tables" v-loading="loading" :data="list" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="ID" align="center" width="70" prop="id" />
      <el-table-column label="源文件名" align="center" prop="fileName" :show-overflow-tooltip="true" />
      <el-table-column label="文件类型" align="center" prop="fileType" />
      <el-table-column label="文件大小" align="center" prop="fileSize" />
      <el-table-column label="预览" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 40px; height: 40px"
            :src="buildSrc(scope.row)"
            fit="scale-down"
            :preview-src-list="buildPreview(scope.row)"
          >
            <div slot="error" class="image-slot">
              <el-button icon="el-icon-question" title="其他格式" circle />
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="url" align="center" prop="fileUrl" :show-overflow-tooltip="true" />
      <el-table-column label="摘要Hash" align="center" prop="excerptHash" :show-overflow-tooltip="true" />
      <el-table-column label="上传人ID" align="center" prop="uploadUserId" />
      <el-table-column label="创建日期" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            title="复制url"
            type="primary"
            circle
            icon="el-icon-document-copy"
            @click="copyUrl(scope.row)"
          />
          <el-button
            v-if="checkPermission(['sys:upRecord:delete'])"
            title="删除"
            type="danger"
            circle
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { list, deleteById } from '@/api/tool/upload'
import { VueCropper } from 'vue-cropper'
import { Message } from 'element-ui'
import checkPermission from '@/utils/permission'
import { debounce } from '@/utils'
import { fileUpload } from '@/api/upload'

export default {
  components: { VueCropper },
  name: 'Upload',
  data() {
    return {
      fileOriName: '',
      // 是否显示弹出层
      fileUpdateOpen: false,
      // 是否显示cropper
      visible: false,
      // 弹出层标题
      fileUpdateTitle: '裁剪图片',
      options: {
        img: '', // 裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true, // 固定截图框大小 不允许改变
        outputType: 'png' // 默认生成截图为PNG格式
      },
      previews: {},
      resizeHandler: null,

      // 文件上传地址
      uploadFileUrl: process.env.VUE_APP_BASE_API + '/file/upload',
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'createTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        sortOrder: 'descending',
        beginTime: '',
        endTime: ''
      },
      // 新增/修改-是否显示弹出层
      open: false,
      previewSrc: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      if (this.dateRange.length > 0) {
        this.queryParams.beginTime = this.dateRange[0]
        this.queryParams.endTime = this.dateRange[1]
      }
      list(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    uploadFileError() {
      Message({ message: '上传失败', type: 'error' })
    },
    uploadFileFull() {
      Message({ message: '最多选择10个文件', type: 'error' })
    },
    fileUpdateFileFull() {
      Message({ message: '最多选择1个文件', type: 'error' })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.queryParams.sortOrder = 'descending'
      this.queryParams.keyword = ''
      this.queryParams.beginTime = ''
      this.queryParams.endTime = ''
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
      this.getList()
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.sortOrder = column.order
      this.getList()
    },
    // 删除
    handleDelete(row) {
      const id = row.id || this.ids
      this.$confirm('确认要删除ID为"' + id + '"的文件吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteById(id)
      }).then(() => {
        this.getList()
        Message({ message: '删除成功', type: 'success' })
      }).catch(function() {
      })
    },
    // 生成预览图
    buildPreview(row) {
      const array = new Array()
      if (row.fileType == 'png' || row.fileType == 'jpg' || row.fileType == 'jpeg' || row.fileType == 'gif') {
        array.push(row.fileUrl)
      }
      return array
    },
    // 生成src
    buildSrc(row) {
      let src = ''
      if (row.fileType == 'png' || row.fileType == 'jpg' || row.fileType == 'jpeg' || row.fileType == 'gif') {
        src = row.fileUrl
      }
      return src
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.previewSrc = ''
    },
    /** 复制内容*/
    copyUrl(row) {
      var input = document.createElement('input')
      input.value = row.fileUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      document.body.removeChild(input)
      Message({ message: '复制成功', type: 'success' })
    },

    // 编辑头像
    editCropper() {
      this.fileUpdateOpen = true
    },
    // 打开弹出层结束时的回调
    modalOpened() {
      this.visible = true
      if (!this.resizeHandler) {
        this.resizeHandler = debounce(() => {
          this.refresh()
        }, 100)
      }
      window.addEventListener('resize', this.resizeHandler)
    },
    // 刷新组件
    refresh() {
      this.$refs.cropper.refresh()
    },
    // 向左旋转
    rotateLeft() {
      this.$refs.cropper.rotateLeft()
    },
    // 向右旋转
    rotateRight() {
      this.$refs.cropper.rotateRight()
    },
    // 图片缩放
    changeScale(num) {
      num = num || 1
      this.$refs.cropper.changeScale(num)
    },
    // 图片裁剪上传预处理
    fileUpdateBefore(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
      }else {
        this.fileOriName = file.name
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.options.img = reader.result
        }
      }
    },
    fileUpdateUploadSuccess(response) {
      this.handleQuery()
      this.options.img = response.data
      this.fileUpdateOpen = true
    },
    // 上传图片
    uploadImg() {
      this.$refs.cropper.getCropBlob(data => {
        const formData = new FormData()
        formData.append('file', data, this.fileOriName)
        fileUpload(formData).then(response => {
          Message({ message: '裁剪成功', type: 'success' })
          this.fileUpdateOpen = false
          this.options.img = ''
          this.visible = false
          this.handleQuery()
        })
      })
    },
    // 实时预览
    realTime(data) {
      this.previews = data
    },
    // 关闭窗口
    closeDialog() {
      this.options.img = ''
      this.visible = false
      window.removeEventListener('resize', this.resizeHandler)
    }
  }
}
</script>
<style>

</style>
