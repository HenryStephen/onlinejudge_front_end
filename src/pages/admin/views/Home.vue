<template>
  <div class="container">
<!--    显示左侧菜单-->
    <div>
      <SideMenu></SideMenu>
    </div>
<!--    上侧信息-->
    <div id="header">
<!--      公式编辑器-->
      <i class="el-icon-fa-font katex-editor" @click="katexVisible=true" ></i>
<!--      全屏-->
      <screen-full :width="14" :height="14" class="screen-full"></screen-full>
<!--      管理员控制台-->
      <el-dropdown @command="handleCommand">
<!--        用户名-->
        <span>{{user.userName}}<i class="el-icon-caret-bottom el-icon--right"></i></span>
        <el-dropdown-menu slot="dropdown">
<!--          注销-->
          <el-dropdown-item command="logout">Logout</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
<!--    内容信息-->
    <div class="content-app">
      <transition name="fadeInUp" mode="out-in">
        <router-view></router-view>
      </transition>
      <div class="footer">
        Build Version: {{ version }}
      </div>
    </div>
<!--    弹出框-->
    <el-dialog :title="$t('m.Latex_Editor')" :visible.sync="katexVisible">
      <KatexEditor></KatexEditor>
    </el-dialog>
  </div>
</template>

<script>
  import { types } from '@/store'
  import { mapGetters } from 'vuex'
  import SideMenu from '../components/SideMenu.vue'
  import ScreenFull from '@admin/components/ScreenFull.vue'
  import KatexEditor from '@admin/components/KatexEditor.vue'
  import api from '../api'

  export default {
    name: 'app',
    data () {
      return {
        version: process.env.VERSION,
        katexVisible: false
      }
    },
    components: {
      SideMenu,
      KatexEditor,
      ScreenFull
    },
    // 在路由进去之前
    beforeRouteEnter (to, from, next) {
    // 首先获取个人信息
      api.getProfile().then(res => {
        if (!res.data.data) {
          // not login
          next({name: 'login'})
        } else {
          next(vm => {
            vm.$store.commit(types.CHANGE_PROFILE, {profile: res.data.data})
          })
        }
      })
    },
    methods: {
    // 处理命令的函数
      handleCommand (command) {
        if (command === 'logout') {
          api.logout().then(res => {
            this.$store.dispatch('clearProfile').then(res => {
              this.$store.dispatch('clearToken').then(res => {
                this.$router.push({name: 'login'})
              })
            })
          })
        }
      }
    },
    computed: {
      ...mapGetters(['user'])
    }
  }
</script>

<style lang="less">
  a {
    background-color: transparent;
  }

  a:active, a:hover {
    outline-width: 0
  }

  img {
    border-style: none
  }

  .container {
    overflow: auto;
    font-weight: 400;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    background-color: #EDECEC;
    overflow-y: scroll;
    min-width: 1000px;
  }

  * {
    box-sizing: border-box;
  }

  #header {
    text-align: right;
    padding-left: 210px;
    padding-right: 30px;
    line-height: 50px;
    height: 50px;
    background: #F9FAFC;
    .screen-full {
      margin-right: 8px;
    }
  }

  .content-app {
    padding-top: 20px;
    padding-right: 10px;
    padding-left: 210px;
  }

  .footer {
    margin: 15px;
    text-align: center;
    font-size: small;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(0, 30px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  .fadeInUp-enter-active {
    animation: fadeInUp .8s;
  }

  .katex-editor {
    margin-right: 5px;
    /*font-size: 18px;*/
  }



</style>
