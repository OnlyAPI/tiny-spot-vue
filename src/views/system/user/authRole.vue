<template>
  <div class="app-container">

    <div style="margin-bottom: 5px">
      <div style="float: left; position: relative;">
        {{ title }} {{userId}}
      </div>
      <el-row style="float: right;margin-bottom: 5px">
        <el-tooltip class="item" effect="dark" content="刷新" placement="top">
          <el-button size="mini" circle icon="el-icon-refresh" @click="getRoleList"/>
        </el-tooltip>
      </el-row>
    </div>
    <el-table v-loading="loading" :row-key="getRowKey" @row-click="clickRow" ref="table"
              @selection-change="handleSelectionChange" :data="roles.slice((pageNum-1)*pageSize,pageNum*pageSize)">
      <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
      <el-table-column label="角色ID" align="center" prop="id"/>
      <el-table-column label="角色名称" align="center" prop="description"/>
      <el-table-column label="权限字符" align="center" prop="name"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" @pagination="getRoleList"/>

    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-120px;margin-top:30px;">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getUserRole, updateAuthRole } from '@/api/system/user'
import { listRole } from '@/api/system/role'
import { Message } from 'element-ui'
import router from '@/router'

export default {
  name: 'AuthRole',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 分页信息
      total: 0,
      pageNum: 1,
      pageSize: 10,
      // 选中角色编号
      roleIds: [],
      // 角色信息
      roles: [],
      userId: undefined,
      userRoles: [],
      title: '分配角色-当前用户ID:'
    }
  },
  created() {
    this.userId = this.$route.params && this.$route.params.userId
    this.loading = true
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    getRoleList() {
      this.reset()
      this.loading = true
      listRole().then((response) => {
        this.roles = response.data
        this.total = this.roles.length
        getUserRole(this.userId).then(res => {
          this.userRoles = res.data
          this.userRoles.forEach(key => {
            this.roles.forEach((row) => {
              if (key == row.id) {
                this.$refs.table.toggleRowSelection(row)
              }
            })
          })
        })
        this.loading = false
      })
    },
    /** 单击选中行数据 */
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.roleIds = selection.map((item) => item.id)
    },
    // 保存选中的数据编号
    getRowKey(row) {
      return row.id
    },
    /** 提交按钮 */
    submitForm() {
      const roleIds = this.roleIds.join(',')
      updateAuthRole({ userId: this.userId, roleIds: roleIds }).then((response) => {
        Message({ message: '分配成功', type: 'success' })
        this.close()
      })
    },
    /** 关闭按钮 */
    close() {
      this.reset()
      router.push('/system/user')
    },
    reset() {
      // 分页信息
      this.total = 0
      this.pageNum = 1
      this.pageSize = 10
      // 选中角色编号
      this.roleIds = []
      // 角色信息
      this.roles = []
    }
  }
}
</script>
