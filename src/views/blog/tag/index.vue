<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true">
          <el-form-item label="标签名">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入标签名"
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
              v-if="checkPermission(['sys:blogTag:add'])"
            >新增
            </el-button>
          </el-col>
          <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table ref="tables" v-loading="loading" :data="list" :default-sort="defaultSort" @sort-change="handleSortChange">
          <el-table-column label="ID" align="center" width="70" prop="id" />
<!--          <el-table-column label="标签名" align="center" prop="title" :show-overflow-tooltip="true" />-->
          <el-table-column label="标签名" align="center" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-tag effect="light">
                {{ scope.row.title }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="文章数量" align="center" prop="articleNum" :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                active-color="#13ce66"
                :inactive-value="0"
                inactive-color="#ff4949"
                :disabled="!checkPermission(['sys:blogTag:enable', 'sys:blogTag:disable'])"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建日期" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="修改日期" align="center" prop="updateTime">
            <template slot-scope="scope">
              <span>{{ scope.row.updateTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-if="checkPermission(['sys:blogTag:update'])"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="checkPermission(['sys:blogTag:delete'])"
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

    <el-dialog :title="title" :visible.sync="open" :center="true" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules">
        <el-row>
          <el-col :span="24">
            <el-form-item label="标签内容" prop="title">
              <el-input v-model="form.title" placeholder="请输入标签内容" @keyup.enter.native="submitForm"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="24 ">
          <el-form-item label="标签状态:" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { list, save, update, deleteById, getById, updateStatus } from '@/api/blog/tag/index'
import { Message } from 'element-ui'
import checkPermission from '@/utils/permission'

export default {
  name: 'Tag',
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
        keyword: undefined,
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
        title: [
          { required: true, message: '标签名不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
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
      this.queryParams.keyword = undefined
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
    /** 添加新标签*/
    addContent() {
      this.reset()
      this.open = true
      this.title = '新增标签'
    },
    // 修改标签
    handleUpdate(row) {
      this.reset()
      const id = row.id
      this.open = true
      getById(id).then(response => {
        this.form = response.data
      })
      this.title = '修改标签'
    },
    // 删除
    handleDelete(row) {
      const id = row.id || this.ids
      this.$confirm('确认要删除"' + row.title + '"标签吗？', '系统提示', {
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
        title: '',
        status: 1
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
    },
    handleStatusChange(row) {
      const id = row.id
      const text = (row.status == '0' ? '禁用' : '启用')
      this.$confirm('确认要' + text + '"' + row.title + '"标签吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateStatus(id, row.status)
      }).then(() => {
        this.getList()
        Message({ message: text + '成功', type: 'success' })
      }).catch(function() {
        row.status = (row.status == '0' ? 1 : 0)
      })
    }
  }
}
</script>

