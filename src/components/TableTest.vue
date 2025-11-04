<template>
  <div class="table-test-container">
    <h1>AdvancedTable 组件测试</h1>
    
    <!-- 操作按钮 -->
    <div class="test-toolbar">
      <el-button type="primary" @click="refreshData">刷新数据</el-button>
      <el-button type="success" @click="addData">添加数据</el-button>
      <el-button type="warning" @click="toggleLoading">
        {{ loading ? '停止加载' : '开始加载' }}
      </el-button>
      <el-button type="danger" @click="clearSelection">清除选择</el-button>
      <el-button type="info" @click="toggleEmptyData">切换空数据</el-button>
      <el-button @click="showSelectedRows">查看选中</el-button>
    </div>
    
    <!-- 高级表格组件 -->
    <advanced-table
      ref="advancedTable"
      :table-data="tableData"
      :columns="columns"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :selection-type="'multiple'"
      :selection-selectable="row => row.status !== 'inactive'"
      :show-index="true"
      :border="true"
      :show-column-manager="true"
      :empty-config="emptyConfig"
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentPageChange"
      @size-change="handlePageSizeChange"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      @row-click="handleRowClick"
    >
      <!-- 自定义头像插槽 -->
      <template #avatar="{ row }">
        <el-popover placement="top" title="用户信息" width="200" trigger="hover">
          <p>姓名: {{ row.name }}</p>
          <p>角色: {{ row.role }}</p>
          <p>状态: {{ row.status }}</p>
          <div slot="reference">
            <el-image
              :src="row.avatar"
              :preview-src-list="[row.avatar]"
              style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer"
            ></el-image>
          </div>
        </el-popover>
      </template>
      
      <!-- 自定义状态插槽 -->
      <template #status="{ row }">
        <el-tag
          :type="
            row.status === 'active' ? 'success' : 
            row.status === 'inactive' ? 'danger' : 'warning'
          "
          size="small"
        >
          {{ row.status === 'active' ? '活跃' : 
             row.status === 'inactive' ? '禁用' : '待审核' }}
        </el-tag>
      </template>
      
      <!-- 自定义操作插槽 -->
      <template #operation="{ row, index }">
        <el-button
          type="primary"
          size="mini"
          @click="handleEdit(row, index)"
          icon="el-icon-edit"
        >
          编辑
        </el-button>
        <el-button
          type="danger"
          size="mini"
          @click="handleDelete(row, index)"
          icon="el-icon-delete"
        >
          删除
        </el-button>
        <el-dropdown size="mini">
          <el-button type="info" size="mini" icon="el-icon-more">
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="handleView(row)">查看详情</el-dropdown-item>
            <el-dropdown-item @click="handleResetPassword(row)">重置密码</el-dropdown-item>
            <el-dropdown-item divided @click="handleChangeStatus(row)">变更状态</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      
      <!-- 自定义性别筛选插槽 -->
      <template #genderFilter="{ column }">
        <div style="padding: 10px;">
          <el-radio-group v-model="customFilterValues.gender" @change="handleFilterConfirm">
            <el-radio label="">全部</el-radio>
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </div>
      </template>
    </advanced-table>
    
    <!-- 筛选条件展示 -->
    <div class="filter-info" v-if="Object.keys(filterValues).length > 0">
      <el-tag
        v-for="(value, key) in filterValues"
        :key="key"
        closable
        @close="handleFilterRemove(key)"
      >
        {{ getFilterLabel(key) }}: {{ value }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import AdvancedTable from './AdvancedTable.vue'

export default {
  name: 'TableTest',
  components: {
    AdvancedTable
  },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 列配置
      columns: [
        {
          prop: 'name',
          label: '姓名',
          width: 120,
          sortable: true,
          filter: {
            type: 'input',
            placeholder: '请输入姓名'
          }
        },
        {
          prop: 'avatar',
          label: '头像',
          width: 80,
          align: 'center',
          slotName: 'avatar'
        },
        {
          prop: 'gender',
          label: '性别',
          width: 80,
          align: 'center',
          filter: {
            type: 'select',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ],
            multiple: false
          }
        },
        {
          prop: 'age',
          label: '年龄',
          width: 80,
          align: 'center',
          sortable: true
        },
        {
          prop: 'role',
          label: '角色',
          width: 100,
          align: 'center',
          filter: {
            type: 'select',
            options: [
              { label: '管理员', value: 'admin' },
              { label: '用户', value: 'user' },
              { label: '访客', value: 'guest' }
            ],
            multiple: true
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          align: 'center',
          slotName: 'status',
          filter: {
            type: 'select',
            options: [
              { label: '活跃', value: 'active' },
              { label: '禁用', value: 'inactive' },
              { label: '待审核', value: 'pending' }
            ],
            multiple: true
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 160,
          align: 'center',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          align: 'center',
          fixed: 'right',
          slotName: 'operation'
        }
      ],
      // 加载状态
      loading: false,
      // 总条数
      total: 100,
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 10,
      // 筛选条件
      filterValues: {},
      // 自定义筛选值
      customFilterValues: {},
      // 选中行
      selectedRows: [],
      // 空数据配置
      emptyConfig: {
        text: '暂无用户数据',
        icon: 'el-icon-info'
      },
      // 是否显示空数据
      showEmptyData: false
    }
  },
  mounted() {
    // 初始化加载数据
    this.loadData()
  },
  methods: {
    // 加载数据
    loadData() {
      this.loading = true
      
      // 模拟异步请求
      setTimeout(() => {
        // 生成模拟数据
        const data = []
        const startIndex = (this.currentPage - 1) * this.pageSize
        const endIndex = Math.min(startIndex + this.pageSize, this.total)
        
        for (let i = startIndex; i < endIndex; i++) {
          const status = ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)]
          const role = ['admin', 'user', 'guest'][Math.floor(Math.random() * 3)]
          const gender = ['male', 'female'][Math.floor(Math.random() * 2)]
          
          data.push({
            id: i + 1,
            name: `用户${i + 1}`,
            avatar: `https://picsum.photos/80/80?random=${i + 1}`,
            gender: gender,
            age: Math.floor(Math.random() * 50) + 18,
            role: role,
            status: status,
            createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleString(),
            email: `user${i + 1}@example.com`,
            phone: `13${Math.floor(Math.random() * 1000000000)}`,
            address: `北京市朝阳区建国路${Math.floor(Math.random() * 1000)}号`
          })
        }
        
        this.tableData = this.showEmptyData ? [] : data
        this.loading = false
      }, 1000)
    },
    // 刷新数据
    refreshData() {
      this.loadData()
    },
    // 添加数据
    addData() {
      const newUser = {
        id: this.total + 1,
        name: `新用户${this.total + 1}`,
        avatar: `https://picsum.photos/80/80?random=${this.total + 1}`,
        gender: ['male', 'female'][Math.floor(Math.random() * 2)],
        age: Math.floor(Math.random() * 50) + 18,
        role: 'user',
        status: 'active',
        createTime: new Date().toLocaleString(),
        email: `newuser${this.total + 1}@example.com`,
        phone: `13${Math.floor(Math.random() * 1000000000)}`,
        address: `北京市朝阳区建国路${Math.floor(Math.random() * 1000)}号`
      }
      
      this.tableData.unshift(newUser)
      this.total++
      this.$message.success('数据添加成功')
    },
    // 切换加载状态
    toggleLoading() {
      this.loading = !this.loading
    },
    // 清除选择
    clearSelection() {
      this.$refs.advancedTable.clearSelection()
      this.$message.info('已清除选择')
    },
    // 切换空数据
    toggleEmptyData() {
      this.showEmptyData = !this.showEmptyData
      this.loadData()
    },
    // 查看选中行
    showSelectedRows() {
      if (this.selectedRows.length === 0) {
        this.$message.info('没有选中任何行')
        return
      }
      
      const ids = this.selectedRows.map(row => row.id).join(', ')
      this.$message.success(`选中了 ${this.selectedRows.length} 行，ID：${ids}`)
    },
    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      console.log('选择变化:', selection)
    },
    // 页码变化
    handleCurrentPageChange(page) {
      this.currentPage = page
      console.log('页码变化:', page)
      this.loadData()
    },
    // 每页条数变化
    handlePageSizeChange(size) {
      this.pageSize = size
      console.log('每页条数变化:', size)
      this.loadData()
    },
    // 排序变化
    handleSortChange(sort) {
      console.log('排序变化:', sort)
      // 这里可以根据排序字段和排序方向重新加载数据
      this.loadData()
    },
    // 筛选变化
    handleFilterChange(filters) {
      this.filterValues = filters
      console.log('筛选变化:', filters)
      // 这里可以根据筛选条件重新加载数据
      this.loadData()
    },
    // 行点击
    handleRowClick(row, event, column) {
      console.log('行点击:', row, event, column)
    },
    // 编辑
    handleEdit(row, index) {
      this.$message.info(`编辑用户：${row.name}，索引：${index}`)
    },
    // 删除
    handleDelete(row, index) {
      this.$confirm(`确定要删除用户 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData.splice(index, 1)
        this.total--
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 查看详情
    handleView(row) {
      this.$message.info(`查看用户 ${row.name} 的详情`)
      console.log('用户详情:', row)
    },
    // 重置密码
    handleResetPassword(row) {
      this.$message.success(`已重置用户 ${row.name} 的密码`)
    },
    // 变更状态
    handleChangeStatus(row) {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      row.status = newStatus
      this.$message.success(`用户 ${row.name} 的状态已变更为 ${newStatus}`)
    },
    // 筛选确认
    handleFilterConfirm() {
      // 合并自定义筛选和内置筛选
      const filters = { ...this.filterValues, ...this.customFilterValues }
      this.handleFilterChange(filters)
    },
    // 移除筛选条件
    handleFilterRemove(key) {
      delete this.filterValues[key]
      if (this.customFilterValues[key]) {
        delete this.customFilterValues[key]
      }
      this.handleFilterChange(this.filterValues)
    },
    // 获取筛选标签
    getFilterLabel(key) {
      const column = this.columns.find(col => col.prop === key)
      return column ? column.label : key
    }
  }
}
</script>

<style scoped>
.table-test-container {
  padding: 20px;
  background-color: #fff;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.test-toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-info {
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>