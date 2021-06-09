<template>
  <div>
    <Form ref="formLogin" :model="formLogin" :rules="ruleLogin">
<!--      用户名-->
      <FormItem prop="username">
        <Input type="text" v-model="formLogin.username" :placeholder="$t('m.LoginUsername')" size="large" @on-enter="handleLogin">
        <Icon type="ios-person-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
<!--      密码-->
      <FormItem prop="password">
        <Input type="password" v-model="formLogin.password" :placeholder="$t('m.LoginPassword')" size="large" @on-enter="handleLogin">
        <Icon type="ios-locked-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
    </Form>
    <div class="footer">
<!--      登录按钮-->
      <Button
        type="primary"
        @click="handleLogin"
        class="btn" long
        :loading="btnLoginLoading">
        {{$t('m.UserLogin')}}
      </Button>
<!--      注册-->
      <a v-if="website.allowRegistry" @click.stop="handleBtnClick('register')">{{$t('m.No_Account')}}</a>
<!--      忘记密码-->
<!--      <a @click.stop="goResetPassword" style="float: right">{{$t('m.Forget_Password')}}</a>-->
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import api from '@oj/api'
  import { FormMixin } from '@oj/components/mixins'

  export default {
    mixins: [FormMixin],
    data () {
      return {
        btnLoginLoading: false,
        formLogin: {
          username: '',
          password: ''
        },
        // 用户名和密码的填写规则
        ruleLogin: {
          username: [
            {required: true, trigger: 'blur'}
          ],
          password: [
            {required: true, trigger: 'change', min: 6, max: 20}
          ]
        }
      }
    },
    methods: {
      ...mapActions(['changeModalStatus', 'getProfile', 'setToken']),
      // 处理按钮点击事件：登录或者注册
      handleBtnClick (mode) {
        this.changeModalStatus({
          mode,
          visible: true
        })
      },
      // 处理登录函数
      handleLogin () {
        this.validateForm('formLogin').then(valid => {
          this.btnLoginLoading = true
          let formData = Object.assign({}, this.formLogin)
          api.login(formData).then(res => {
            this.btnLoginLoading = false
            this.changeModalStatus({visible: false})
            // 设置token
            this.setToken(res.data.data)
            // 获取用户个人信息
            this.getProfile()
            this.$success(this.$i18n.t('m.Welcome_back'))
          }, _ => {
            this.btnLoginLoading = false
          })
        })
      }
      // 忘记密码
      // goResetPassword () {
      //   // 模态框消失
      //   this.changeModalStatus({visible: false})
      //   // 跳转到重置密码页面
      //   this.$router.push({name: 'apply-reset-password'})
      // }
    },
    computed: {
      ...mapGetters(['website', 'modalStatus']),
      visible: {
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

<style scoped lang="less">
  .footer {
    overflow: auto;
    margin-top: 20px;
    margin-bottom: -15px;
    text-align: left;
    .btn {
      margin: 0 0 15px 0;
      &:last-child {
        margin: 0;
      }
    }
  }
</style>
