<template>
  <Row type="flex">
    <Col :span="24">
    <Panel id="contest-card" shadow>
<!--      显示赛制-->
      <div slot="title">{{query.rule_type === '' ? this.$i18n.t('m.All') : query.rule_type}} {{$t('m.Contests')}}</div>
      <div slot="extra">
        <ul class="filter">
<!--          根据赛制查询-->
          <li>
            <Dropdown @on-click="onRuleChange">
              <span>{{query.rule_type === '' ? this.$i18n.t('m.Rule') : this.$i18n.t('m.' + query.rule_type)}}
                <Icon type="arrow-down-b"></Icon>
              </span>
              <Dropdown-menu slot="list">
                <Dropdown-item name="">{{$t('m.All')}}</Dropdown-item>
                <Dropdown-item name="OI">{{$t('m.OI')}}</Dropdown-item>
                <Dropdown-item name="ACM">{{$t('m.ACM')}}</Dropdown-item>
              </Dropdown-menu>
            </Dropdown>
          </li>
<!--          根据状态查询-->
          <li>
            <Dropdown @on-click="onStatusChange">
              <span>{{query.status === '' ? this.$i18n.t('m.Status') : this.$i18n.t('m.' + CONTEST_STATUS_REVERSE[query.status].name.replace(/ /g,"_"))}}
                <Icon type="arrow-down-b"></Icon>
              </span>
              <Dropdown-menu slot="list">
                <Dropdown-item name="">{{$t('m.All')}}</Dropdown-item>
                <Dropdown-item name="0">{{$t('m.Underway')}}</Dropdown-item>
                <Dropdown-item name="1">{{$t('m.Not_Started')}}</Dropdown-item>
                <Dropdown-item name="-1">{{$t('m.Ended')}}</Dropdown-item>
              </Dropdown-menu>
            </Dropdown>
          </li>
<!--          根据关键字查询-->
          <li>
            <Input id="keyword" @on-enter="changeRoute" @on-click="changeRoute" v-model="query.keyword"
                   icon="ios-search-strong" placeholder="Keyword"/>
          </li>
        </ul>
      </div>
<!--      如果没有竞赛-->
      <p id="no-contest" v-if="contests.length == 0">{{$t('m.No_contest')}}</p>
<!--      显示竞赛列表-->
      <ol id="contest-list">
        <li v-for="contest in contests" :key="contest.competitionTitle">
          <Row type="flex" justify="space-between" align="middle">
<!--            图标-->
            <img class="trophy" src="../../../../assets/Cup.png"/>
            <Col :span="18" class="contest-main">
              <p class="title">
                <!-- 显示竞赛名称-->
                <a class="entry" @click.stop="goContest(contest)">
                  {{contest.competitionTitle}}
                </a>
<!--                如果竞赛不是开放状态,则显示锁子-->
                <template v-if="contest.competitionType != 'Public'">
                  <Icon type="ios-locked-outline" size="20"></Icon>
                </template>
              </p>
              <ul class="detail">
<!--                开始时间-->
                <li>
                  <Icon type="calendar" color="#3091f2"></Icon>
                  {{contest.competitionStartTime | localtime('YYYY-M-D HH:mm') }}
                </li>
<!--                通过开始时间和结束时间计算时常-->
                <li>
                  <Icon type="android-time" color="#3091f2"></Icon>
                  {{getDuration(contest.competitionStartTime, contest.competitionEndTime)}}
                </li>
<!--                赛制-->
                <li>
                  <Button size="small" shape="circle" @click="onRuleChange(contest.competitionRuleType)">
                    {{contest.competitionRuleType}}
                  </Button>
                </li>
              </ul>
            </Col>
<!--            显示比赛的状态信息-->
            <Col :span="4" style="text-align: center">
              <Tag type="dot" :color="CONTEST_STATUS_REVERSE[contest.competitionStatus].color">{{$t('m.' + CONTEST_STATUS_REVERSE[contest.competitionStatus].name.replace(/ /g, "_"))}}</Tag>
            </Col>
          </Row>
        </li>
      </ol>
    </Panel>
<!--      分页列表-->
    <Pagination :total="total" :page-size.sync="limit" @on-change="changeRoute" :current.sync="page" :show-sizer="true" @on-page-size-change="changeRoute"></Pagination>
    </Col>
  </Row>

</template>

<script>
  import api from '@oj/api'
  import { mapGetters } from 'vuex'
  import utils from '@/utils/utils'
  import Pagination from '@/pages/oj/components/Pagination'
  import time from '@/utils/time'
  import { CONTEST_STATUS_REVERSE, CONTEST_TYPE } from '@/utils/constants'

  const limit = 10

  export default {
    name: 'contest-list',
    components: {
      Pagination
    },
    data () {
      return {
        page: 1,
        // 查询参数
        query: {
          status: '',
          keyword: '',
          rule_type: '',
          page: 1
        },
        limit: limit,
        total: 0,
        rows: '',
        // 竞赛列表
        contests: [],
        // 用来显示竞赛的状态信息
        CONTEST_STATUS_REVERSE: CONTEST_STATUS_REVERSE,
//      for password modal use
//         当前竞赛id
        cur_contest_id: ''
      }
    },
    // 路由进入前
    beforeRouteEnter (to, from, next) {
      // 查询竞赛列表
      api.getContestList(0, limit).then((res) => {
        next((vm) => {
          vm.contests = res.data.data.results
          vm.total = res.data.data.total
        })
      }, (res) => {
        next()
      })
    },
    methods: {
      init () {
        let route = this.$route.query
        this.query.status = route.status || ''
        this.query.rule_type = route.rule_type || ''
        this.query.keyword = route.keyword || ''
        this.page = parseInt(route.page) || 1
        this.limit = parseInt(route.limit) || 10
        this.query.page = this.page
        // 获取竞赛列表
        this.getContestList(this.page)
      },
      // 获取竞赛列表
      getContestList (page = 1) {
        let offset = (page - 1) * this.limit
        api.getContestList(offset, this.limit, this.query).then((res) => {
          this.contests = res.data.data.results
          this.total = res.data.data.total
        })
      },
      // 改变路由
      changeRoute () {
        let query = Object.assign({}, this.query)
        query.page = this.page
        query.limit = this.limit

        this.$router.push({
          name: 'contest-list',
          query: utils.filterEmptyValue(query)
        })
      },
      // 根据赛制规则查询
      onRuleChange (rule) {
        this.query.rule_type = rule
        this.page = 1
        this.changeRoute()
      },
      // 根据状态信息查询
      onStatusChange (status) {
        this.query.status = status
        this.page = 1
        this.changeRoute()
      },
      // 跳转到竞赛详情中
      goContest (contest) {
        this.cur_contest_id = contest.competitionId
        if (contest.competitionType !== CONTEST_TYPE.PUBLIC && !this.isAuthenticated) {
          this.$error(this.$i18n.t('m.Please_login_first'))
          this.$store.dispatch('changeModalStatus', {visible: true})
        } else {
          this.$router.push({name: 'contest-details', params: {contestID: contest.competitionId}})
        }
      },
      // 获取比赛时长
      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user'])
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      }
    }

  }
</script>
<style lang="less" scoped>
  #contest-card {
    #keyword {
      width: 80%;
      margin-right: 30px;
    }
    #no-contest {
      text-align: center;
      font-size: 16px;
      padding: 20px;
    }
    #contest-list {
      > li {
        padding: 20px;
        border-bottom: 1px solid rgba(187, 187, 187, 0.5);
        list-style: none;

        .trophy {
          height: 40px;
          margin-left: 10px;
          margin-right: -20px;
        }
        .contest-main {
          .title {
            font-size: 18px;
            a.entry {
              color: #495060;
              &:hover {
                color: #2d8cf0;
                border-bottom: 1px solid #2d8cf0;
              }
            }
          }
          li {
            display: inline-block;
            padding: 10px 0 0 10px;
            &:first-child {
              padding: 10px 0 0 0;
            }
          }
        }
      }
    }
  }
</style>
