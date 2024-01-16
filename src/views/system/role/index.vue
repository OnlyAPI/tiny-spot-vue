<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>

        <el-form v-show="showSearch" ref="queryParams" :model="queryParams" size="small" :inline="true">
          <el-form-item label="关键字" prop="username">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入权限字符/描述"
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
            <el-button v-if="checkPermission(['sys:role:add'])" type="primary" plain icon="el-icon-plus" size="mini"
                       @click="handleAdd"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-if="checkPermission(['sys:role:update'])" type="success" plain icon="el-icon-edit" size="mini"
                       :disabled="single" @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-if="checkPermission(['sys:role:delete'])" type="danger" plain icon="el-icon-delete" size="mini"
                       :disabled="multiple" @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
          <right-toolbar :show-search.sync="showSearch" @queryTable="getList"/>
        </el-row>

        <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column prop="id" label="角色ID" align="center"/>
          <el-table-column prop="name" label="权限字符" align="center"/>
          <el-table-column prop="description" label="描述" align="center"/>
          <el-table-column prop="userCount" label="用户数量" align="center"/>
          <el-table-column prop="sort" label="显示顺序" align="center"/>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                active-color="#13ce66"
                :inactive-value="0"
                inactive-color="#ff4949"
                :disabled="!checkPermission(['sys:role:enable', 'sys:role:disable'])"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180" align="center" prop="createTime">
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
            <template v-if="scope.row.id !== 1" slot-scope="scope">
              <el-button
                v-if="checkPermission(['sys:role:update'])"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-if="checkPermission(['sys:role:delete'])"
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item prop="name">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
          <el-input v-model="form.name" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label=1>启用</el-radio>
            <el-radio :label=0>禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menu"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
          ></el-tree>
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

import { Message } from 'element-ui'
import checkPermission from '@/utils/permission'
import {
  listRolePage,
  delRole,
  changeRoleStatus,
  updateRole,
  addRole,
  getRoleById,
  roleMenuTreeselect
} from '@/api/system/role/index'
import { treeselect as menuTreeselect } from '@/api/system/menu'

export default {
  data() {
    return {
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
      // 选中角色数组
      ids: [],

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
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '权限字符长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
        ]
      },
      // 菜单展开
      menuExpand: false,
      // 全部节点
      menuNodeAll: false,
      // 菜单列表
      menuOptions: []
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
      listRolePage(this.queryParams).then(response => {
        this.tableData = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    /** 角色状态修改 */
    handleStatusChange(row) {
      const text = (row.status == '0' ? '停用' : '启用')
      this.$confirm('确认要' + text + 'ID为"' + row.id + '"的角色吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeRoleStatus(row.id, row.status)
      }).then(() => {
        Message({ message: text + '成功', type: 'success' })
      }).catch(function() {
        row.status = (row.status == '0' ? 1 : 0)
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
      const roleId = row.id || this.ids
      this.$confirm('确认要删除ID为"' + roleId + '"的角色吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delRole(roleId)
      }).then(() => {
        this.getList()
        Message({ message: '删除成功', type: 'success' })
      }).catch(function() {
      })
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
    /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = response.data
      })
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.data.menus
        return response
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getMenuTreeselect()
      this.open = true
      this.title = '添加角色'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const roleId = row.id || this.ids
      const roleMenu = this.getRoleMenuTreeselect(roleId)
      getRoleById(roleId).then(response => {
        this.form = response.data
        this.open = true
        this.$nextTick(() => {
          roleMenu.then(res => {
            let checkedKeys = res.data.checkedKeys
            checkedKeys.forEach((v) => {
              this.$nextTick(() => {
                this.$refs.menu.setChecked(v, true ,false)
              })
            })
          })
        })
      })
      this.title = '修改角色'
    },
    // 表单重置
    reset() {
      // 菜单展开
      this.menuExpand = false,
      // 全部节点
      this.menuNodeAll = false,
      this.menuOptions = [],
      this.form = {
        id: undefined,
        name: undefined,
        description: undefined,
        sort: 0,
        status: 1,
        menuCheckStrictly: true,
        menuIds: []
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form, this.form.id).then(response => {
              Message({ message: '修改成功', type: 'success' })
              this.open = false
              this.getList()
            })
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
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
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        const treeList = this.menuOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      this.$refs.menu.setCheckedNodes(value ? this.menuOptions : [])
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      this.form.menuCheckStrictly = value ? true : false
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.menu.getCheckedKeys()
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    }
    /** 查询菜单下拉树结构 */
    // getTreeselect() {
    //   listMenu().then(response => {
    //     this.menuOptions = []
    //     const menu = { menuId: 0, menuName: '主类目', children: [] }
    //     menu.children = this.handleTree(response.data, "menuId")
    //     this.menuOptions.push(menu)
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
