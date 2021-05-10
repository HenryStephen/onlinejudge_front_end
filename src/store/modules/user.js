import types from '../types'
import api from '@oj/api'
import storage from '@/utils/storage'
import i18n from '@/i18n'
import { STORAGE_KEY, USER_TYPE, PROBLEM_PERMISSION } from '@/utils/constants'

const state = {
  profile: {},
  token: null
}

const getters = {
  token: state => state.token || '',
  user: state => state.profile.userInfo || {},
  profile: state => state.profile,
  isAuthenticated: (state, getters) => {
    return !!getters.user.userId
  },
  isAdminRole: (state, getters) => {
    return getters.profile.roleType === USER_TYPE.ADMIN ||
      getters.profile.roleType === USER_TYPE.SUPER_ADMIN
  },
  isSuperAdmin: (state, getters) => {
    return getters.profile.roleType === USER_TYPE.SUPER_ADMIN
  },
  hasProblemPermission: (state, getters) => {
    return getters.profile.problemPermission !== PROBLEM_PERMISSION.NONE
  }
}

const mutations = {
  // 改变个人信息
  [types.CHANGE_PROFILE] (state, {profile}) {
    state.profile = profile
    if (profile.userInfo !== undefined) {
      if (profile.userInfo.userLanguage) {
        i18n.locale = profile.userInfo.userLanguage || 'en-US'
      }
      storage.set(STORAGE_KEY.AUTHED, !!profile.userInfo)
    } else {
      i18n.locale = 'en-US'
      storage.set(STORAGE_KEY.AUTHED, false)
    }
  },
  [types.CHANGE_TOKEN] (state, {token}) {
    state.token = token
    if (token === null) {
      if (storage.get('token') !== null || storage.get('token') !== undefined) {
        storage.remove('token')
      }
    }
    storage.set('token', token)
  }
}

const actions = {
  // 获取用户个人信息
  getProfile ({commit}) {
    api.getUserInfo().then(res => {
      commit(types.CHANGE_PROFILE, {
        profile: res.data.data || {}
      })
    })
  },
  // 设置token
  setToken ({commit}, payload) {
    commit(types.CHANGE_TOKEN, payload)
  },
  // 清空个人信息
  clearProfile ({commit}) {
    commit(types.CHANGE_PROFILE, {
      profile: {
        user: {
          language: 'en-US'
        }
      }
    })
    storage.clear()
  },
  // 清除token
  clearToken ({commit}) {
    commit(types.CHANGE_TOKEN, {
      token: null
    })
    storage.clear()
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
