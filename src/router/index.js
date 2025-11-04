import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import DialogTest from '@/components/DialogTest.vue'
import TableTest from '@/components/TableTest.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/dialog-test',
      name: 'DialogTest',
      component: DialogTest
    },
    {
      path: '/table-test',
      name: 'TableTest',
      component: TableTest
    }
  ]
})
