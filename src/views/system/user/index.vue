<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>

        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" v-show="showSearch">
          <el-form-item label="关键字" prop="username">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入用户名/昵称"
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
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-if="checkPermission(['sys:user:add'])">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-if="checkPermission(['sys:user:update'])">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-if="checkPermission(['sys:user:delete'])">
              删除
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column prop="id" label="用户ID" width="60" align="center"></el-table-column>
          <el-table-column prop="username" label="用户名" align="center"></el-table-column>
          <el-table-column prop="email" label="邮箱" align="center" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="nickName" label="昵称" align="center" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="用户来源" align="center" prop="userResource">
            <template slot-scope="scope">
              <el-tag type="danger" effect="Plain">
                {{ scope.row.userResource }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="80">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                active-color="#13ce66"
                :inactive-value="0"
                inactive-color='#ff4949'
                :disabled="!checkPermission(['sys:user:enable', 'sys:user:disable'])"
                @change="handleStatusChange(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" width="180" prop="createTime">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width">
            <template slot-scope="scope" v-if="scope.row.id !== 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-if="checkPermission(['sys:user:update'])"
              >修改
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-if="checkPermission(['sys:user:delete'])"
              >删除
              </el-button>
              <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)">
                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleResetPwd" icon="el-icon-key" v-if="checkPermission(['sys:user:pwdreset'])">重置密码</el-dropdown-item>
                  <el-dropdown-item command="handleAuthRole" icon="el-icon-circle-check" v-if="checkPermission(['sys:user:update','sys:role:list'])">分配角色</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username" v-if="form.id == undefined">
              <el-input v-model="form.username" placeholder="请输入用户名" maxlength="30"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户密码" prop="password" v-if="form.id == undefined">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="头像" prop="icon">
              <el-upload
                class="avatar-uploader"
                :action="uploadImgUrl"
                :show-file-list="false"
                :on-success="handleAvatarSuccess">
                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label=1>启用</el-radio>
                <el-radio :label=0>禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.id"
                  :label="item.description"
                  :value="item.id"
                  :disabled="item.status == 0"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.note" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  getUserRole
} from '@/api/system/user/index'
import { listRole } from '@/api/system/role/index'
import { Message } from 'element-ui'
import checkPermission from '@/utils/permission'

export default {
  data() {
    return {
      // 角色选项
      roleOptions: [],
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
        keyword: ''
      },
      // 显示搜索条件
      showSearch: true,

      // 新增/修改-弹出层标题
      title: '',
      // 新增/修改-是否显示弹出层
      open: false,
      // 表单参数
      form: {},

      // 上传头像地址
      uploadImgUrl: process.env.VUE_APP_BASE_API + '/file/upload', // 上传的图片服务器地址
      imageUrl: '',
      // 初始密码
      initPassword: '123456',
      // 表单校验
      rules: {
        username: [
          {required: true, message: '用户名不能为空', trigger: 'blur'},
          {min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '用户密码不能为空', trigger: 'blur'},
          {min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.queryParams).then(response => {
        this.tableData = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    /** 用户状态修改 */
    handleStatusChange(row) {
      const text = (row.status == '0' ? '停用' : '启用')
      this.$confirm('确认要' + text + 'ID为"' + row.id + '"的用户吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        return changeUserStatus(row.id, row.status)
      }).then(() => {
        Message({message: text + '成功', type: 'success'})
      }).catch(function () {
        row.status = (row.status == '0' ? 1 : 0)
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetForm() {
      this.queryParams.keyword = ''
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userId = row.id || this.ids
      this.$confirm('确认要删除ID为"' + userId + '"的用户吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delUser(userId)
      }).then(() => {
        this.getList()
        Message({ message: '删除成功', type: 'success' })
      }).catch(function() {})
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = selection.length != 1
      if (this.ids.includes(1)) {
        this.single = true
        this.multiple = true
      }
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleResetPwd':
          this.handleResetPwd(row)
          break
        case 'handleAuthRole':
          this.handleAuthRole(row)
          break
        default:
          break
      }
    },
    /** 分配角色按钮操作 */
    handleAuthRole(row) {
      const userId = row.id
      this.$router.push('/system/user-auth/role/' + userId)
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入ID为"' + row.id + '"用户的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: '用户密码长度必须介于 5 和 20 之间'
      }).then(({ value }) => {
        resetUserPwd(row.id, value).then(response => {
          Message({ message: '修改成功，新密码是：' + value, type: 'success' })
        })
      }).catch(() => {
      })
    },

    /** 处理头像成功 */
    handleAvatarSuccess(res, file) {
      this.imageUrl = res.data
      this.form.icon = res.data
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.imageUrl = ''
      this.roleOptions = []
      listRole().then(response => {
        this.roleOptions = response.data
      })
      this.open = true
      this.title = '添加用户'
      this.form.password = this.initPassword
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.roleOptions = []
      const userId = row.id || this.ids
      getUser(userId).then(response => {
        this.form = response.data
        this.open = true
        this.imageUrl = response.data.icon
        this.form.icon = response.data.icon
        this.title = '修改用户'
        this.form.password = ''
        getUserRole(userId).then(response => {
          this.$set(this.form, 'roleIds', response.data)
        })
        listRole().then(response => {
          this.roleOptions = response.data
        })
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        username: undefined,
        password: undefined,
        nickName: undefined,
        email: undefined,
        icon: '',
        status: 1,
        note: '',
        roleIds: []
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateUser(this.form, this.form.id).then(response => {
              Message({ message: '修改成功', type: 'success' })
              this.open = false
              this.getList()
            })
          } else {
            addUser(this.form).then(response => {
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
    }
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
