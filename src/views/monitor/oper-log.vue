<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="操作人员" prop="operAdminId">
        <el-input
          v-model="queryParams.operAdminId"
          placeholder="请输入操作人员ID"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="请求地址" prop="ipaddr">
        <el-input
          v-model="queryParams.requestUri"
          placeholder="请输入请求地址"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="操作状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in [{'label': '成功','value':'SUCCESS'},{'label': '失败','value':'FAIL'}]"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
        >清空</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="编号ID" align="center" width="70" prop="id" />
      <el-table-column label="操作模块" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="业务类型" align="center" prop="businessType">
        <template slot-scope="scope">
          <el-tag :type="formatBusinessType(scope.row)" effect="plain">
            {{ formatBusinessTypeVal(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作人员ID" align="center" prop="operAdminId" width="110" :show-overflow-tooltip="true"/>
      <el-table-column label="操作日期" align="center" prop="createTime" width="160" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag size="small" :type="formatStatus(scope.row)" effect="plain">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >详细</el-button>
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

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作ID：">{{ form.id }}</el-form-item>
            <el-form-item label="操作人员ID：">{{ form.operAdminId }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作类别：">后台用户</el-form-item>
            <el-form-item label="操作模块：">{{ form.title }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型：">{{ this.formatBusinessTypeVal(form) }}</el-form-item>
            <el-form-item label="请求地址：">{{ form.requestUri }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="响应码：">{{ form.respCode }}</el-form-item>
            <el-form-item label="响应消息：">{{ form.respMsg }}</el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作状态：">
              <div v-if="form.status == 'SUCCESS'">成功</div>
              <div v-else-if="form.status == 'FAIL'">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="操作时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list } from '@/api/monitor/oper-log'

export default {
  name: 'Operlog',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'createTime', order: 'descending ' },
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        operAdminId: undefined,
        requestUri: '',
        status: undefined,
        sortOrder: 'descending',
        beginTime: '',
        endTime: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询登录日志 */
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
      }
      )
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
      this.queryParams.title = ''
      this.queryParams.operAdminId = undefined
      this.queryParams.keyword = ''
      this.queryParams.status = ''
      this.queryParams.sortOrder = 'descending'
      this.queryParams.beginTime = ''
      this.queryParams.endTime = ''
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.sortOrder = column.order
      this.getList()
    },
    /** 详情按钮操作 */
    handleView(row) {
      this.open = true
      this.form = row
    },
    formatStatus(row) {
      const status = row.status
      if (status == 'success' || status == 'SUCCESS') {
        return 'success'
      } else {
        return 'danger'
      }
    },
    formatBusinessType(row) {
      let types
      switch (row.businessType) {
        case 0:
          types = 'info'
          break
        case 1:
          types = 'success'
          break
        case 2:
          types = 'success'
          break
        case 3:
          types = 'danger'
          break
        case 4:
          types = 'warning'
          break
        case 5:
          types = 'warning'
          break
        case 6:
          types = 'warning'
          break
      }
      return types
    },
    formatBusinessTypeVal(row) {
      let typeVal
      switch (row.businessType) {
        case 0:
          typeVal = '其他'
          break
        case 1:
          typeVal = '新增'
          break
        case 2:
          typeVal = '修改'
          break
        case 3:
          typeVal = '删除'
          break
        case 4:
          typeVal = '授权'
          break
        case 5:
          typeVal = '导出'
          break
        case 6:
          typeVal = '导入'
          break
      }
      return typeVal
    },
    handleDelete(row) {
    },
    handleClean() {

    }

  }
}
</script>
<style>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>

