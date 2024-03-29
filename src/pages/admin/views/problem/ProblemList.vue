<template>
  <div class="view">
    <Panel :title="contestId ? this.$i18n.t('m.Contest_Problem_List') : this.$i18n.t('m.Problem_List')">
      <div slot="header">
<!--        关键字查询-->
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="Keywords">
        </el-input>
      </div>
      <el-table
        v-loading="loading"
        element-loading-text="loading"
        ref="table"
        :data="problemList"
        @row-dblclick="handleDblclick"
        style="width: 100%">
<!--        题目id-->
        <el-table-column
          width="100"
          prop="problemId"
          label="ID">
        </el-table-column>
<!--        展示id-->
        <el-table-column
          width="150"
          label="Display ID">
          <template slot-scope="{row}">
            <span v-show="!row.isEditing">{{row.problemDisplayId}}</span>
            <el-input v-show="row.isEditing" v-model="row.problemDisplayId"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
<!--        题目标题-->
        <el-table-column
          prop="problemTitle"
          label="Title">
          <template slot-scope="{row}">
            <span v-show="!row.isEditing">{{row.problemTitle}}</span>
            <el-input v-show="row.isEditing" v-model="row.problemTitle"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
<!--          题目作者-->
        <el-table-column
          prop="problemAuthor"
          label="Author">
        </el-table-column>
<!--          题目创建时间-->
        <el-table-column
          width="200"
          prop="problemCreateTime"
          label="Create Time">
          <template slot-scope="scope">
            {{scope.row.problemCreateTime | localtime }}
          </template>
        </el-table-column>
<!--          可见性-->
        <el-table-column
          width="100"
          prop="visible"
          label="Visible">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       @change="updateProblem(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
<!--          操作-->
        <el-table-column
          fixed="right"
          label="Operation"
          width="250">
          <div slot-scope="scope">
<!--              编辑-->
            <icon-btn name="Edit" icon="edit" @click.native="goEdit(scope.row.problemDisplayId)"></icon-btn>
<!--              如果处于竞赛中，将竞赛题目公开-->
            <icon-btn v-if="contestId" name="Make Public" icon="clone"
                      @click.native="makeContestProblemPublic(scope.row.problemId)"></icon-btn>
<!--              下载测试用例-->
<!--            <icon-btn icon="download" name="Download TestCase"-->
<!--                      @click.native="downloadTestCase(scope.row.problemId)"></icon-btn>-->
<!--              删除题目-->
            <icon-btn icon="trash" name="Delete Problem"
                      @click.native="deleteProblem(scope.row.problemId)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
<!--          创建题目-->
        <el-button type="primary" size="small"
                   @click="goCreateProblem" icon="el-icon-plus">Create
        </el-button>
<!--          如果处于竞赛中，则从公共题目集中添加题目-->
        <el-button v-if="contestId" type="primary"
                   size="small" icon="el-icon-plus"
                   @click="addProblemDialogVisible = true">Add From Public Problem
        </el-button>
<!--          分页-->
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
<!--      更新题目展示id和标题时的提示框-->
    <el-dialog title="Sure to update the problem? "
               width="20%"
               :visible.sync="InlineEditDialogVisible"
               @close-on-click-modal="false">
      <div>
        <p>DisplayID: {{currentRow.problemDisplayId}}</p>
        <p>Title: {{currentRow.problemTitle}}</p>
      </div>
      <span slot="footer">
<!--          如果点击取消按钮-->
        <cancel @click.native="InlineEditDialogVisible = false; getProblemList(currentPage)"></cancel>
        <save @click.native="updateProblem(currentRow)"></save>
      </span>
    </el-dialog>
<!--      添加竞赛题目-->
    <el-dialog title="Add Contest Problem"
               v-if="contestId"
               width="80%"
               :visible.sync="addProblemDialogVisible"
               @close-on-click-modal="false">
      <add-problem-component :contestID="contestId" @on-change="getProblemList"></add-problem-component>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import AddProblemComponent from './AddPublicProblem.vue'

  export default {
    name: 'ProblemList',
    components: {
      AddProblemComponent
    },
    data () {
      return {
        pageSize: 10,
        total: 0,
        problemList: [],
        keyword: '',
        loading: false,
        currentPage: 1,
        routeName: '',
        contestId: '',
        // for make public use
        currentProblemID: '',
        currentRow: {},
        InlineEditDialogVisible: false,
        makePublicDialogVisible: false,
        addProblemDialogVisible: false
      }
    },
    mounted () {
      this.routeName = this.$route.name
        // 获取竞赛id
      this.contestId = this.$route.params.contestId
        // 获取题目列表
      this.getProblemList(this.currentPage)
    },
    methods: {
      // 处理双击函数
      handleDblclick (row) {
        row.isEditing = true
      },
      // 编辑题目函数
      goEdit (problemId) {
        if (this.routeName === 'problem-list') {
            // 编辑题目
          this.$router.push({name: 'edit-problem', params: {problemId}})
        } else if (this.routeName === 'contest-problem-list') {
            // 编辑竞赛题目
          this.$router.push({name: 'edit-contest-problem', params: {problemId: problemId, contestId: this.contestId}})
        }
      },
        // 创建题目
      goCreateProblem () {
        if (this.routeName === 'problem-list') {
            // 创建题目
          this.$router.push({name: 'create-problem'})
        } else if (this.routeName === 'contest-problem-list') {
            // 创建竞赛题目
          this.$router.push({name: 'create-contest-problem', params: {contestId: this.contestId}})
        }
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getProblemList(page)
      },
      // 获取问题列表（公共+竞赛）
      getProblemList (page = 1) {
        this.loading = true
        let funcName = this.routeName === 'problem-list' ? 'getProblemList' : 'getContestProblemList'
        let params = {
          page: page,
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          keyword: this.keyword,
          contestId: this.contestId
        }
        api[funcName](params).then(res => {
          this.loading = false
          if (res.data.data == null) {
            this.total = 0
            this.problemList = null
          } else {
            this.total = res.data.data.total
            for (let problem of res.data.data.results) {
              problem.isEditing = false
            }
            this.problemList = res.data.data.results
          }
        }, res => {
          this.loading = false
        })
      },
        // 删除题目
      deleteProblem (problemId) {
        this.$confirm('Sure to delete this problem? The associated submissions will be deleted as well.', 'Delete Problem', {
          type: 'warning'
        }).then(() => {
          let funcName = this.routeName === 'problem-list' ? 'deleteProblem' : 'deleteContestProblem'
          api[funcName](this.contestId, problemId).then(() => [
            this.getProblemList(this.currentPage - 1)
          ]).catch(() => {
          })
        }, () => {
        })
      },
        // 使竞赛题目变为公共题目
      makeContestProblemPublic (problemID) {
        this.$prompt('Please input display id for the public problem', 'confirm').then(({value}) => {
          api.makeContestProblemPublic({problemId: problemID, problemDisplayId: value}).catch()
        }, () => {
        })
      },
        // 更新题目
      updateProblem (row) {
        let data = Object.assign({}, row)
        let funcName = ''
        if (this.contestId) {
          data.contestId = this.contestId
          funcName = 'editContestProblem'
        } else {
          funcName = 'editProblem'
        }
        api[funcName](data).then(res => {
          this.InlineEditDialogVisible = false
          this.getProblemList(this.currentPage)
        }).catch(() => {
          this.InlineEditDialogVisible = false
        })
      },
        // 处理行内编辑
      handleInlineEdit (row) {
        this.currentRow = row
        this.InlineEditDialogVisible = true
      },
        // 下载测试用例
      // downloadTestCase (problemID) {
      //   let url = '/admin/test_case?problem_id=' + problemID
      //   utils.downloadFile(url)
      // },
        // 获取公共题目
      getPublicProblem () {
        api.getProblemList()
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        this.contestId = newVal.params.contestId
        this.routeName = newVal.name
        this.getProblemList(this.currentPage)
      },
      'keyword' () {
        this.currentChange()
      }
    }
  }
</script>

<style scoped lang="less">
</style>
