<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>

        <el-form v-show="showSearch" ref="queryParams" :model="queryParams" size="small" :inline="true">
          <el-form-item label="关键字" prop="username">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入歌名/歌手/专辑"
              clearable
              style="width: 200px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetForm()">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-if="checkPermission(['sys:music:add'])" type="primary" plain icon="el-icon-plus" size="mini"
                       @click="handleAdd"
            >新增
            </el-button>
          </el-col>
          <right-toolbar :show-search.sync="showSearch" @queryTable="getList"/>
        </el-row>

        <el-table :data="tableData" style="width: 100%" :default-sort="defaultSort" @sort-change="handleSortChange">
          <el-table-column prop="id" label="歌曲ID" align="center"/>
          <el-table-column prop="artist" label="歌手" align="center"/>
          <el-table-column prop="title" label="歌曲名" align="center"/>
          <el-table-column prop="album" label="专辑" align="center"/>
          <el-table-column label="专辑图片" align="center">
            <template slot-scope="scope">
              <el-image
                style="width: 40px; height: 40px"
                :src="scope.row.pic"
                fit="scale-down"
                :preview-src-list="buildPreview(scope.row)"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" sortable="custom" :sort-orders="['descending', 'ascending']" align="center"/>
          <el-table-column label="上传时间" align="center" width="170" prop="createTime">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="170"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-headset"
                @click="handleListen(scope.row)"
              >试听
              </el-button>
              <el-button
                v-if="checkPermission(['sys:music:update'])"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="checkPermission(['sys:music:delete'])"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除
              </el-button>
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
      </el-col>
    </el-row>

    <!--试听窗口-->
    <el-dialog
      :title="listenTitle"
      :visible.sync="isPlayer"
      width="30%"
      @closed="closeListen"
      center>
      <div id="aplayers"></div>
    </el-dialog>

<!--     添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="歌曲名" prop="title">
          <el-input v-model="form.title" placeholder="请输入歌曲名" />
        </el-form-item>
        <el-form-item label="歌手" prop="artist">
          <el-input v-model="form.artist" placeholder="请输入歌手" />
        </el-form-item>
        <el-form-item label="专辑" prop="album">
          <el-input v-model="form.album" placeholder="请输入专辑" />
        </el-form-item>

        <el-form-item label="专辑图片" prop="pic">
          <el-upload
            :action="uploadFileUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeUpload">
            <img v-if="form.pic" :src="form.pic" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="文件地址" prop="src">
          <el-upload
            :disabled="fileUploading"
            :action="uploadFileUrl"
            :show-file-list="false"
            :on-success="handleMusicSuccess"
            :before-upload="beforeUpload">
            <el-button size="small" type="primary">{{ fineUploadingText }}</el-button>
          </el-upload>
          <el-input v-model="form.src" prefix-icon="el-icon-headset"/>
        </el-form-item>

        <el-form-item label="歌曲顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { Message } from 'element-ui'
import checkPermission from '@/utils/permission'
import { pageList, add, update, delMusic, getById } from '@/api/tool/music/index'
import APlayer from 'aplayer' // 引入音乐插件
import '@/styles/APlayer.min.css' // 引入音乐插件的样式

export default {
  name: 'MusicSet',
  data() {
    return {
      fineUploadingText: '点击上传',
      fileUploading: false,
      // 默认排序
      defaultSort: { prop: 'sort', order: 'descending' },
      // process.env.VUE_APP_BASE_API 这是配置的开发/生产环境的接口前缀
      uploadFileUrl: process.env.VUE_APP_BASE_API + '/file/upload',
      //  试听窗口是否打开
      isPlayer: false,
      // 试听标题
      listenTitle: '',
      // 音乐信息
      ap: undefined,
      audios: {
        name: undefined,
        artist: undefined,
        url: undefined,
        cover: undefined
      },
      // 播放器配置
      info: {
        // 不开启吸底模式
        fixed: false,
        // 折叠歌曲列表
        listFolded: true,
        // 开启自动播放
        autoplay: false,
        // 自动预加载歌曲
        preload: 'auto',
        // 播放循环模式、all全部循环 one单曲循环 none只播放一次
        loop: 'none',
        //  播放模式，list列表播放, random随机播放
        order: 'list',
        // 主题
        theme: '#FADFA3'
      },
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 表格数据
      tableData: null,
      // 总条数
      total: 0,

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        sortOrder: 'descending'
      },
      // 显示搜索条件
      showSearch: true,

      // 新增/修改-弹出层标题
      title: '',
      // 新增/修改-是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: '歌曲名不能为空', trigger: 'blur' }
        ],
        artist: [
          { required: true, message: '歌手不能为空', trigger: 'blur' }
        ],
        album: [
          { required: true, message: '专辑不能为空', trigger: 'blur' }
        ],
        src: [
          { required: true, message: '文件地址不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    /** 查询角色列表 */
    getList() {
      this.loading = true
      pageList(this.queryParams).then(response => {
        this.tableData = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetForm() {
      this.queryParams.keyword = ''
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const musicId = row.id
      this.$confirm('确认要删除' + '"歌曲-' + row.title + '"吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delMusic(musicId)
      }).then(() => {
        this.getList()
        Message({message: '删除成功', type: 'success'})
      }).catch(function () {
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加歌曲'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const musicId = row.id
      getById(musicId).then(response => {
        this.form = response.data
        this.open = true
      })
      this.title = '修改歌曲'
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        title: undefined,
        artist: undefined,
        album: undefined,
        src: undefined,
        pic: undefined,
        sort: 0
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            update(this.form, this.form.id).then(response => {
              Message({ message: '修改成功', type: 'success' })
              this.open = false
              this.getList()
            })
          } else {
            add(this.form).then(response => {
              Message({ message: '新增成功', type: 'success' })
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 生成预览图
    buildPreview(row) {
      let array = new Array()
      array.push(row.pic)
      return array
    },
    // 试听打开
    handleListen(row) {
      this.listenTitle = '正在播放：' + row.title + '-' + row.artist
      this.isPlayer = true
      this.audios.url = row.src
      this.audios.name = row.title
      this.audios.artist = row.artist
      this.audios.cover = row.pic
      this.ap = new APlayer({
        container: document.getElementById('aplayers'),
        audio: this.audios,
        ...this.info // 其他配置信息
      })
      this.ap.play()
    },
    // 试听关闭
    closeListen() {
      this.ap.pause()
      this.isPlayer = false
      this.listenTitle = ''
      this.audios.cover = undefined
      this.audios.name = undefined
      this.audios.artist = undefined
      this.audios.url = undefined
    },
    // 上传图片成功
    handleAvatarSuccess(res) {
      this.form.pic = res.data
      Message({ message: '上传成功', type: 'success' })
    },
    // 上传图片成功
    handleMusicSuccess(res) {
      this.form.src = res.data
      Message({ message: '上传成功', type: 'success' })
      this.fileUploading = false
      this.fineUploadingText = '点击上传'
    },
    // 上传前置
    beforeUpload() {
      Message({ message: '正在上传文件...', type: 'info' })
      this.fileUploading = true
      this.fineUploadingText = '正在上传'
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.sortOrder = column.order
      this.getList()
    }

    // initPlayer() {
    //   this.ap = new APlayer({
    //     container: document.getElementById('aplayers'),
    //     audio: this.audios,
    //     ...this.info // 其他配置信息
    //   })
    // }
  }
}
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
