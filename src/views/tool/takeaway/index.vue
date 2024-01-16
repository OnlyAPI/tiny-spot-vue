<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true">
          <el-form-item label="字数" prop="keyworkNum">
            <el-input
              v-model="queryParams.keyworkNum"
              placeholder="请输入最少字数"
              clearable
              style="width: 240px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="addContent"
            >新增
            </el-button>
          </el-col>
          <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table ref="tables" v-loading="loading" :data="list" :default-sort="defaultSort" @sort-change="handleSortChange">
          <el-table-column label="ID" align="center" width="70" prop="id" />
          <el-table-column label="创建日期" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="点赞数" align="center" prop="niceNum" width="80" :show-overflow-tooltip="true" />
          <el-table-column label="字数" align="center" prop="keyworkNum" width="80" :show-overflow-tooltip="true" />
          <el-table-column label="内容" align="center" prop="contentText" :show-overflow-tooltip="true" />
          <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-document-copy"
                @click="copyContext(scope.row)"
              >复制</el-button>
              <el-button
                v-if="checkPermission(['sys:takeaway:update'])"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="updateContent(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="checkPermission(['sys:takeaway:delete'])"
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

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item label="好评内容" prop="contentText">
          <el-input v-model="form.contentText" placeholder="请输入好评内容" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, save, update, deleteById, getById } from '@/api/tool/takeaway/index'
import { Message } from 'element-ui'
import checkPermission from '@/utils/permission'

export default {
  name: 'TakeawaySet',
  data() {
    return {
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
        keyworkNum: undefined,
        sortOrder: 'descending',
        beginTime: '',
        endTime: ''
      },
      // 表单参数
      form: {},
      // 新增/修改-弹出层标题
      title: '',
      // 新增/修改-是否显示弹出层
      open: false,
      // 表单校验
      rules: {
        contentText: [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ]
      }
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
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.queryParams.sortOrder = 'descending'
      this.queryParams.keyworkNum = undefined
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
    /** 添加新评论*/
    addContent() {
      this.reset()
      this.open = true
      this.title = '新增内容'
    },
    /** 复制内容*/
    copyContext(row) {
      var input = document.createElement('input')
      input.value = row.contentText
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      document.body.removeChild(input)
      Message({ message: '复制成功', type: 'success' })
    },
    // 修改评论
    updateContent(row) {
      this.reset()
      const id = row.id
      this.open = true
      getById(id).then(response => {
        this.form = response.data
      })
      this.title = '修改内容'
    },
    // 删除
    handleDelete(row) {
      const id = row.id || this.ids
      this.$confirm('确认要删除ID为"' + id + '"的评论吗？', '系统提示', {
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
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        contentText: undefined
      }
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            update(this.form.id, this.form).then(response => {
              Message({ message: '修改成功', type: 'success' })
              this.open = false
              this.getList()
            })
          } else {
            save(this.form).then(response => {
              Message({ message: '新增成功', type: 'success' })
              this.open = false
              this.getList()
            })
          }
        }
      })
    }
  }
}
</script>

