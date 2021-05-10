<template>
  <div>
    <Panel>
      <div slot="title">{{$t('m.Problems_List')}}</div>
<!--      如果是acm竞赛或者具有查看榜单权限-->
      <Table v-if="contestRuleType == 'ACM' || OIContestRealTimePermission"
             :columns="ACMTableColumns"
             :data="problems"
             @on-row-click="goContestProblem"
             :no-data-text="$t('m.No_Problems')"></Table>
<!--      否则-->
      <Table v-else
             :data="problems"
             :columns="OITableColumns"
             @on-row-click="goContestProblem"
             no-data-text="$t('m.No_Problems')"></Table>
    </Panel>
  </div>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'
  import {ProblemMixin} from '@oj/components/mixins'

  export default {
    name: 'ContestProblemList',
    mixins: [ProblemMixin],
    data () {
      return {
        // acm比赛列
        ACMTableColumns: [
          {
            title: '#',
            key: 'problemDisplayId',
            sortType: 'asc',
            width: 150
          },
          {
            title: this.$i18n.t('m.Title'),
            key: 'problemTiltle'
          },
          {
            title: this.$i18n.t('m.Total'),
            key: 'submitNumber'
          },
          {
            title: this.$i18n.t('m.AC_Rate'),
            render: (h, params) => {
              return h('span', this.getACRate(params.row.solvedNumber, params.row.submitNumber))
            }
          }
        ],
        // oi比赛列
        OITableColumns: [
          {
            title: '#',
            key: 'problemDisplayId',
            width: 150
          },
          {
            title: this.$i18n.t('m.Title'),
            key: 'problemTiltle'
          }
        ]
      }
    },
    mounted () {
      // 获取竞赛题目列表
      this.getContestProblems()
    },
    methods: {
      // 获取竞赛题目列表
      getContestProblems () {
        this.$store.dispatch('getContestProblems').then(res => {
          if (this.isAuthenticated) {
            if (this.contestRuleType === 'ACM') {
              this.addStatusColumn(this.ACMTableColumns, res.data.data)
            } else if (this.OIContestRealTimePermission) {
              this.addStatusColumn(this.ACMTableColumns, res.data.data)
            }
          }
        })
      },
      // 跳转到竞赛题目页面
      goContestProblem (row) {
        this.$router.push({
          name: 'contest-problem-details',
          params: {
            contestID: this.$route.params.contestID,
            problemID: row.problemDisplayId
          }
        })
      }
    },
    computed: {
      ...mapState({
        problems: state => state.contest.contestProblems
      }),
      ...mapGetters(['isAuthenticated', 'contestRuleType', 'OIContestRealTimePermission'])
    }
  }
</script>

<style scoped lang="less">
</style>
