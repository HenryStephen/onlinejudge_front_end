<template>
  <div class="view">
    <Panel :title="$t('m.User_User') ">
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="8">
<!--            删除选中的用户-->
            <el-button v-show="selectedUsers.length"
                       type="warning" icon="el-icon-fa-trash"
                       @click="deleteUsers(selectedUserIDs)">Delete
            </el-button>
          </el-col>
<!--          关键字查询-->
          <el-col :span="selectedUsers.length ? 16: 24">
            <el-input v-model="keyword" prefix-icon="el-icon-search" placeholder="Keywords"></el-input>
          </el-col>
        </el-row>
      </div>
<!--      用户表格-->
      <el-table
        v-loading="loadingTable"
        element-loading-text="loading"
        @selection-change="handleSelectionChange"
        ref="table"
        :data="userList"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
<!--        用户id-->
        <el-table-column prop="userId" label="ID"></el-table-column>
<!--        用户名-->
        <el-table-column prop="userName" label="Username"></el-table-column>
<!--        用户注册时间-->
        <el-table-column prop="userRegtime" label="Create Time">
          <template slot-scope="scope">
            {{scope.row.userRegtime | localtime }}
          </template>
        </el-table-column>
<!--        真实姓名-->
        <el-table-column prop="userRealName" label="Real Name"></el-table-column>
<!--        用户邮箱-->
        <el-table-column prop="userEmail" label="Email"></el-table-column>
<!--        角色类型-->
        <el-table-column prop="roleType" label="User Type">
          <template slot-scope="scope">
            {{ scope.row.roleType }}
          </template>
        </el-table-column>
<!--        操作类型-->
        <el-table-column fixed="right" label="Option" width="200">
          <template slot-scope="{row}">
            <icon-btn name="Edit" icon="edit" @click.native="openUserDialog(row.userId)"></icon-btn>
            <icon-btn name="Delete" icon="trash" @click.native="deleteUsers([row.userId])"></icon-btn>
          </template>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>

    <!--对话框-->
    <el-dialog :title="$t('m.User_Info')" :visible.sync="showUserDialog" :close-on-click-modal="false">
      <el-form :model="user" label-width="120px" label-position="left">
        <el-row :gutter="20">
<!--          用户名-->
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Username')" required>
              <el-input v-model="user.userName"></el-input>
            </el-form-item>
          </el-col>
<!--          用户真实姓名-->
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Real_Name')" required>
              <el-input v-model="user.userRealName"></el-input>
            </el-form-item>
          </el-col>
<!--          用户邮箱-->
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Email')" required>
              <el-input v-model="user.userEmail"></el-input>
            </el-form-item>
          </el-col>
<!--          用户密码-->
          <el-col :span="12">
            <el-form-item :label="$t('m.User_New_Password')">
              <el-input v-model="user.userPassword"></el-input>
            </el-form-item>
          </el-col>
<!--          用户角色类型-->
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Type')">
              <el-select v-model="user.roleType">
                <el-option label="Regular User" value="Regular User"></el-option>
                <el-option label="Admin" value="Admin"></el-option>
                <el-option label="Super Admin" value="Super Admin"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
<!--          用户问题权限-->
          <el-col :span="12">
            <el-form-item :label="$t('m.Problem_Permission')">
              <el-select v-model="user.problem_permission" disabled>
                <el-option label="None" value="None"></el-option>
                <el-option label="Own" value="Own"></el-option>
                <el-option label="All" value="All"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Is_Disabled')">
              <el-switch
                v-model="user.isDisable">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <cancel @click.native="showUserDialog = false">Cancel</cancel>
        <save @click.native="saveUser()"></save>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'

  export default {
    name: 'User',
    data () {
      return {
        // 一页显示的用户数
        pageSize: 10,
        // 用户总数
        total: 0,
        // 用户列表
        userList: [],
        // 搜索关键字
        keyword: '',
        // 是否显示用户对话框
        showUserDialog: false,
        // 当前用户model
        user: {},
        loadingTable: false,
        // 当前页码
        currentPage: 0,
        selectedUsers: []
      }
    },
    mounted () {
      // 获取用户列表
      this.getUserList(1)
    },
    methods: {
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getUserList(page)
      },
      // 提交修改用户的信息
      saveUser () {
        // 更新用户
        api.editUser(this.user).then(res => {
          // 更新列表
          this.getUserList(this.currentPage)
        }).then(() => {
          this.showUserDialog = false
        }).catch(() => {
        })
      },
      // 打开用户对话框
      openUserDialog (id) {
        this.showUserDialog = true
        api.getUser(id).then(res => {
          this.user = res.data.data
          this.user.userPassword = ''
        })
      },
      // 获取用户列表
      getUserList (page) {
        this.loadingTable = true
        api.getUserList(page, this.pageSize, this.keyword).then(res => {
          this.loadingTable = false
          this.total = res.data.data.total
          this.userList = res.data.data.results
        }, res => {
          this.loadingTable = false
        })
      },
      deleteUsers (ids) {
        this.$confirm('Sure to delete the user? The associated resources created by this user will be deleted as well, like problem, contest, announcement, etc.', 'confirm', {
          type: 'warning'
        }).then(() => {
          api.deleteUsers(ids.join(',')).then(res => {
            this.getUserList(this.currentPage)
          }).catch(() => {
            this.getUserList(this.currentPage)
          })
        }, () => {
        })
      },
      handleSelectionChange (val) {
        this.selectedUsers = val
      }
    },
    computed: {
      selectedUserIDs () {
        let ids = []
        for (let user of this.selectedUsers) {
          ids.push(user.id)
        }
        return ids
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      },
      'user.roleType' () {
        if (this.user.roleType === 'Super Admin') {
          this.user.problem_permission = 'All'
        } else if (this.user.roleType === 'Regular User') {
          this.user.problem_permission = 'None'
        } else if (this.user.roleType === 'Admin') {
          this.user.problem_permission = 'Own'
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .import-user-icon {
    color: #555555;
    margin-left: 4px;
  }

  .userPreview {
    padding-left: 10px;
  }

  .notification {
    p {
      margin: 0;
      text-align: left;
    }
  }
</style>
