<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu" class="oj-menu">
<!--      网站名字-->
      <div class="logo"><span>{{website.websiteName}}</span></div>
<!--      menu菜单-->
      <Menu-item name="/">
        <Icon type="home"></Icon>
        {{$t('m.Home')}}
      </Menu-item>
      <Menu-item name="/problem">
        <Icon type="ios-keypad"></Icon>
        {{$t('m.NavProblems')}}
      </Menu-item>
      <Menu-item name="/contest">
        <Icon type="trophy"></Icon>
        {{$t('m.Contests')}}
      </Menu-item>
      <Menu-item name="/status">
        <Icon type="ios-pulse-strong"></Icon>
        {{$t('m.NavStatus')}}
      </Menu-item>
      <Submenu name="rank">
        <template slot="title">
          <Icon type="podium"></Icon>
          {{$t('m.Rank')}}
        </template>
        <Menu-item name="/acm-rank">
          {{$t('m.ACM_Rank')}}
        </Menu-item>
<!--        <Menu-item name="/oi-rank">-->
<!--          {{$t('m.OI_Rank')}}-->
<!--        </Menu-item>-->
      </Submenu>
<!--      <Submenu name="about">-->
<!--        <template slot="title">-->
<!--          <Icon type="information-circled"></Icon>-->
<!--          {{$t('m.About')}}-->
<!--        </template>-->
<!--        <Menu-item name="/about">-->
<!--          {{$t('m.Judger')}}-->
<!--        </Menu-item>-->
<!--        <Menu-item name="/FAQ">-->
<!--          {{$t('m.FAQ')}}-->
<!--        </Menu-item>-->
<!--      </Submenu>-->
<!--      未登录-->
      <template v-if="!isAuthenticated">
        <div class="btn-menu">
<!--          登录按钮-->
          <Button type="ghost"
                  ref="loginBtn"
                  shape="circle"
                  @click="handleBtnClick('login')">{{$t('m.Login')}}
          </Button>
<!--          注册按钮-->
          <Button v-if="website.allowRegistry"
                  type="ghost"
                  shape="circle"
                  @click="handleBtnClick('register')"
                  style="margin-left: 5px;">{{$t('m.Register')}}
          </Button>
        </div>
      </template>
<!--      已登录或者已认证-->
      <template v-else>
        <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom" trigger="click">
<!--          显示用户名-->
          <Button type="text" class="drop-menu-title">{{ user.userName }}
            <Icon type="arrow-down-b"></Icon>
          </Button>
          <Dropdown-menu slot="list">
<!--            我的主页-->
            <Dropdown-item name="/user-home">{{$t('m.MyHome')}}</Dropdown-item>
<!--            我的提交-->
            <Dropdown-item name="/status?myself=1">{{$t('m.MySubmissions')}}</Dropdown-item>
<!--            设置-->
            <Dropdown-item name="/setting/profile">{{$t('m.Settings')}}</Dropdown-item>
<!--            如果是管理员时，后台管理-->
            <Dropdown-item v-if="isAdminRole" name="/admin">{{$t('m.Management')}}</Dropdown-item>
<!--            退出-->
            <Dropdown-item divided name="/logout">{{$t('m.Logout')}}</Dropdown-item>
          </Dropdown-menu>
        </Dropdown>
      </template>
    </Menu>
<!--    模态框：登录或者注册-->
    <Modal v-model="modalVisible" :width="400">
      <div slot="header" class="modal-title">{{$t('m.Welcome_to')}} {{website.websiteNameShortcut}}</div>
      <component :is="modalStatus.mode" v-if="modalVisible"></component>
      <div slot="footer" style="display: none"></div>
    </Modal>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import login from '@oj/views/user/Login'
  import register from '@oj/views/user/Register'

  export default {
    components: {
      login,
      register
    },
    mounted () {
      // 获取个人信息
      this.getProfile()
    },
    methods: {
      ...mapActions(['getProfile', 'changeModalStatus']),
      // 处理路由
      handleRoute (route) {
        if (route && route.indexOf('admin') < 0) {
          // 普通路由
          this.$router.push(route)
        } else {
          // 路由管理员
          window.open('/admin/')
        }
      },
      // 处理按钮点击事件
      handleBtnClick (mode) {
        // 改变模态框的状态：登录或者注册
        this.changeModalStatus({
          visible: true,
          mode: mode
        })
      }
    },
    computed: {
      ...mapGetters(['website', 'modalStatus', 'user', 'isAuthenticated', 'isAdminRole']),
      // 跟随路由变化
      activeMenu () {
        return '/' + this.$route.path.split('/')[1]
      },
      modalVisible: {
        get () {
          return this.modalStatus.visible
        },
        set (value) {
          this.changeModalStatus({visible: value})
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  #header {
    min-width: 300px;
    position: fixed;
    top: 0;
    left: 0;
    height: auto;
    width: 100%;
    z-index: 1000;
    background-color: #fff;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
    .oj-menu {
      background: #fdfdfd;
    }

    .logo {
      margin-left: 2%;
      margin-right: 2%;
      font-size: 20px;
      float: left;
      line-height: 60px;
    }

    .drop-menu {
      float: right;
      margin-right: 30px;
      position: absolute;
      right: 10px;
      &-title {
        font-size: 18px;
      }
    }
    .btn-menu {
      font-size: 16px;
      float: right;
      margin-right: 10px;
    }
  }

  .modal {
    &-title {
      font-size: 18px;
      font-weight: 600;
    }
  }
</style>
