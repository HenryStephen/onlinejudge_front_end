<template>
  <div>
    <div style="padding-bottom: 10px;">
    </div>
    <panel title="Export Problems (Beta)">
<!--      关键字查询-->
      <div slot="header">
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="Keywords">
        </el-input>
      </div>
<!--      显示表格-->
      <el-table :data="problems"
                v-loading="loadingProblems" @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="60">
        </el-table-column>
<!--        问题id-->
        <el-table-column
          label="ID"
          width="100"
          prop="problemId">
        </el-table-column>
<!--        显示id-->
        <el-table-column
          label="DisplayID"
          width="200"
          prop="problemDisplayId">
        </el-table-column>
<!--        标题-->
        <el-table-column
          label="Title"
          prop="problemTitle">
        </el-table-column>
<!--        作者-->
        <el-table-column
          prop="problemAuthor"
          label="Author">
        </el-table-column>
<!--        创建时间-->
        <el-table-column
          prop="problemCreateTime"
          label="Create Time">
          <template slot-scope="scope">
            {{scope.row.problemCreateTime | localtime }}
          </template>
        </el-table-column>
      </el-table>
<!--      显示导出项目-->
      <div class="panel-options">
        <el-button type="primary" size="small" v-show="selected_problems.length"
                   @click="exportProblems" icon="el-icon-fa-arrow-down">Export
        </el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="getProblems"
          :page-size="limit"
          :total="total">
        </el-pagination>
      </div>
    </panel>

    <panel title="Import NCIAE Problems">
      <el-upload
        ref="FPS"
        action="/api/content/problem/FPS"
        :headers="importHeaders"
        name="file"
        :file-list="fileList"
        :show-file-list="true"
        :with-credentials="true"
        :limit="3"
        :on-change="onFileChange"
        :auto-upload="false"
        :on-success="uploadSucceeded"
        :on-error="uploadFailed">
        <el-button size="small" type="primary" icon="el-icon-fa-upload" slot="trigger">Choose File</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload('FPS')">Upload</el-button>
      </el-upload>
    </panel>
  </div>
</template>
<script>
  import api from '@admin/api'
  import utils from '@/utils/utils'
  import storage from '@/utils/storage'

  let token = storage.get('token')

  export default {
    name: 'import_and_export',
    data () {
      return {
        fileList: [],
        page: 1,
        limit: 10,
        total: 0,
        loadingProblems: false,
        loadingImporting: false,
        keyword: '',
        problems: [],
        selected_problems: [],
        importHeaders: {Authorization: 'Bearer ' + token}
      }
    },
    mounted () {
      // 获取问题列表
      this.getProblems()
    },
    methods: {
      // 处理选择的元素
      handleSelectionChange (val) {
        this.selected_problems = val
      },
      // 获取问题列表
      getProblems (page = 1) {
        let params = {
          page: page,
          keyword: this.keyword,
          offset: (page - 1) * this.limit,
          limit: this.limit
        }
        this.loadingProblems = true
        api.getProblemList(params).then(res => {
          this.problems = res.data.data.results
          this.total = res.data.data.total
          this.loadingProblems = false
        })
      },
      // 导出题目
      exportProblems () {
        let params = []
        for (let p of this.selected_problems) {
          params.push('problem_id=' + p.id)
        }
        let url = '/admin/export_problem?' + params.join('&')
        utils.downloadFile(url)
      },
      // 上传测试用例
      submitUpload (ref) {
        this.$refs[ref].submit()
      },
      onFileChange (file, fileList) {
        this.fileList = fileList.slice(-1)
      },
      uploadSucceeded (response) {
        if (response.error) {
          this.$error(response.data)
        } else {
          this.$success('Successfully imported ' + response.data.total + ' problems')
          this.getProblems()
        }
      },
      uploadFailed () {
        this.$error('Upload failed')
      }
    },
    watch: {
      'keyword' () {
        this.getProblems()
      }
    }
  }
</script>

<style scoped lang="less">

</style>
