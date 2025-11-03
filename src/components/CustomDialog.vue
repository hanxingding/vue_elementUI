<template>
  <div :class="['custom-dialog-wrapper', { 'is-mobile': isMobile }]" v-if="visible">
    <!-- 遮罩层 -->
    <div class="custom-dialog-mask" @click="handleMaskClick" :style="maskStyle"></div>
    
    <!-- 弹窗主体 -->
    <div 
      :class="['custom-dialog', dialogClass]" 
      :style="dialogStyle" 
      ref="dialogRef"
      v-if="visible"
    >
      <!-- 标题栏 -->
      <div 
        :class="['custom-dialog-header', { 'draggable': draggable && !isMobile }]"
        @mousedown="handleDragStart"
        @touchstart="handleDragStart"
      >
        <slot name="header">
          <span class="custom-dialog-title">{{ title }}</span>
        </slot>
        
        <!-- 关闭按钮 -->
        <div class="custom-dialog-header__close" @click="handleClose">
          <slot name="close-icon">
            <i class="el-icon-close"></i>
          </slot>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div :class="['custom-dialog-body', { 'has-loading': loading }]" :style="bodyStyle">
        <!-- 加载动画 -->
        <div v-if="loading" class="custom-dialog-loading">
          <el-loading-spinner :size="loadingSize" :color="loadingColor"></el-loading-spinner>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
        
        <!-- 内容插槽 -->
        <slot v-else></slot>
      </div>
      
      <!-- 底部按钮区 -->
      <div class="custom-dialog-footer" v-if="showFooter || $slots.footer">
        <slot name="footer">
          <el-button @click="handleCancel">{{ cancelText }}</el-button>
          <el-button type="primary" @click="handleConfirm">{{ confirmText }}</el-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomDialog',
  
  props: {
    // 基础属性
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    width: {
      type: String,
      default: '50%'
    },
    top: {
      type: String,
      default: '15vh'
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    loadingSize: {
      type: String,
      default: '40px'
    },
    loadingColor: {
      type: String,
      default: '' // 默认为 Element 主题色
    },
    
    // 定位
    position: {
      type: String,
      validator: (value) => {
        return ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', ''].includes(value)
      },
      default: ''
    },
    left: {
      type: String,
      default: ''
    },
    right: {
      type: String,
      default: ''
    },
    bottom: {
      type: String,
      default: ''
    },
    
    // 拖拽
    draggable: {
      type: Boolean,
      default: false
    },
    
    // 内容区
    maxHeight: {
      type: String,
      default: '60vh'
    },
    
    // 底部按钮
    showFooter: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    
    // 关闭行为
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      isMobile: false,
      zIndex: 0,
      dragStartX: 0,
      dragStartY: 0,
      dialogStartLeft: 0,
      dialogStartTop: 0,
      isDragging: false,
      dialogWidth: 0,
      dialogHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      lastLoadingState: false
    }
  },
  
  computed: {
    dialogClass() {
      return {
        'custom-dialog--center': this.position === 'center'
      }
    },
    
    maskStyle() {
      return {
        zIndex: this.zIndex
      }
    },
    
    dialogStyle() {
      let style = {
        width: this.isMobile ? '90%' : this.width,
        zIndex: this.zIndex + 1,
        top: this.top
      }
      
      // 处理定位
      if (this.left) {
        style.left = this.left
      } else if (this.right) {
        style.right = this.right
      } else if (this.position === 'top-left' || this.position === 'bottom-left') {
        style.left = '20px'
      } else if (this.position === 'top-right' || this.position === 'bottom-right') {
        style.right = '20px'
      }
      
      if (this.bottom) {
        style.bottom = this.bottom
        delete style.top
      } else if (this.position === 'bottom-left' || this.position === 'bottom-right') {
        style.bottom = '20px'
        delete style.top
      }
      
      return style
    },
    
    bodyStyle() {
      return {
        maxHeight: this.maxHeight
      }
    }
  },
  
  watch: {
    visible(newVal) {
      console.log('CustomDialog visible changed:', newVal)
      if (newVal) {
        this.handleOpen()
        
        // 延迟执行 appendToBody，确保 dialogRef 已存在
        this.$nextTick(() => {
          if (this.appendToBody && this.$refs.dialogRef && this.$refs.dialogRef.parentNode) {
            document.body.appendChild(this.$refs.dialogRef.parentNode)
          }
        })
      } else {
        this.handleClose()
      }
    },
    
    loading(newVal) {
      if (this.lastLoadingState && !newVal) {
        this.$emit('load-success')
      }
      this.lastLoadingState = newVal
    }
  },
  
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    window.addEventListener('mousemove', this.handleDragMove)
    window.addEventListener('mouseup', this.handleDragEnd)
    window.addEventListener('touchmove', this.handleDragMove)
    window.addEventListener('touchend', this.handleDragEnd)
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
    window.removeEventListener('mousemove', this.handleDragMove)
    window.removeEventListener('mouseup', this.handleDragEnd)
    window.removeEventListener('touchmove', this.handleDragMove)
    window.removeEventListener('touchend', this.handleDragEnd)
    
    if (this.appendToBody && this.$refs.dialogRef && this.$refs.dialogRef.parentNode) {
      this.$refs.dialogRef.parentNode.remove()
    }
  },
  
  methods: {
    // 检查是否为移动端
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    },
    
    // 打开弹窗
    handleOpen() {
      this.calculateZIndex()
      this.$nextTick(() => {
        this.calculateDialogSize()
        this.adjustPosition()
        this.$emit('open')
      })
    },
    
    // 关闭弹窗
    handleClose() {
      this.$emit('close')
      this.$nextTick(() => {
        this.$emit('closed')
      })
    },
    
    // 点击遮罩层关闭
    handleMaskClick() {
      if (this.closeOnClickModal) {
        this.handleCancel()
      }
    },
    
    // 点击确认按钮
    handleConfirm() {
      this.$emit('confirm')
    },
    
    // 点击取消按钮
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
    
    // 计算 z-index
    calculateZIndex() {
      // 查找所有 CustomDialog 实例
      const dialogs = document.querySelectorAll('.custom-dialog-wrapper')
      let maxZIndex = 2000
      
      dialogs.forEach(dialog => {
        const zIndex = parseInt(getComputedStyle(dialog.querySelector('.custom-dialog-mask')).zIndex)
        if (zIndex > maxZIndex) {
          maxZIndex = zIndex
        }
      })
      
      this.zIndex = maxZIndex + 1
    },
    
    // 计算弹窗尺寸
    calculateDialogSize() {
      if (this.$refs.dialogRef) {
        this.dialogWidth = this.$refs.dialogRef.offsetWidth
        this.dialogHeight = this.$refs.dialogRef.offsetHeight
      }
      
      this.viewportWidth = window.innerWidth
      this.viewportHeight = window.innerHeight
    },
    
    // 调整位置避免超出视口
    adjustPosition() {
      const dialogEl = this.$refs.dialogRef
      if (!dialogEl) return
      
      const rect = dialogEl.getBoundingClientRect()
      let left = rect.left
      let top = rect.top
      
      // 右侧超出
      if (left + this.dialogWidth > this.viewportWidth) {
        left = this.viewportWidth - this.dialogWidth - 20
      }
      
      // 左侧超出
      if (left < 0) {
        left = 20
      }
      
      // 底部超出
      if (top + this.dialogHeight > this.viewportHeight) {
        top = this.viewportHeight - this.dialogHeight - 20
      }
      
      // 顶部超出
      if (top < 0) {
        top = 20
      }
      
      // 更新位置
      if (left !== rect.left || top !== rect.top) {
        dialogEl.style.left = left + 'px'
        dialogEl.style.top = top + 'px'
      }
    },
    
    // 拖拽开始
    handleDragStart(e) {
      if (!this.draggable || this.isMobile) return
      
      this.isDragging = true
      const dialogEl = this.$refs.dialogRef
      
      // 记录初始位置
      const rect = dialogEl.getBoundingClientRect()
      this.dialogStartLeft = rect.left
      this.dialogStartTop = rect.top
      
      // 记录鼠标/触摸位置
      if (e.type === 'mousedown') {
        this.dragStartX = e.clientX
        this.dragStartY = e.clientY
      } else {
        this.dragStartX = e.touches[0].clientX
        this.dragStartY = e.touches[0].clientY
      }
      
      // 添加拖拽样式
      dialogEl.classList.add('is-dragging')
    },
    
    // 拖拽移动
    handleDragMove(e) {
      if (!this.isDragging) return
      
      const dialogEl = this.$refs.dialogRef
      let deltaX, deltaY
      
      // 计算移动距离
      if (e.type === 'mousemove') {
        deltaX = e.clientX - this.dragStartX
        deltaY = e.clientY - this.dragStartY
      } else {
        deltaX = e.touches[0].clientX - this.dragStartX
        deltaY = e.touches[0].clientY - this.dragStartY
      }
      
      // 计算新位置
      let newLeft = this.dialogStartLeft + deltaX
      let newTop = this.dialogStartTop + deltaY
      
      // 限制在视口内
      newLeft = Math.max(20, Math.min(newLeft, this.viewportWidth - this.dialogWidth - 20))
      newTop = Math.max(20, Math.min(newTop, this.viewportHeight - this.dialogHeight - 20))
      
      // 更新位置
      dialogEl.style.left = newLeft + 'px'
      dialogEl.style.top = newTop + 'px'
    },
    
    // 拖拽结束
    handleDragEnd() {
      if (!this.isDragging) return
      
      this.isDragging = false
      const dialogEl = this.$refs.dialogRef
      
      // 移除拖拽样式
      dialogEl.classList.remove('is-dragging')
      
      // 触发拖拽结束事件
      const rect = dialogEl.getBoundingClientRect()
      this.$emit('drag-end', { top: rect.top, left: rect.left })
    }
  }
}
</script>

<style scoped>
.custom-dialog-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  outline: 0;
  z-index: 2000;
}

.custom-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

.custom-dialog {
  position: relative;
  margin: 0 auto;
  background-color: #fff;
  border-radius: var(--el-border-radius-base, 4px);
  box-shadow: var(--el-box-shadow, 0 2px 12px 0 rgba(0, 0, 0, 0.1));
  transition: transform 0.3s, opacity 0.3s;
  overflow: hidden;
}

.custom-dialog.is-mobile {
  width: 90% !important;
  border-radius: 12px;
  box-shadow: none;
}

.custom-dialog--center {
  top: 50% !important;
  transform: translateY(-50%);
}

.custom-dialog-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  background-color: #fff;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-dialog-header.draggable:hover {
  cursor: move;
}

.custom-dialog-header.is-dragging {
  cursor: move;
}

.custom-dialog-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.custom-dialog-header__close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.custom-dialog-header__close:hover {
  background-color: #f5f7fa;
}

.custom-dialog-header__close i {
  font-size: 16px;
  color: #909399;
}

.custom-dialog-body {
  padding: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  max-height: 60vh;
  overflow-y: auto;
  position: relative;
}

.custom-dialog-body.has-loading {
  position: relative;
  min-height: 100px;
}

.custom-dialog-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.custom-dialog-loading .loading-text {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
}

.custom-dialog-footer {
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  background-color: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 滚动条样式 */
.custom-dialog-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-dialog-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-dialog-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-dialog-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>