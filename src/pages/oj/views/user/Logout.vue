<template>
</template>

<script>
  import api from '../../api.js'

  export default {
    mounted () {
      api.logout().then(res => {
        this.$store.dispatch('clearProfile').then(res => {
          this.$store.dispatch('clearToken').then(res => {
            this.$router.replace('/')
            window.location.reload()
          })
        })
      })
    }
  }
</script>
