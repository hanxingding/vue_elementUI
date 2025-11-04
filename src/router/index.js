import Vue from 'vue'
import Router from 'vue-router'
import ExcelParser from '@/components/ExcelParser'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ExcelParser',
      component: ExcelParser
    }
  ]
})
