<template>
  <div class="flex-container">
    <div id="main">
      <Panel shadow>
        <div slot="title">{{title}}</div>
        <div slot="extra">
          <ul class="filter">
            <!-- 状态信息-->
            <li>
              <Dropdown @on-click="handleResultChange">
                <span>{{status}}
                  <Icon type="arrow-down-b"></Icon>
                </span>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="">{{$t('m.All')}}</Dropdown-item>
                  <Dropdown-item v-for="status in Object.keys(JUDGE_STATUS)" :key="status" :name="status">
                    {{$t('m.' + JUDGE_STATUS[status].name.replace(/ /g, "_"))}}
                  </Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </li>
            <!-- 切换all或者mine-->
            <li>
              <i-switch size="large" v-model="formFilter.myself" @on-change="handleQueryChange">
                <span slot="open">{{$t('m.Mine')}}</span>
                <span slot="close">{{$t('m.All')}}</span>
              </i-switch>
            </li>
            <!-- 根据username进行查询-->
            <li>
              <Input v-model="formFilter.username" :placeholder="$t('m.Search_Author')" @on-enter="handleQueryChange"/>
            </li>
<!--            刷新-->
            <li>
              <Button type="info" icon="refresh" @click="getSubmissions">{{$t('m.Refresh')}}</Button>
            </li>
          </ul>
        </div>
<!--        表格-->
        <Table stripe :disabled-hover="true" :columns="columns" :data="submissions" :loading="loadingTable"></Table>
<!--        分页-->
        <Pagination :total="total" :page-size="limit" @on-change="changeRoute" :current.sync="page"></Pagination>
      </Panel>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import { JUDGE_STATUS, USER_TYPE } from '@/utils/constants'
  import utils from '@/utils/utils'
  import time from '@/utils/time'
  import Pagination from '@/pages/oj/components/Pagination'

  export default {
    name: 'submissionList',
    components: {
      Pagination
    },
    data () {
      return {
        formFilter: {
          myself: false,  // 是否显示自己的状态信息
          result: '',
          username: ''  // 根据用户名搜索
        },
        columns: [
          {
            title: this.$i18n.t('m.When'),
            align: 'center',
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.submissionCommitTime))
            }
          },
          {
            title: this.$i18n.t('m.ID'),
            align: 'center',
            render: (h, params) => {
              if (params.row.show_link) {
                return h('span', {
                  style: {
                    color: '#57a3f3',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.$router.push('/status/' + params.row.submissionId)
                    }
                  }
                }, params.row.submissionId)
              } else {
                return h('span', params.row.submissionId)
              }
            }
          },
          {
            title: this.$i18n.t('m.Status'),
            align: 'center',
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: JUDGE_STATUS[params.row.submissionStatus].color
                }
              }, this.$i18n.t('m.' + JUDGE_STATUS[params.row.submissionStatus].name.replace(/ /g, '_')))
            }
          },
          {
            title: this.$i18n.t('m.Problem'),
            align: 'center',
            render: (h, params) => {
              return h('span',
                {
                  style: {
                    color: '#57a3f3',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      if (this.contestID) {
                        this.$router.push(
                          {
                            name: 'contest-problem-details',
                            params: {problemID: params.row.submissionProblemId, contestID: this.contestID}
                          })
                      } else {
                        this.$router.push({name: 'problem-details', params: {problemID: params.row.submissionProblemId}})
                      }
                    }
                  }
                },
                params.row.submissionProblemId)
            }
          },
          {
            title: this.$i18n.t('m.Time'),
            align: 'center',
            render: (h, params) => {
              return h('span', utils.submissionTimeFormat(params.row.submissionUsedTime))
            }
          },
          {
            title: this.$i18n.t('m.Memory'),
            align: 'center',
            render: (h, params) => {
              return h('span', utils.submissionMemoryFormat(params.row.submissionUsedMemory))
            }
          },
          {
            title: this.$i18n.t('m.Language'),
            align: 'center',
            key: 'language'
          },
          {
            title: this.$i18n.t('m.Author'),
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: {
                  'display': 'inline-block',
                  'max-width': '150px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: {username: params.row.username}
                      })
                  }
                }
              }, params.row.username)
            }
          }
        ],
        loadingTable: false,
        submissions: [],
        total: 30,
        limit: 12,
        page: 1,
        contestID: '',
        problemID: '',
        routeName: '',
        JUDGE_STATUS: '',
        rejudge_column: false
      }
    },
    mounted () {
      this.init()
      this.JUDGE_STATUS = Object.assign({}, JUDGE_STATUS)
      // 去除submitting的状态 和 两个
      delete this.JUDGE_STATUS['9']
      delete this.JUDGE_STATUS['2']
    },
    methods: {
      init () {
        // 竞赛id
        this.contestID = this.$route.params.contestID
        let query = this.$route.query
        // 题目id
        this.problemID = query.problemID
        // 是否查看自己
        this.formFilter.myself = query.myself === '1'
        // 评测结果
        this.formFilter.result = query.result || ''
        // 根据作者查询
        this.formFilter.username = query.username || ''
        // 分页
        this.page = parseInt(query.page) || 1
        if (this.page < 1) {
          this.page = 1
        }
        this.routeName = this.$route.name
        this.getSubmissions()
      },
      // 创建查询参数
      buildQuery () {
        return {
          // 是否显示自己
          myself: this.formFilter.myself === true ? '1' : '0',
          // result
          result: this.formFilter.result,
          // 根据用户查询
          username: this.formFilter.username,
          // 页数
          page: this.page
        }
      },
      // 获取submission
      getSubmissions () {
        // 构造查询参数
        let params = this.buildQuery()
        // 竞赛id
        params.contest_id = this.contestID
        // 题目id
        params.problem_id = this.problemID
        // 偏移量
        let offset = (this.page - 1) * this.limit
        // 获取查找函数
        let func = this.contestID ? 'getContestSubmissionList' : 'getSubmissionList'
        this.loadingTable = true
        api[func](offset, this.limit, params).then(res => {
          // 得到响应结果
          let data = res.data.data
          for (let v of data.results) {
            v.loading = false
          }

          this.adjustRejudgeColumn()
          this.loadingTable = false
          // 设置submissions
          this.submissions = data.results
          // 设置total
          this.total = data.total
        }).catch(() => {
          this.loadingTable = false
        })
      },
      // 改变route， 通过监听route变化请求数据，这样可以产生route history， 用户返回时就会保存之前的状态
      changeRoute () {
        // 将空参数过滤
        let query = utils.filterEmptyValue(this.buildQuery())
        // 设置竞赛id
        query.contestID = this.contestID
        // 设置问题id
        query.problemID = this.problemID
        let routeName = query.contestID ? 'contest-submission-list' : 'submission-list'
        this.$router.push({
          name: routeName,
          query: utils.filterEmptyValue(query)
        })
      },
      // 路由重定向
      goRoute (route) {
        this.$router.push(route)
      },
      // 调整重新评测列
      adjustRejudgeColumn () {
        // 如果重新评测列可见
        if (!this.rejudgeColumnVisible || this.rejudge_column) {
          return
        }
        const judgeColumn = {
          title: this.$i18n.t('m.Option'),
          fixed: 'right',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small',
                loading: params.row.loading
              },
              on: {
                click: () => {
                  this.handleRejudge(params.row.id, params.index)
                }
              }
            }, this.$i18n.t('m.Rejudge'))
          }
        }
        this.columns.push(judgeColumn)
        this.rejudge_column = true
      },
      // 处理状态信息改变的函数
      handleResultChange (status) {
        this.page = 1
        this.formFilter.result = status
        this.changeRoute()
      },
      // 处理查询参数改变的函数
      handleQueryChange () {
        this.page = 1
        this.changeRoute()
      },
      // 处理重新评测的函数
      handleRejudge (id, index) {
        this.submissions[index].loading = true
        api.submissionRejudge(id).then(res => {
          this.submissions[index].loading = false
          this.$success('Succeeded')
          this.getSubmissions()
        }, () => {
          this.submissions[index].loading = false
        })
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user']),
      // 用来设置表格标题
      title () {
        if (!this.contestID) {
          return this.$i18n.t('m.Status')
        } else if (this.problemID) {
          return this.$i18n.t('m.Problem_Submissions')
        } else {
          return this.$i18n.t('m.Submissions')
        }
      },
      status () {
        return this.formFilter.result === '' ? this.$i18n.t('m.Status') : this.$i18n.t('m.' + JUDGE_STATUS[this.formFilter.result].name.replace(/ /g, '_'))
      },
      // 重新评测列是否可见
      rejudgeColumnVisible () {
        return !this.contestID && this.user.admin_type === USER_TYPE.SUPER_ADMIN
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      },
      'rejudgeColumnVisible' () {
        this.adjustRejudgeColumn()
      },
      'isAuthenticated' () {
        this.init()
      }
    }
  }
</script>

<style scoped lang="less">
  .ivu-btn-text {
    color: #57a3f3;
  }

  .flex-container {
    #main {
      flex: auto;
      margin-right: 18px;
      .filter {
        margin-right: -10px;
      }
    }
    #contest-menu {
      flex: none;
      width: 210px;
    }
  }
</style>
