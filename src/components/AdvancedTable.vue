<template>
  <div class="advanced-table-container">
    <!-- 列管理按钮 -->
    <div class="table-toolbar" v-if="showColumnManager">
      <el-button type="primary" size="small" @click="openColumnManager">
        <i class="el-icon-setting"></i> 列管理
      </el-button>
    </div>

    <!-- 表格加载状态 -->
    <el-table
      v-loading="loading"
      :element-loading-text="loadingText"
      :data="tableData"
      :height="height"
      :max-height="maxHeight"
      :border="border"
      :default-sort="defaultSort"
      :row-key="rowKey"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      ref="tableRef"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectionType"
        type="selection"
        :width="selectionWidth"
        :selectable="selectionSelectable"
      ></el-table-column>

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        :width="indexWidth"
        :label="indexLabel"
      ></el-table-column>

      <!-- 动态列渲染 -->
      <template v-for="(column, index) in visibleColumns">
        <!-- 嵌套表头 -->
        <el-table-column
          v-if="column.children && column.children.length > 0"
          :key="column.prop || index"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :header-align="column.headerAlign || column.align || 'left'"
          :sortable="column.sortable"
          :fixed="column.fixed"
          :resizable="column.resizable"
        >
          <template v-for="(child, childIndex) in column.children">
            <el-table-column
              :key="child.prop || childIndex"
              :prop="child.prop"
              :label="child.label"
              :width="child.width"
              :min-width="child.minWidth"
              :align="child.align || column.align || 'left'"
              :header-align="child.headerAlign || child.align || column.headerAlign || column.align || 'left'"
              :sortable="child.sortable"
              :fixed="child.fixed"
              :resizable="child.resizable"
            >
              <!-- 列筛选 -->
              <template v-if="child.filter" #header>
                <el-dropdown trigger="click">
                  <span class="filter-header">
                    {{ child.label }}
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <!-- 自定义筛选弹窗 -->
                    <slot v-if="child.filter.slotName" :name="child.filter.slotName" :column="child"></slot>
                    <!-- 内置筛选 -->
                    <template v-else>
                      <!-- 输入框搜索 -->
                      <el-input
                        v-if="child.filter.type === 'input'"
                        v-model="filterValues[child.prop]"
                        placeholder="请输入"
                        size="small"
                        @input="handleFilterInput(child.prop)"
                        @keyup.enter.native="handleFilterConfirm"
                      >
                        <el-button slot="append" icon="el-icon-search" @click="handleFilterConfirm"></el-button>
                      </el-input>
                      <!-- 单选/多选筛选 -->
                      <el-select
                        v-else-if="child.filter.type === 'select'"
                        v-model="filterValues[child.prop]"
                        :multiple="child.filter.multiple"
                        placeholder="请选择"
                        size="small"
                        @change="handleFilterConfirm"
                      >
                        <el-option
                          v-for="item in child.filter.options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        ></el-option>
                      </el-select>
                    </template>
                    <el-dropdown-item divided @click="handleFilterReset">
                      重置筛选
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>

              <!-- 自定义插槽内容 -->
              <template #default="scope">
                <slot
                  v-if="child.slotName"
                  :name="child.slotName"
                  :row="scope.row"
                  :column="child"
                  :index="scope.$index"
                ></slot>
                <!-- 默认内容 -->
                <template v-else>
                  <!-- 图片渲染 -->
                  <el-image
                    v-if="child.type === 'image'"
                    :src="scope.row[child.prop]"
                    :preview-src-list="[scope.row[child.prop]]"
                    style="width: 40px; height: 40px; border-radius: 4px"
                  ></el-image>
                  <!-- 标签渲染 -->
                  <el-tag
                    v-else-if="child.type === 'tag'"
                    :type="child.tagType || 'primary'"
                    size="small"
                  >
                    {{ scope.row[child.prop] }}
                  </el-tag>
                  <!-- 默认文本 -->
                  <span v-else>{{ scope.row[child.prop] }}</span>
                </template>
              </template>
            </el-table-column>
          </template>
        </el-table-column>

        <!-- 普通列 -->
        <el-table-column
          v-else
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :header-align="column.headerAlign || column.align || 'left'"
          :sortable="column.sortable"
          :fixed="column.fixed"
          :resizable="column.resizable"
        >
          <!-- 列筛选 -->
          <template v-if="column.filter" #header>
            <el-dropdown trigger="click">
              <span class="filter-header">
                {{ column.label }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <!-- 自定义筛选弹窗 -->
                <slot v-if="column.filter.slotName" :name="column.filter.slotName" :column="column"></slot>
                <!-- 内置筛选 -->
                <template v-else>
                  <!-- 输入框搜索 -->
                  <el-input
                    v-if="column.filter.type === 'input'"
                    v-model="filterValues[column.prop]"
                    placeholder="请输入"
                    size="small"
                    @input="handleFilterInput(column.prop)"
                    @keyup.enter.native="handleFilterConfirm"
                  >
                    <el-button slot="append" icon="el-icon-search" @click="handleFilterConfirm"></el-button>
                  </el-input>
                  <!-- 单选/多选筛选 -->
                  <el-select
                    v-else-if="column.filter.type === 'select'"
                    v-model="filterValues[column.prop]"
                    :multiple="column.filter.multiple"
                    placeholder="请选择"
                    size="small"
                    @change="handleFilterConfirm"
                  >
                    <el-option
                      v-for="item in column.filter.options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </template>
                <el-dropdown-item divided @click="handleFilterReset">
                  重置筛选
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>

          <!-- 自定义插槽内容 -->
          <template #default="scope">
            <slot
              v-if="column.slotName"
              :name="column.slotName"
              :row="scope.row"
              :column="column"
              :index="scope.$index"
            ></slot>
            <!-- 默认内容 -->
            <template v-else>
              <!-- 图片渲染 -->
              <el-image
                v-if="column.type === 'image'"
                :src="scope.row[column.prop]"
                :preview-src-list="[scope.row[column.prop]]"
                style="width: 40px; height: 40px; border-radius: 4px"
              ></el-image>
              <!-- 标签渲染 -->
              <el-tag
                v-else-if="column.type === 'tag'"
                :type="column.tagType || 'primary'"
                size="small"
              >
                {{ scope.row[column.prop] }}
              </el-tag>
              <!-- 默认文本 -->
              <span v-else>{{ scope.row[column.prop] }}</span>
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 空数据提示 -->
    <div v-if="tableData.length === 0 && !loading" class="empty-data">
      <el-image v-if="emptyConfig.image" :src="emptyConfig.image" style="width: 120px; height: 120px; margin-bottom: 16px"></el-image>
      <i v-else-if="emptyConfig.icon" :class="['empty-icon', emptyConfig.icon]"></i>
      <span class="empty-text">{{ emptyConfig.text || '暂无数据' }}</span>
    </div>

    <!-- 分页组件 -->
    <div class="table-pagination" v-if="showPagination && total > 0">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :background="paginationBackground"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentPageChange"
      ></el-pagination>
    </div>

    <!-- 列管理弹窗 -->
    <el-dialog
      title="列管理"
      :visible.sync="columnManagerVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-tree
        :data="columnTreeData"
        show-checkbox
        node-key="prop"
        :default-checked-keys="visibleColumnProps"
        @check-change="handleColumnCheckChange"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button
                v-if="node.level === 1 && !node.isLeaf"
                type="text"
                size="mini"
                @click="() => appendChild(node, data)"
              >
                Append
              </el-button>
              <el-button
                type="text"
                size="mini"
                @click="() => remove(node, data)"
              >
                Delete
              </el-button>
            </span>
          </span>
        </template>
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="columnManagerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveColumnSettings">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AdvancedTable',
  props: {
    // 表格数据
    tableData: {
      type: Array,
      default: () => []
    },
    // 列配置
    columns: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 加载文本
    loadingText: {
      type: String,
      default: '加载中...'
    },
    // 总条数
    total: {
      type: Number,
      default: 0
    },
    // 当前页码
    currentPage: {
      type: Number,
      default: 1
    },
    // 每页条数
    pageSize: {
      type: Number,
      default: 10
    },
    // 每页条数选项
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    // 分页布局
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    // 分页背景
    paginationBackground: {
      type: Boolean,
      default: true
    },
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 选择类型: single/multiple
    selectionType: {
      type: String,
      default: ''
    },
    // 选择列宽度
    selectionWidth: {
      type: Number,
      default: 55
    },
    // 选择条件
    selectionSelectable: {
      type: Function,
      default: () => true
    },
    // 是否显示序号列
    showIndex: {
      type: Boolean,
      default: false
    },
    // 序号列宽度
    indexWidth: {
      type: Number,
      default: 60
    },
    // 序号列标题
    indexLabel: {
      type: String,
      default: '序号'
    },
    // 行标识
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    // 表格高度
    height: {
      type: [String, Number],
      default: ''
    },
    // 表格最大高度
    maxHeight: {
      type: [String, Number],
      default: ''
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: false
    },
    // 默认排序
    defaultSort: {
      type: Object,
      default: () => {}
    },
    // 是否显示列管理
    showColumnManager: {
      type: Boolean,
      default: true
    },
    // 空数据配置
    emptyConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columnManagerVisible: false,
      filterValues: {},
      // 已选行数据
      selectedRows: [],
      // 本地存储的列配置
      localColumnSettings: this.loadLocalColumnSettings()
    }
  },
  computed: {
    // 可见列
    visibleColumns() {
      return this.columns.filter(column => {
        // 如果有本地配置，使用本地配置
        if (this.localColumnSettings && this.localColumnSettings[column.prop]) {
          return this.localColumnSettings[column.prop].visible !== false
        }
        // 否则使用默认配置
        return column.visible !== false
      })
    },
    // 可见列的prop集合
    visibleColumnProps() {
      const props = []
      this.columns.forEach(column => {
        if (this.localColumnSettings && this.localColumnSettings[column.prop]) {
          if (this.localColumnSettings[column.prop].visible !== false) {
            props.push(column.prop)
          }
        } else if (column.visible !== false) {
          props.push(column.prop)
        }
        
        // 处理子列
        if (column.children && column.children.length > 0) {
          column.children.forEach(child => {
            if (this.localColumnSettings && this.localColumnSettings[child.prop]) {
              if (this.localColumnSettings[child.prop].visible !== false) {
                props.push(child.prop)
              }
            } else if (child.visible !== false) {
              props.push(child.prop)
            }
          })
        }
      })
      return props
    },
    // 列树结构（用于列管理）
    columnTreeData() {
      return this.columns.map(column => {
        const treeNode = {
          label: column.label,
          prop: column.prop,
          children: []
        }
        
        if (column.children && column.children.length > 0) {
          treeNode.children = column.children.map(child => ({
            label: child.label,
            prop: child.prop
          }))
        }
        
        return treeNode
      })
    }
  },
  mounted() {
    // 加载本地分页设置
    this.loadLocalPaginationSettings()
    // 恢复已选行状态
    this.restoreSelectedRows()
  },
  methods: {
    // 打开列管理
    openColumnManager() {
      this.columnManagerVisible = true
    },
    // 列勾选变化
    handleColumnCheckChange(data, checked) {
      // 更新本地配置
      if (!this.localColumnSettings) {
        this.localColumnSettings = {}
      }
      this.localColumnSettings[data.prop] = {
        visible: checked
      }
    },
    // 保存列设置
    saveColumnSettings() {
      this.saveLocalColumnSettings()
      this.columnManagerVisible = false
      this.$message.success('列设置已保存')
    },
    // 加载本地列配置
    loadLocalColumnSettings() {
      const key = this.getLocalStorageKey('columnSettings')
      return JSON.parse(localStorage.getItem(key)) || {}
    },
    // 保存本地列配置
    saveLocalColumnSettings() {
      const key = this.getLocalStorageKey('columnSettings')
      localStorage.setItem(key, JSON.stringify(this.localColumnSettings))
    },
    // 加载本地分页设置
    loadLocalPaginationSettings() {
      const key = this.getLocalStorageKey('paginationSettings')
      const settings = JSON.parse(localStorage.getItem(key))
      if (settings) {
        this.currentPage = settings.currentPage || 1
        this.pageSize = settings.pageSize || 10
      }
    },
    // 保存本地分页设置
    saveLocalPaginationSettings() {
      const key = this.getLocalStorageKey('paginationSettings')
      localStorage.setItem(key, JSON.stringify({
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }))
    },
    // 生成本地存储key
    getLocalStorageKey(type) {
      const componentName = this.$options.name || 'AdvancedTable'
      const routePath = this.$route ? this.$route.path : 'default'
      return `${componentName}_${type}_${routePath}`
    },
    // 页码变化
    handleCurrentPageChange(page) {
      this.currentPage = page
      this.saveLocalPaginationSettings()
      this.$emit('current-change', page)
      this.$emit('pagination-change', { currentPage: page, pageSize: this.pageSize })
      // 保存当前选中行
      this.saveSelectedRows()
    },
    // 每页条数变化
    handlePageSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.saveLocalPaginationSettings()
      this.$emit('size-change', size)
      this.$emit('pagination-change', { currentPage: 1, pageSize: size })
      // 保存当前选中行
      this.saveSelectedRows()
    },
    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    // 行点击
    handleRowClick(row, event, column) {
      // 点击选择列时不触发行选中
      if (column && column.type === 'selection') return
      
      if (this.selectionType === 'single') {
        this.$refs.tableRef.toggleRowSelection(row, true)
      } else if (this.selectionType === 'multiple') {
        this.$refs.tableRef.toggleRowSelection(row)
      }
      
      this.$emit('row-click', row, event, column)
    },
    // 排序变化
    handleSortChange(sort) {
      this.$emit('sort-change', sort)
    },
    // 筛选输入
    handleFilterInput(prop) {
      this.$emit('filter-input', prop, this.filterValues[prop])
    },
    // 筛选确认
    handleFilterConfirm() {
      this.$emit('filter-change', this.filterValues)
    },
    // 筛选重置
    handleFilterReset() {
      this.filterValues = {}
      this.$emit('filter-reset')
    },
    // 保存选中行
    saveSelectedRows() {
      if (this.selectionType && this.selectedRows.length > 0) {
        const key = this.getLocalStorageKey('selectedRows')
        localStorage.setItem(key, JSON.stringify(this.selectedRows))
      }
    },
    // 恢复选中行
    restoreSelectedRows() {
      if (this.selectionType) {
        const key = this.getLocalStorageKey('selectedRows')
        const selectedRows = JSON.parse(localStorage.getItem(key)) || []
        if (selectedRows.length > 0 && this.tableData.length > 0) {
          // 匹配当前页的数据进行选中
          selectedRows.forEach(selectedRow => {
            const row = this.tableData.find(item => {
              if (typeof this.rowKey === 'function') {
                return this.rowKey(item) === this.rowKey(selectedRow)
              } else {
                return item[this.rowKey] === selectedRow[this.rowKey]
              }
            })
            if (row) {
              this.$refs.tableRef.toggleRowSelection(row, true)
            }
          })
        }
      }
    },
    // 清除选中行
    clearSelection() {
      this.$refs.tableRef.clearSelection()
    },
    // 切换行选中状态
    toggleRowSelection(row, selected) {
      this.$refs.tableRef.toggleRowSelection(row, selected)
    },
    // 获取选中行
    getSelection() {
      return this.selectedRows
    },
    // 追加子列
    appendChild(node, data) {
      const newChild = {
        label: '新列',
        prop: `newCol${Date.now()}`,
        children: []
      }
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(newChild)
    },
    // 删除列
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.prop === data.prop)
      children.splice(index, 1)
    }
  },
  watch: {
    // 监听数据变化，恢复选中状态
    tableData: {
      handler() {
        this.restoreSelectedRows()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.advanced-table-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.table-toolbar {
  margin-bottom: 16px;
  text-align: right;
}

.filter-header {
  cursor: pointer;
  color: #409EFF;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
}

.table-pagination {
  margin-top: 16px;
  text-align: right;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>