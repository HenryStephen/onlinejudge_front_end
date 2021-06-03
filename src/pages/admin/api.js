import Vue from 'vue'
import router from './router'
import axios from 'axios'
import utils from '@/utils/utils'
import storage from '@/utils/storage'

Vue.prototype.$http = axios
axios.defaults.baseURL = '/api'
// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'

export default {
  // 登录
  login (username, password) {
    return ajax('/user/login', 'post', {
      data: {
        username,
        password
      }
    })
  },
  // 退出
  logout () {
    return ajax('/user/logout', 'post')
  },
  // 获取个人信息
  getProfile () {
    return ajax('/userInfo/profile', 'get')
  },
  // 获取公告列表
  getAnnouncementList (pageNum, limit) {
    return ajax('/content/announcement/admin', 'get', {
      params: {
        pageNum,
        limit
      }
    })
  },
  // 删除公告
  deleteAnnouncement (id) {
    return ajax('/content/announcement/admin/' + id, 'delete')
  },
  // 修改公告
  updateAnnouncement (data) {
    return ajax('/content/announcement/admin', 'put', {
      data
    })
  },
  // 添加公告
  createAnnouncement (data) {
    return ajax('/content/announcement/admin', 'post', {
      data
    })
  },
  // 获取用户列表
  getUserList (offset, limit, keyword) {
    let params = {paging: true, offset, limit}
    if (keyword) {
      params.keyword = keyword
    }
    return ajax('admin/user', 'get', {
      params: params
    })
  },
  // 获取单个用户信息
  getUser (id) {
    return ajax('admin/user', 'get', {
      params: {
        id
      }
    })
  },
  // 编辑用户
  editUser (data) {
    return ajax('admin/user', 'put', {
      data
    })
  },
  deleteUsers (id) {
    return ajax('admin/user', 'delete', {
      params: {
        id
      }
    })
  },
  importUsers (users) {
    return ajax('admin/user', 'post', {
      data: {
        users
      }
    })
  },
  generateUser (data) {
    return ajax('admin/generate_user', 'post', {
      data
    })
  },
  // 获取所有的编程语言
  getLanguages () {
    return ajax('/judge/language/admin', 'get')
  },
  // 获取网站基本信息
  getWebsiteConfig () {
    return ajax('/content/website', 'get')
  },
  // 修改网站基本信息
  editWebsiteConfig (data) {
    return ajax('/content/website', 'put', {
      data
    })
  },
  getJudgeServer () {
    return ajax('admin/judge_server', 'get')
  },
  deleteJudgeServer (hostname) {
    return ajax('admin/judge_server', 'delete', {
      params: {
        hostname: hostname
      }
    })
  },
  updateJudgeServer (data) {
    return ajax('admin/judge_server', 'put', {
      data
    })
  },
  getInvalidTestCaseList () {
    return ajax('admin/prune_test_case', 'get')
  },
  pruneTestCase (id) {
    return ajax('admin/prune_test_case', 'delete', {
      params: {
        id
      }
    })
  },
  // 创建竞赛
  createContest (data) {
    return ajax('/contest/competition', 'post', {
      data
    })
  },
  // 获取具体竞赛
  getContest (id) {
    return ajax('/contest/competition/' + id, 'get')
  },
  // 修改竞赛
  editContest (data) {
    return ajax('/contest/competition', 'put', {
      data
    })
  },
  // 获取竞赛列表
  getContestList (offset, limit, keyword) {
    let params = {offset, limit}
    if (keyword) {
      params.keyword = keyword
    }
    params.isAdmin = true
    return ajax('/contest/competition', 'get', {
      params: params
    })
  },
  // 获取竞赛公告
  getContestAnnouncementList (contestID) {
    return ajax('/content/competition/' + contestID + '/announcement/admin', 'get')
  },
  // 创建竞赛公告
  createContestAnnouncement (data) {
    return ajax('/content/announcement/admin', 'post', {
      data
    })
  },
  // 删除竞赛公告
  deleteContestAnnouncement (id) {
    return ajax('/content/announcement/admin/' + id, 'delete')
  },
  // 修改竞赛公告
  updateContestAnnouncement (data) {
    return ajax('/content/announcement/admin', 'put', {
      data
    })
  },
  // 获取标签列表
  getProblemTagList (params) {
    return ajax('/content/tag', 'get', {
      params
    })
  },
  // 添加题目
  createProblem (data) {
    return ajax('/content/problem', 'post', {
      data
    })
  },
  // 修改题目
  editProblem (data) {
    return ajax('/content/problem', 'put', {
      data
    })
  },
  // 删除题目
  deleteProblem (id) {
    return ajax('admin/problem', 'delete', {
      params: {
        id
      }
    })
  },
  // 获取题目
  getProblem (competitionId, problemId) {
    return ajax('/content/problem/' + problemId, 'get')
  },
  // 获取题目列表
  getProblemList (params) {
    params = utils.filterEmptyValue(params)
    return ajax('/content/problem', 'get', {
      params
    })
  },
  // 获取竞赛题目列表
  getContestProblemList (params) {
    params = utils.filterEmptyValue(params)
    return ajax('/contest/competition/problem/admin', 'get', {
      params
    })
  },
  // 获取竞赛题目
  getContestProblem (competitionId, problemId) {
    return ajax('/competition/' + competitionId + '/' + problemId + '/admin', 'get')
  },
  // 创建竞赛题目
  createContestProblem (data) {
    return ajax('/content/problem', 'post', {
      data
    })
  },
  // 更新竞赛题目
  editContestProblem (data) {
    return ajax('/content/problem', 'put', {
      data
    })
  },
  // 删除竞赛题目
  deleteContestProblem (id) {
    return ajax('admin/contest/problem', 'delete', {
      params: {
        id
      }
    })
  },
  makeContestProblemPublic (data) {
    return ajax('admin/contest_problem/make_public', 'post', {
      data
    })
  },
  addProblemFromPublic (data) {
    return ajax('admin/contest/add_problem_from_public', 'post', {
      data
    })
  },
  getReleaseNotes () {
    return ajax('admin/versions', 'get')
  },
  getDashboardInfo () {
    return ajax('admin/dashboard_info', 'get')
  },
  getSessions () {
    return ajax('sessions', 'get')
  },
  exportProblems (data) {
    return ajax('export_problem', 'post', {
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
      if (res.data.code !== 20000) {
        Vue.prototype.$error(res.data.message)
        reject(res)
        // 若后端返回为登录，则为session失效，应退出当前登录用户
        if (res.data.data.startsWith('Please login')) {
          router.push({name: 'login'})
        }
      } else {
        resolve(res)
        if (method !== 'get') {
          Vue.prototype.$success('Succeeded')
        }
      }
    }, res => {
      // API请求异常，一般为Server error 或 network error
      reject(res)
      Vue.prototype.$error(res.data.data)
    })
  })
}
