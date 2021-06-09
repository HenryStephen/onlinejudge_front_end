<template>
  <div class="flex-container">
<!--    题目区域-->
    <div id="problem-main">
      <!--problem main-->
      <Panel :padding="40" shadow>
<!--        题目名称-->
        <div slot="title">{{problem.problemTitle}}</div>
        <div id="problem-content" class="markdown-body" v-katex>
<!--          题目描述-->
          <p class="title">{{$t('m.Description')}}</p>
          <p class="content" v-html=problem.problemDescription></p>
<!--          题目输入格式-->
          <p class="title">{{$t('m.Input')}}</p>
          <p class="content" v-html=problem.problemInputFormation></p>
<!--          题目输出格式-->
          <p class="title">{{$t('m.Output')}}</p>
          <p class="content" v-html=problem.problemOutputFormation></p>
<!--          题目样例-->
          <div v-for="(sample, index) of problem.samples" :key="index">
            <div class="flex-container sample">
              <div class="sample-input">
<!--                题目样例输入-->
                <p class="title">{{$t('m.Sample_Input')}} {{index + 1}}
                  <a class="copy"
                     v-clipboard:copy="sample.sampleInput"
                     v-clipboard:success="onCopy"
                     v-clipboard:error="onCopyError">
                    <Icon type="clipboard"></Icon>
                  </a>
                </p>
                <pre>{{sample.sampleInput}}</pre>
              </div>
<!--              题目样例输出-->
              <div class="sample-output">
                <p class="title">{{$t('m.Sample_Output')}} {{index + 1}}</p>
                <pre>{{sample.sampleOutput}}</pre>
              </div>
            </div>
          </div>
<!--          题目提示-->
          <div v-if="problem.problemReminder">
            <p class="title">{{$t('m.Hint')}}</p>
            <Card dis-hover>
              <div class="content" v-html=problem.problemReminder></div>
            </Card>
          </div>
<!--          题目来源-->
          <div v-if="problem.problemSource">
            <p class="title">{{$t('m.Source')}}</p>
            <p class="content">{{problem.problemSource}}</p>
          </div>

        </div>
      </Panel>
      <!--problem main end-->
<!--      代码区域-->
      <Card :padding="20" id="submit-code" dis-hover>
<!--        代码框-->
        <CodeMirror :value.sync="code"
                    :languages="problem.languages"
                    :language="language"
                    :theme="theme"
                    @resetCode="onResetToTemplate"
                    @changeTheme="onChangeTheme"
                    @changeLang="onChangeLang">
        </CodeMirror>
<!--        显示状态等信息-->
        <Row type="flex" justify="space-between">
          <Col :span="10">
<!--            如果状态可见-->
            <div class="status" v-if="statusVisible">
<!--              如果没有竞赛或者竞赛有查看榜单的权限-->
              <template v-if="!this.contestID || (this.contestID && OIContestRealTimePermission)">
                <span>{{$t('m.Status')}}</span>
                <Tag type="dot" :color="submissionStatus.color" @click.native="handleRoute('/status/'+submissionId)">
                  {{$t('m.' + submissionStatus.text.replace(/ /g, "_"))}}
                </Tag>
              </template>
<!--              如果竞赛没有查看榜单的权限-->
              <template v-else-if="this.contestID && !OIContestRealTimePermission">
                <Alert type="success" show-icon>{{$t('m.Submitted_successfully')}}</Alert>
              </template>
            </div>
<!--            如果该题目状态为 success-->
            <div v-else-if="problem.myStatus === 0">
              <Alert type="success" show-icon>{{$t('m.You_have_solved_the_problem')}}</Alert>
            </div>
<!--            如果处于竞赛中，并且题目已经提交 没有查看榜单权限时-->
            <div v-else-if="this.contestID && !OIContestRealTimePermission && submissionExists">
              <Alert type="success" show-icon>{{$t('m.You_have_submitted_a_solution')}}</Alert>
            </div>
<!--            如果竞赛已经结束-->
            <div v-if="contestEnded">
              <Alert type="warning" show-icon>{{$t('m.Contest_has_ended')}}</Alert>
            </div>
          </Col>

          <Col :span="12">
<!--            提交代码 submitting为是否正在提交  submitted为是否已提交-->
            <Button type="warning" icon="edit" :loading="submitting" @click="submitCode"
                    :disabled="problemSubmitDisabled || submitted"
                    class="fl-right">
<!--              正在提交-->
              <span v-if="submitting">{{$t('m.Submitting')}}</span>
<!--              提交-->
              <span v-else>{{$t('m.Submit')}}</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>

    <div id="right-column">
<!--      显示提交信息-->
      <VerticalMenu @on-click="handleRoute">
        <template v-if="this.contestID">
          <VerticalMenu-item :route="{name: 'contest-problem-list', params: {contestID: contestID}}">
            <Icon type="ios-photos"></Icon>
            {{$t('m.Problems')}}
          </VerticalMenu-item>

          <VerticalMenu-item :route="{name: 'contest-announcement-list', params: {contestID: contestID}}">
            <Icon type="chatbubble-working"></Icon>
            {{$t('m.Announcements')}}
          </VerticalMenu-item>
        </template>

        <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission" :route="submissionRoute">
          <Icon type="navicon-round"></Icon>
           {{$t('m.Submissions')}}
        </VerticalMenu-item>

        <template v-if="this.contestID">
          <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission"
                             :route="{name: 'contest-rank', params: {contestID: contestID}}">
            <Icon type="stats-bars"></Icon>
            {{$t('m.Rankings')}}
          </VerticalMenu-item>
          <VerticalMenu-item :route="{name: 'contest-details', params: {contestID: contestID}}">
            <Icon type="home"></Icon>
            {{$t('m.View_Contest')}}
          </VerticalMenu-item>
        </template>
      </VerticalMenu>
<!--      显示题目信息-->
      <Card id="info">
        <div slot="title" class="header">
          <Icon type="information-circled"></Icon>
          <span class="card-title">{{$t('m.Information')}}</span>
        </div>
        <ul>
<!--          题目id-->
          <li><p>ID</p>
            <p>{{problem.problemDisplayId}}</p>
          </li>
<!--          题目时间限制-->
          <li>
            <p>{{$t('m.Time_Limit')}}</p>
            <p>{{problem.problemTimeLimit}}MS</p>
          </li>
<!--          题目内存限制-->
          <li>
            <p>{{$t('m.Memory_Limit')}}</p>
            <p>{{problem.problemMemoryLimit}}MB</p>
          </li>
<!--          出题人-->
          <li>
            <p>{{$t('m.Created')}}</p>
            <p>{{problem.problemAuthor}}</p>
          </li>
<!--          题目难度-->
          <li v-if="problem.problemDifficulty">
            <p>{{$t('m.Level')}}</p>
            <p>{{$t('m.' + problem.problemDifficulty)}}</p>
          </li>
<!--          题目总分-->
          <li v-if="problem.problemTotalScore">
            <p>{{$t('m.Score')}}</p>
            <p>{{problem.problemTotalScore}}</p>
          </li>
<!--          题目标签-->
          <li>
            <p>{{$t('m.Tags')}}</p>
            <p>
              <Poptip trigger="hover" placement="left-end">
                <a>{{$t('m.Show')}}</a>
                <div slot="content">
                  <Tag v-for="tag in problem.tags" :key="tag">{{tag.tagName}}</Tag>
                </div>
              </Poptip>
            </p>
          </li>
        </ul>
      </Card>
<!--      显示统计信息-->
      <Card id="pieChart" :padding="0" v-if="!this.contestID || OIContestRealTimePermission">
        <div slot="title">
          <Icon type="ios-analytics"></Icon>
          <span class="card-title">{{$t('m.Statistic')}}</span>
          <Button type="ghost" size="small" id="detail" @click="graphVisible = !graphVisible">Details</Button>
        </div>
        <div class="echarts">
          <ECharts :options="pie"></ECharts>
        </div>
      </Card>
    </div>
<!--    显示大图统计信息-->
    <Modal v-model="graphVisible">
      <div id="pieChart-detail">
        <ECharts :options="largePie" :initOptions="largePieInitOpts"></ECharts>
      </div>
      <div slot="footer">
        <Button type="ghost" @click="graphVisible=false">{{$t('m.Close')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import {types} from '../../../../store'
  import CodeMirror from '@oj/components/CodeMirror.vue'
  import storage from '@/utils/storage'
  import {FormMixin} from '@oj/components/mixins'
  import {JUDGE_STATUS, CONTEST_STATUS, buildProblemCodeKey} from '@/utils/constants'
  import api from '@oj/api'
  import {pie, largePie} from './chartData'

  // 只显示这些状态的图形占用
  const filtedStatus = ['-1', '-2', '0', '1', '2', '3', '4', '8']

  export default {
    name: 'Problem',
    components: {
      CodeMirror
    },
    mixins: [FormMixin],
    data () {
      return {
        statusVisible: false, // 状态信息是否可见
        graphVisible: false, // 大图统计是否可见
        submissionExists: false, // 提交是否存在
        contestID: '',
        problemID: '',
        submitting: false, // 正在提交
        code: '',
        language: 'C++',
        theme: 'solarized',
        submissionId: '',
        submitted: false, // 已提交
        result: {
          submissionStatus: 9
        },
        problem: {
          problemId: '', // 题目id
          problemTitle: '', // 题目名称
          problemDescription: '', // 题目描述
          problemInputFormation: '', // 题目输入格式
          problemOutputFormation: '', // 题目输出格式
          problemReminder: null,  // 题目提示
          problemSource: null,  // 题目来源
          problemTimeLimit: '', // 题目时间限制
          problemMemoryLimit: '', // 题目内存限制
          problemAuthor: '',  // 题目出题人
          problemDifficulty: null, // 题目难度
          problemTotalScore: null,  // 题目总分
          myStatus: '',
          samples: [],  // 题目样例
          languages: [],  // 编程语言
          tags: []  // 标签
        },
        pie: pie,
        largePie: largePie,
        // echarts 无法获取隐藏dom的大小，需手动指定
        largePieInitOpts: {
          width: '500',
          height: '480'
        }
      }
    },
    // 路由进入前做的事情
    beforeRouteEnter (to, from, next) {
      // 根据问题id和竞赛id查找代码
      let problemCode = storage.get(buildProblemCodeKey(to.params.problemID, to.params.contestID))
      if (problemCode) {
        next(vm => {
          vm.language = problemCode.language
          vm.code = problemCode.code
          vm.theme = problemCode.theme
        })
      } else {
        next()
      }
    },
    mounted () {
      this.$store.commit(types.CHANGE_CONTEST_ITEM_VISIBLE, {menu: false})
      this.init()
    },
    methods: {
      ...mapActions(['changeDomTitle']),
      init () {
        this.$Loading.start()
        // 设置竞赛id
        this.contestID = this.$route.params.contestID
        // 设置题目id
        this.problemID = this.$route.params.problemID
        // 如果不是竞赛，则设置函数为getProblem，否则设置为getContestProblem
        let func = this.$route.name === 'problem-details' ? 'getProblem' : 'getContestProblem'
        api[func](this.problemID, this.contestID).then(res => {
          this.$Loading.finish()
          // 设置problem
          let problem = res.data.data
          this.changeDomTitle({title: problem.problemTitle})
          // 设置题目语言
          problem.languages = problem.languages.sort()
          this.problem = problem
          // 设置题目的统计信息
          this.changePie(problem)
          // 加载code模板
          if (this.code !== '') {
            return
          }
          this.language = this.problem.languages[0]
          this.code = ''
        }, () => {
          this.$Loading.error()
        })
      },
      // 设置题目统计信息
      changePie (problemData) {
        // 只显示特定的一些状态
        // 猜测statistic_info是map对象
        for (let k in problemData.statistic_info) {
          if (filtedStatus.indexOf(k) === -1) {
            delete problemData.statistic_info[k]
          }
        }
        // 设置 acnumber
        let acNum = problemData.solvedNumber
        let data = [
          {name: 'WA', value: problemData.submitNumber - acNum},
          {name: 'AC', value: acNum}
        ]
        // 设置饼状图的数据信息
        this.pie.series[0].data = data
        // 只把大图的AC selected下，这里需要做一下deepcopy
        let data2 = JSON.parse(JSON.stringify(data))
        data2[1].selected = true
        this.largePie.series[1].data = data2

        // 根据结果设置legend,没有提交过的legend不显示
        let legend = Object.keys(problemData.statistic_info).map(ele => JUDGE_STATUS[ele].short)
        if (legend.length === 0) {
          legend.push('AC', 'WA')
        }
        this.largePie.legend.data = legend

        // 把ac的数据提取出来放在最后
        let acCount = problemData.statistic_info['0']
        delete problemData.statistic_info['0']

        let largePieData = []
        Object.keys(problemData.statistic_info).forEach(ele => {
          largePieData.push({name: JUDGE_STATUS[ele].short, value: problemData.statistic_info[ele]})
        })
        largePieData.push({name: 'AC', value: acCount})
        this.largePie.series[0].data = largePieData
      },
      // 处理路由函数
      handleRoute (route) {
        this.$router.push(route)
      },
      // 改变编程语言函数
      onChangeLang (newLang) {
        this.language = newLang
      },
      // 改变主题函数
      onChangeTheme (newTheme) {
        this.theme = newTheme
      },
      // 重置代码
      onResetToTemplate () {
        this.$Modal.confirm({
          content: this.$i18n.t('m.Are_you_sure_you_want_to_reset_your_code'),
          onOk: () => {
            this.code = ''
          }
        })
      },
      // 检查提交状态
      checkSubmissionStatus () {
        // 使用setTimeout避免一些问题
        if (this.refreshStatus) {
          // 如果之前的提交状态检查还没有停止,则停止,否则将会失去timeout的引用造成无限请求
          clearTimeout(this.refreshStatus)
        }
        const checkStatus = () => {
          // 获取submissionId
          let id = this.submissionId
          // 根据id查找
          api.getSubmission(id).then(res => {
            // 返回的是一个submission对象
            this.result = res.data.data
            if (this.result != null && this.result.submissionStatus !== 9) {
              this.submitting = false
              this.submitted = false
              clearTimeout(this.refreshStatus)
              this.init()
            } else {
              this.refreshStatus = setTimeout(checkStatus, 2000)
            }
          }, res => {
            this.submitting = false
            clearTimeout(this.refreshStatus)
          })
        }
        this.refreshStatus = setTimeout(checkStatus, 2000)
      },
      // 提交代码
      submitCode () {
        if (this.code.trim() === '') {
          this.$error(this.$i18n.t('m.Code_can_not_be_empty'))
          return
        }
        this.submissionId = ''
        this.result = {submissionStatus: 9}
        // 正在提交
        this.submitting = true
        let data = {
          problem_id: this.problem.problemDisplayId,
          language: this.language,
          code: this.code,
          contest_id: this.contestID
        }
        const submitFunc = (data, detailsVisible) => {
          this.statusVisible = true
          api.submitCode(data).then(res => {
            this.submissionId = res.data.data
            // 定时检查状态
            this.submitting = false
            this.submissionExists = true
            if (!detailsVisible) {
              this.$Modal.success({
                title: this.$i18n.t('m.Success'),
                content: this.$i18n.t('m.Submit_code_successfully')
              })
              return
            }
            this.submitted = true
            this.checkSubmissionStatus()
          }, res => {
            this.submitting = false
            this.statusVisible = false
          })
        }
        // 如果是OI模式，并且没有榜单权限
        if (this.contestRuleType === 'OI' && !this.OIContestRealTimePermission) {
          if (this.submissionExists) {
            this.$Modal.confirm({
              title: '',
              content: '<h3>' + this.$i18n.t('m.You_have_submission_in_this_problem_sure_to_cover_it') + '<h3>',
              onOk: () => {
                // 暂时解决对话框与后面提示对话框冲突的问题(否则一闪而过）
                setTimeout(() => {
                  submitFunc(data, false)
                }, 1000)
              },
              onCancel: () => {
                this.submitting = false
              }
            })
          } else {
            submitFunc(data, false)
          }
        } else {
          submitFunc(data, true)
        }
      },
      // 复制代码
      onCopy (event) {
        this.$success('Code copied')
      },
      // 复制代码失败
      onCopyError (e) {
        this.$error('Failed to copy code')
      }
    },
    computed: {
      ...mapGetters(['problemSubmitDisabled', 'contestRuleType', 'OIContestRealTimePermission', 'contestStatus']),
      contest () {
        return this.$store.state.contest.contest
      },
      // 判断竞赛是否结束
      contestEnded () {
        return this.contestStatus === CONTEST_STATUS.ENDED
      },
      // 根据状态常量渲染状态
      submissionStatus () {
        return {
          text: JUDGE_STATUS[this.result.submissionStatus]['name'],
          color: JUDGE_STATUS[this.result.submissionStatus]['color']
        }
      },
      // 跳转提交信息（右侧）
      submissionRoute () {
        if (this.contestID) {
          return {name: 'contest-submission-list', query: {problemID: this.problemID}}
        } else {
          return {name: 'submission-list', query: {problemID: this.problemID}}
        }
      }
    },
    // 在路由离开前做的一些处理
    beforeRouteLeave (to, from, next) {
      // 防止切换组件后仍然不断请求
      clearInterval(this.refreshStatus)
      this.$store.commit(types.CHANGE_CONTEST_ITEM_VISIBLE, {menu: true})
      storage.set(buildProblemCodeKey(this.problem.problemId, from.params.contestID), {
        code: this.code,
        language: this.language,
        theme: this.theme
      })
      next()
    },
    watch: {
      '$route' () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
  .card-title {
    margin-left: 8px;
  }

  .flex-container {
    #problem-main {
      flex: auto;
      margin-right: 18px;
    }
    #right-column {
      flex: none;
      width: 220px;
    }
  }

  #problem-content {
    margin-top: -50px;
    .title {
      font-size: 20px;
      font-weight: 400;
      margin: 25px 0 8px 0;
      color: #3091f2;
      .copy {
        padding-left: 8px;
      }
    }
    p.content {
      margin-left: 25px;
      margin-right: 20px;
      font-size: 15px
    }
    .sample {
      align-items: stretch;
      &-input, &-output {
        width: 50%;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        margin-right: 5%;
      }
      pre {
        flex: 1 1 auto;
        align-self: stretch;
        border-style: solid;
        background: transparent;
      }
    }
  }

  #submit-code {
    margin-top: 20px;
    margin-bottom: 20px;
    .status {
      float: left;
      span {
        margin-right: 10px;
        margin-left: 10px;
      }
    }
    .captcha-container {
      display: inline-block;
      .captcha-code {
        width: auto;
        margin-top: -20px;
        margin-left: 20px;
      }
    }
  }

  #info {
    margin-bottom: 20px;
    margin-top: 20px;
    ul {
      list-style-type: none;
      li {
        border-bottom: 1px dotted #e9eaec;
        margin-bottom: 10px;
        p {
          display: inline-block;
        }
        p:first-child {
          width: 90px;
        }
        p:last-child {
          float: right;
        }
      }
    }
  }

  .fl-right {
    float: right;
  }

  #pieChart {
    .echarts {
      height: 250px;
      width: 210px;
    }
    #detail {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }

  #pieChart-detail {
    margin-top: 20px;
    width: 500px;
    height: 480px;
  }
</style>

