<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true">
          <el-form-item label="关键字" prop="title">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入文章标题/副标题"
              clearable
              style="width: 240px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="queryParams.tagId" clearable filterable default-first-option placeholder="请选择标签">
              <el-option
                v-for="item in tagsOptions"
                :key="item.id"
                :label="item.title + ' (' + item.articleNum + ')'"
                :value="item.id"
                :disabled="item.status == 0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="queryParams.classifyId" clearable filterable default-first-option placeholder="请选择分类">
              <el-option
                v-for="item in classifyOptions"
                :key="item.classifyId"
                :label="item.title + ' (' + item.articleNum + ')'"
                :value="item.classifyId"
                :disabled="item.status == 0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-form-item>
          <el-form-item style="margin-left: 27px">
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-if="checkPermission(['sys:blog:add'])"
              type="primary"
              plain
              icon="el-icon-edit"
              size="mini"
              @click="handleAdd"
            >写文章</el-button>
          </el-col>
          <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table ref="tables" v-loading="loading" :data="list" :default-sort="defaultSort" @sort-change="handleSortChange">
          <el-table-column label="编号" align="center" width="70" prop="id" />
          <el-table-column label="创建人ID" align="center" prop="createBy" />
          <el-table-column label="标题" align="center" prop="title" width="180" :show-overflow-tooltip="true" />
          <el-table-column label="点击量" align="center" prop="hits" />
          <el-table-column label="排序" align="center" prop="sort" />
          <el-table-column label="允许评论" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.allowComment"
                :active-value="1"
                active-color="#13ce66"
                :inactive-value="0"
                inactive-color="#ff4949"
                :disabled="!checkPermission(['sys:blog:update'])"
                @change="handleAllowCommentChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="是否置顶" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.isTop"
                :active-value="1"
                active-color="#13ce66"
                :inactive-value="0"
                inactive-color="#ff4949"
                :disabled="!checkPermission(['sys:blog:update'])"
                @change="handleTopChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="文章状态" align="center">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status=='1'" size="mini" plain round type="success" @click="handleModifyStatus(scope.row,'0')">
                已发布
              </el-button>
              <el-button v-if="scope.row.status=='0'" size="mini" plain round type="info" @click="handleModifyStatus(scope.row,'1')">
                草稿
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-if="checkPermission(['sys:blog:list'])"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleBlogRead(scope.row)"
              >预览
              </el-button>
              <el-button
                v-if="checkPermission(['sys:blog:update'])"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="checkPermission(['sys:blog:delete'])"
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
  </div>
</template>

<script>
import { list, deleteById, updateStatus, updateTopStatus, updateCommentStatus } from '@/api/blog/article/index'
import checkPermission from '@/utils/permission'
import { Message } from 'element-ui'
import { getAllClassify } from '@/api/blog/classify'
import { getAll } from '@/api/blog/tag'

export default {
  name: 'Article',
  data() {
    return {
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
      // 分类选项
      classifyOptions: [],
      // 标签选项
      tagsOptions: [],
      // 默认排序
      defaultSort: { prop: 'createTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        sortOrder: 'descending',
        beginTime: '',
        endTime: '',
        tagId: undefined,
        classifyId: undefined
      }
    }
  },
  created() {
    this.getList()
    this.getClassifyList()
    this.getTagList()
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
    /** 获取分类选项*/
    getClassifyList() {
      getAllClassify().then(response => {
        this.classifyOptions = response.data
      })
    },
    getTagList() {
      getAll().then(response => {
        this.tagsOptions = response.data
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.queryParams.keyword = ''
      this.queryParams.sortOrder = 'descending'
      this.queryParams.beginTime = ''
      this.queryParams.endTime = ''
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
      this.queryParams.classifyId = undefined
      this.queryParams.tagId = undefined
      this.getList()
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.sortOrder = column.order
      this.getList()
    },
    // 修改评论允许状态
    handleAllowCommentChange(row) {
      const id = row.id
      const text = (row.allowComment == '0' ? '关闭' : '开启')
      this.$confirm('确认要' + text + 'ID为"' + id + '"的文章的评论吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateCommentStatus(id, row.allowComment)
      }).then(() => {
        this.getList()
        Message({ message: '修改成功', type: 'success' })
      }).catch(function() {
        row.allowComment = (row.allowComment == '0' ? 1 : 0)
      })
    },
    // 修改置顶状态
    handleTopChange(row) {
      const id = row.id
      const text = (row.isTop == '0' ? '取消' : '开启')
      this.$confirm('确认要' + text + 'ID为"' + id + '"的文章的置顶吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateTopStatus(id, row.isTop)
      }).then(() => {
        this.getList()
        Message({ message: '修改成功', type: 'success' })
      }).catch(function() {
        row.isTop = (row.isTop == '0' ? 1 : 0)
      })
    },
    handleModifyStatus(row, status) {
      const text = (status == '0' ? '将文章保存为草稿' : '将文章发布')
      this.$confirm('确认要' + text + '吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateStatus(row.id, status)
      }).then(() => {
        this.getList()
        Message({ message: '修改成功', type: 'success' })
      })
    },
    /** 文章预览按钮操作 */
    handleBlogRead(row) {
      const articleIds = row.id
      this.$router.push('/blog/read/article/' + articleIds)
    },
    // 修改文章
    handleUpdate(row) {
      const articleIds = row.id
      this.$router.push('/blog/edit/article/' + articleIds)
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push('/blog/edit/article/0')
    },
    handleDelete(row) {
      const articleId = row.id
      this.$confirm('确认要删除ID为"' + articleId + '"的文章吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deleteById(articleId)
      }).then(() => {
        Message({ message: '删除成功', type: 'success' })
        this.getList()
      }).catch(function() {})
    }
  }
}
</script>
<style>
.inline-block {
  display: inline-block;
  margin-right:10px;
}
.margin-change{
  display: inline-block;
  margin-left:10px;
}
</style>

