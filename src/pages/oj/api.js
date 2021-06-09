import Vue from 'vue'
import axios from 'axios'
import storage from '@/utils/storage'

Vue.prototype.$http = axios
axios.defaults.baseURL = '/api'

export default {
  // 获取网站信息
  getWebsiteConf (params) {
    return ajax('/content/website', 'get', {
      params
    })
  },
  // 获取公共公告分页列表
  getAnnouncementList (pageNum, limit) {
    let params = {
      pageNum: pageNum, // 第几页
      limit: limit // 页面大小
    }
    return ajax('/content/announcement', 'get', {
      params
    })
  },
  // 登录
  login (data) {
    return ajax('/user/login', 'post', {
      data
    })
  },
  checkUsernameOrEmail (username, email) {
    return ajax('/user/checkUsernameOrEmail', 'post', {
      data: {
        username,
        email
      }
    })
  },
  // 注册
  register (data) {
    return ajax('/user/register', 'post', {
      data
    })
  },
  // 注销
  logout () {
    return ajax('/user/logout', 'post')
  },
  // 获取验证码
  getCaptcha () {
    return ajax('captcha', 'get')
  },
  // 获取用户信息
  getUserInfo (username = undefined) {
    return ajax('/userInfo/profile', 'get', {
      params: {
        username
      }
    })
  },
  // 更新用户信息
  updateProfile (profile) {
    return ajax('/userInfo/profile', 'put', {
      data: profile
    })
  },
  // 获取用户已经解决问题的列表
  getUserSolvedProblem (username = undefined) {
    return ajax('/statistic/userProblem', 'get', {
      params: {
        username
      }
    })
  },
  // 刷新已经解决的问题列表
  // 没有使用
  freshDisplayID (userID) {
    return ajax('profile/fresh_display_id', 'get', {
      params: {
        user_id: userID
      }
    })
  },
  twoFactorAuth (method, data) {
    return ajax('two_factor_auth', method, {
      data
    })
  },
  // 判断是否需要验证码
  tfaRequiredCheck (username) {
    return ajax('tfa_required', 'post', {
      data: {
        username
      }
    })
  },
  getSessions () {
    return ajax('sessions', 'get')
  },
  deleteSession (sessionKey) {
    return ajax('sessions', 'delete', {
      params: {
        session_key: sessionKey
      }
    })
  },
  applyResetPassword (data) {
    return ajax('apply_reset_password', 'post', {
      data
    })
  },
  resetPassword (data) {
    return ajax('reset_password', 'post', {
      data
    })
  },
  // 修改密码
  changePassword (data) {
    return ajax('/userInfo/account/password', 'put', {
      data
    })
  },
  // 修改邮箱
  changeEmail (data) {
    return ajax('/userInfo/account/email', 'put', {
      data
    })
  },
  // 获取语言列表
  getLanguages () {
    return ajax('/judge/language', 'get')
  },
  // 获取标签列表
  getProblemTagList () {
    return ajax('/content/tag', 'get')
  },
  // 获取题目列表
  getProblemList (offset, limit, searchParams) {
    let params = {
      paging: true,
      offset,
      limit
    }
    // 将查询参数添加到参数中
    Object.keys(searchParams).forEach((element) => {
      if (searchParams[element]) {
        params[element] = searchParams[element]
      }
    })
    return ajax('/content/problem', 'get', {
      params: params
    })
  },
  // 随机选择一个标签里面的题目
  pickone () {
    return ajax('pickone', 'get')
  },
  // 根据题目id获取题目信息
  getProblem (problemID) { // 代表展示id
    return ajax('/content/problem/' + problemID, 'get')
  },
  // 获取竞赛列表
  getContestList (offset, limit, searchParams) {
    let params = {
      offset,
      limit
    }
    params.isAdmin = false
    if (searchParams !== undefined) {
      Object.keys(searchParams).forEach((element) => {
        if (searchParams[element]) {
          params[element] = searchParams[element]
        }
      })
    }
    return ajax('/contest/competition', 'get', {
      params
    })
  },
  // 获取指定竞赛
  getContest (id) {
    return ajax('/contest/competition/' + id, 'get')
  },
  getContestAccess (contestID) {
    return ajax('contest/access', 'get', {
      params: {
        contest_id: contestID
      }
    })
  },
  // 验证竞赛的密码
  checkContestPassword (contestID, password) {
    return ajax('/contest/competition/password', 'post', {
      data: {
        competitionId: contestID,
        password
      }
    })
  },
  // 获取竞赛公告列表
  getContestAnnouncementList (contestId) {
    return ajax('/content/competition/' + contestId + '/announcement', 'get')
  },
  // 获取竞赛题目列表
  getContestProblemList (contestId) {
    return ajax('/contest/competition/' + contestId + '/problem', 'get')
  },
  // 获取具体竞赛题目
  getContestProblem (problemID, contestID) {  // 代表展示id
    return ajax('/contest/competition/' + contestID + '/problem/' + problemID, 'get')
  },
  // 提交代码
  submitCode (data) {
    return ajax('/judge/submission', 'post', {
      data
    })
  },
  // 获取submission列表
  getSubmissionList (offset, limit, params) {
    params.limit = limit
    params.offset = offset
    return ajax('/judge/submission', 'get', {
      params
    })
  },
  getContestSubmissionList (offset, limit, params) {
    params.limit = limit
    params.offset = offset
    return ajax('/judge/submission', 'get', {
      params
    })
  },
  // 查看提交的状态
  getSubmission (submissionId) {
    return ajax('/judge/submission/' + submissionId, 'get')
  },
  submissionExists (problemID) {
    return ajax('submission_exists', 'get', {
      params: {
        problem_id: problemID
      }
    })
  },
  // 处理重新评测的函数
  submissionRejudge (id) {
    return ajax('admin/submission/rejudge', 'get', {
      params: {
        id
      }
    })
  },
  updateSubmission (data) {
    return ajax('submission', 'put', {
      data
    })
  },
  getUserRank (pageNum, limit, rule = 'ACM') {
    let params = {
      pageNum,
      limit,
      rule
    }
    return ajax('/statistic/userRank', 'get', {
      params
    })
  },
  getContestRank (params) {
    return ajax('contest_rank', 'get', {
      params
    })
  },
  getACMACInfo (params) {
    return ajax('admin/contest/acm_helper', 'get', {
      params
    })
  },
  updateACInfoCheckedStatus (data) {
    return ajax('admin/contest/acm_helper', 'put', {
      data
    })
  }
}

/**
 * @param url
 * @param method get|post|put|delete...
 * @param params like queryString. if a url is index?a=1&b=2, params = {a: '1', b: '2'}
 * @param data post data, use for method put|post
 * @returns {Promise}
 */
function ajax (url, method, options) {
  if (options !== undefined) {
    var {params = {}, data = {}} = options
  } else {
    params = data = {}
  }
  let token = storage.get('token')
  if (token !== null && token !== undefined) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
  }
  return new Promise((resolve, reject) => {
    axios({
      url,
      method,
      params,
      data
    }).then(res => {
      // API正常返回(status=20x), 是否错误通过有无error判断
      if (res.data.code !== 20000) {
        Vue.prototype.$error(res.data.message)
        reject(res)
        // 若后端返回为登录，则为session失效，应退出当前登录用户
        // if (res.data.data.startsWith('Please login')) {
        //   store.dispatch('changeModalStatus', {'mode': 'login', 'visible': true})
        // }
      // token过期
      //   if (res.data.code === 50014) {
      //     store.dispatch('changeModalStatus', {'mode': 'login', 'visible': true})
      //   }
      } else {
        resolve(res)
      }
    }, res => {
      // API请求异常，一般为Server error 或 network error
      reject(res)
      Vue.prototype.$error(res.data)
    })
  })
}
