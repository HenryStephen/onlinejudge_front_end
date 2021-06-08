import moment from 'moment'
import types from '../types'
import api from '@oj/api'
import { CONTEST_STATUS, USER_TYPE, CONTEST_TYPE } from '@/utils/constants'

const state = {
  now: moment(),
  // 是否准许进入
  access: false,
  rankLimit: 30,
  // 强制更新
  forceUpdate: false,
  contest: {
    competitionType: CONTEST_TYPE.PUBLIC
  },
  // 竞赛问题列表
  contestProblems: [],
  itemVisible: {
    menu: true,
    chart: true,
    realName: false
  }
}

const getters = {
  // contest 是否加载完成
  // contestLoaded: (state) => {
  //   return !!state.contest.contestStatus
  // },
  // 判断竞赛状态
  contestStatus: (state, getters) => {
    // if (!getters.contestLoaded) return null
    let startTime = moment(state.contest.competitionStartTime)
    let endTime = moment(state.contest.competitionEndTime)
    let now = state.now
    if (startTime > now) {
      return CONTEST_STATUS.NOT_START
    } else if (endTime < now) {
      return CONTEST_STATUS.ENDED
    } else {
      return CONTEST_STATUS.UNDERWAY
    }
  },
  // 竞赛规则
  contestRuleType: (state) => {
    return state.contest.competitionRuleType || null
  },
  // 是否为竞赛管理员(创建者或者超级管理员)
  isContestAdmin: (state, getters, _, rootGetters) => {
    return rootGetters.isAuthenticated &&
      (state.contest.competitionCreateUser === rootGetters.user.userId || rootGetters.profile.roleType === USER_TYPE.SUPER_ADMIN)
  },
  // 竞赛菜单禁用
  contestMenuDisabled: (state, getters) => {
    if (getters.isContestAdmin) return false
    if (state.contest.competitionType === CONTEST_TYPE.PUBLIC) {
      return getters.contestStatus === CONTEST_STATUS.NOT_START
    }
    return !state.access
  },
  // 榜单权限
  OIContestRealTimePermission: (state, getters, _, rootGetters) => {
    if (getters.contestRuleType === 'ACM' || getters.contestStatus === CONTEST_STATUS.ENDED) {
      return true
    }
    return state.contest.competitionRealTimeRank === true || getters.isContestAdmin
  },
  // 问题提交是否禁用
  problemSubmitDisabled: (state, getters, _, rootGetters) => {
    if (getters.contestStatus === CONTEST_STATUS.ENDED) {
      return true
    } else if (getters.contestStatus === CONTEST_STATUS.NOT_START) {
      return !getters.isContestAdmin
    }
    return !rootGetters.isAuthenticated
  },
  // 密码框是否显示
  passwordFormVisible: (state, getters) => {
    return state.contest.competitionType !== CONTEST_TYPE.PUBLIC && !state.access && !getters.isContestAdmin
  },
  // 竞赛开始时间
  contestStartTime: (state) => {
    return moment(state.contest.competitionStartTime)
  },
  // 竞赛结束时间
  contestEndTime: (state) => {
    return moment(state.contest.competitionEndTime)
  },
  // 倒计时
  countdown: (state, getters) => {
    if (getters.contestStatus === CONTEST_STATUS.NOT_START) {
      let duration = moment.duration(getters.contestStartTime.diff(state.now, 'seconds'), 'seconds')
      // time is too long
      if (duration.weeks() > 0) {
        return 'Start At ' + duration.humanize()
      }
      let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
      return '-' + texts.join(':')
    } else if (getters.contestStatus === CONTEST_STATUS.UNDERWAY) {
      let duration = moment.duration(getters.contestEndTime.diff(state.now, 'seconds'), 'seconds')
      let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
      return '-' + texts.join(':')
    } else {
      return 'Ended'
    }
  }
}

const mutations = {
  // 修改竞赛
  [types.CHANGE_CONTEST] (state, payload) {
    state.contest = payload.contest
  },
  // 修改竞赛项是否可见
  [types.CHANGE_CONTEST_ITEM_VISIBLE] (state, payload) {
    state.itemVisible = {...state.itemVisible, ...payload}
  },
  // 强制刷新榜单
  [types.CHANGE_RANK_FORCE_UPDATE] (state, payload) {
    state.forceUpdate = payload.value
  },
  // 修改竞赛题目
  [types.CHANGE_CONTEST_PROBLEMS] (state, payload) {
    state.contestProblems = payload.contestProblems
  },
  // 修改榜单限制
  [types.CHANGE_CONTEST_RANK_LIMIT] (state, payload) {
    state.rankLimit = payload.rankLimit
  },
  // 修改竞赛是否可以进入
  [types.CONTEST_ACCESS] (state, payload) {
    state.access = payload.access
  },
  // 清除竞赛
  [types.CLEAR_CONTEST] (state) {
    state.contest = {competitionCreateUser: ''}
    state.contestProblems = []
    state.access = false
    state.itemVisible = {
      menu: true,
      chart: true,
      realName: false
    }
    state.forceUpdate = false
  },
  // 当前时间
  [types.NOW] (state, payload) {
    state.now = payload.now
  },
  // 当前时间加一秒
  [types.NOW_ADD_1S] (state) {
    state.now = moment(state.now.add(1, 's'))
  }
}

const actions = {
  // 获取竞赛信息
  getContest ({commit, rootState, dispatch}) {
    return new Promise((resolve, reject) => {
      api.getContest(rootState.route.params.contestID).then((res) => {
        resolve(res)
        let contest = res.data.data
        commit(types.CHANGE_CONTEST, {contest: contest})
        // 更新当前时间
        commit(types.NOW, {now: moment(contest.now)})
        // 如果竞赛是密码保护竞赛
        // if (contest.competitionType === CONTEST_TYPE.PRIVATE) {
        //   dispatch('getContestAccess')
        // }
      }, err => {
        reject(err)
      })
    })
  },
  // 获取竞赛问题列表
  getContestProblems ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getContestProblemList(rootState.route.params.contestID).then(res => {
        res.data.data.sort((a, b) => {
          if (a.problemDisplayId === b.problemDisplayId) {
            return 0
          } else if (a.problemDisplayId > b.problemDisplayId) {
            return 1
          }
          return -1
        })
        commit(types.CHANGE_CONTEST_PROBLEMS, {contestProblems: res.data.data})
        resolve(res)
      }, () => {
        commit(types.CHANGE_CONTEST_PROBLEMS, {contestProblems: []})
      })
    })
  },
  // 判断竞赛是否可以进入
  getContestAccess ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getContestAccess(rootState.route.params.contestID).then(res => {
        commit(types.CONTEST_ACCESS, {access: res.data.data.access})
        resolve(res)
      }).catch()
    })
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
