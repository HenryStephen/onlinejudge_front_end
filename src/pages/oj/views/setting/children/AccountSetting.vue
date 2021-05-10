<template>
  <div class="setting-main">
    <div class="flex-container">
      <div class="left">
        <p class="section-title">{{$t('m.ChangePassword')}}</p>
<!--        与密码有关-->
        <Form class="setting-content" ref="formPassword" :model="formPassword" :rules="rulePassword">
          <FormItem label="Old Password" prop="oldPassword">
<!--            旧密码-->
            <Input v-model="formPassword.oldPassword" type="password"/>
          </FormItem>
<!--          新密码-->
          <FormItem label="New Password" prop="newPassword">
            <Input v-model="formPassword.newPassword" type="password"/>
          </FormItem>
<!--          确认密码-->
          <FormItem label="Confirm New Password" prop="againPassword">
            <Input v-model="formPassword.againPassword" type="password"/>
          </FormItem>
<!--          如果需要验证码-->
<!--          <FormItem v-if="visible.tfaRequired" label="Two Factor Auth" prop="tfa_code">-->
<!--            <Input v-model="formPassword.tfa_code"/>-->
<!--          </FormItem>-->
          <FormItem v-if="visible.passwordAlert">
            <Alert type="success">You will need to login again after 5 seconds..</Alert>
          </FormItem>
          <Button type="primary" @click="changePassword">{{$t('m.Update_Password')}}</Button>
        </Form>
      </div>

      <div class="middle separator"></div>

      <div class="right">
        <p class="section-title">{{$t('m.ChangeEmail')}}</p>
<!--        与邮箱有关-->
        <Form class="setting-content" ref="formEmail" :model="formEmail" :rules="ruleEmail">
<!--          当前密码-->
          <FormItem label="Current Password" prop="password">
            <Input v-model="formEmail.password" type="password"/>
          </FormItem>
<!--          旧邮箱-->
          <FormItem label="Old Email">
            <Input v-model="formEmail.oldEmail" disabled/>
          </FormItem>
<!--          新邮箱-->
          <FormItem label="New Email" prop="newEmail">
            <Input v-model="formEmail.newEmail"/>
          </FormItem>
<!--          验证码-->
<!--          <FormItem v-if="visible.tfaRequired" label="Two Factor Auth" prop="tfa_code">-->
<!--            <Input v-model="formEmail.tfa_code"/>-->
<!--          </FormItem>-->
          <Button type="primary" @click="changeEmail">{{$t('m.ChangeEmail')}}</Button>
        </Form>
      </div>
    </div>
  </div>
</template>

<script>
  import api from '@oj/api'
  import { FormMixin } from '@oj/components/mixins'

  export default {
    mixins: [FormMixin],
    data () {
      // 检查旧密码
      const oldPasswordCheck = [{required: true, trigger: 'blur', min: 6, max: 20}]
      // 验证码检测
      // const tfaCheck = [{required: true, trigger: 'change'}]
      // 检查确认密码
      const CheckAgainPassword = (rule, value, callback) => {
        if (value !== this.formPassword.newPassword) {
          callback(new Error('password does not match'))
        }
        callback()
      }
      // 检查新密码
      const CheckNewPassword = (rule, value, callback) => {
        if (this.formPassword.oldPassword !== '') {
          if (this.formPassword.oldPassword === this.formPassword.newPassword) {
            callback(new Error('The new password doesn\'t change'))
          } else {
            // 对第二个密码框再次验证
            this.$refs.formPassword.validateField('againPassword')
          }
        }
        callback()
      }
      return {
        loading: {
          btnPassword: false,
          btnEmail: false
        },
        visible: {
          passwordAlert: false,
          emailAlert: false,
          tfaRequired: false
        },
        // 密码有关
        formPassword: {
          // tfa_code: '',
          oldPassword: '',
          newPassword: '',
          againPassword: ''
        },
        // 邮箱有关
        formEmail: {
          // tfa_code: '',
          password: '',
          oldEmail: '',
          newEmail: ''
        },
        // 密码验证规则
        rulePassword: {
          oldPassword: oldPasswordCheck,
          newPassword: [
            {required: true, trigger: 'blur', min: 6, max: 20},
            {validator: CheckNewPassword, trigger: 'blur'}
          ],
          againPassword: [
            {required: true, validator: CheckAgainPassword, trigger: 'change'}
          ]
          // tfa_code: tfaCheck
        },
        // 邮箱验证规则
        ruleEmail: {
          password: oldPasswordCheck,
          newEmail: [{required: true, type: 'email', trigger: 'change'}]
          // tfa_code: tfaCheck
        }
      }
    },
    mounted () {
      this.formEmail.oldEmail = this.$store.getters.user.userEmail || ''
    },
    methods: {
      // 修改密码
      changePassword () {
        this.validateForm('formPassword').then(valid => {
          this.loading.btnPassword = true
          let data = Object.assign({}, this.formPassword)
          // 删除确认密码字段
          delete data.againPassword
          // if (!this.visible.tfaRequired) {
          //   delete data.tfa_code
          // }
          api.changePassword(data).then(res => {
            this.loading.btnPassword = false
            this.visible.passwordAlert = true
            this.$success('Update password successfully')
            // 如果修改成功,则5秒后注销用户
            setTimeout(() => {
              this.visible.passwordAlert = false
              this.$router.push({name: 'logout'})
            }, 3000)
          }, res => {
            // if (res.data.data === 'tfa_required') {
            //   this.visible.tfaRequired = true
            // }
            this.loading.btnPassword = false
          })
        })
      },
      // 修改邮箱
      changeEmail () {
        this.validateForm('formEmail').then(valid => {
          this.loading.btnEmail = true
          let data = Object.assign({}, this.formEmail)
          // if (!this.visible.tfaRequired) {
          //   delete data.tfa_code
          // }
          api.changeEmail(data).then(res => {
            this.loading.btnEmail = false
            this.visible.emailAlert = true
            this.$success('Change email successfully')
            this.$refs.formEmail.resetFields()
            // 如果修改成功,则5秒后注销用户
            setTimeout(() => {
              this.visible.emailAlert = false
              this.$router.push({name: 'logout'})
            }, 3000)
          }, res => {
            this.loading.btnEmail = false
            // if (res.data.data === 'tfa_required') {
            //   this.visible.tfaRequired = true
            // }
          })
        })
      }
    }
  }
</script>

<style lang="less" scoped>

  .flex-container {
    justify-content: flex-start;
    .left {
      flex: 1 0;
      width: 250px;
      padding-right: 5%;
    }
    > .middle {
      flex: none;
    }
    .right {
      flex: 1 0;
      width: 250px;
    }
  }
</style>

