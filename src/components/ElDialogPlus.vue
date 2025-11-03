<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :top="top"
    :modal="modal"
    :modal-append-to-body="modalAppendToBody"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :custom-class="customClass"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="beforeClose"
    :center="center"
    :destroy-on-close="destroyOnClose"
    :size="size"
    ref="dialogRef"
    v-bind="$attrs"
  >
    <div
      ref="dialogContent"
      class="el-dialog-plus__content"
      :class="{ 'el-dialog-plus__content-loading': loading }"
      :style="{ maxHeight: maxHeight || 'none' }"
    >
      <div v-if="loading" class="el-dialog-plus__loading">
        <el-loading-spinner></el-loading-spinner>
        <span class="el-dialog-plus__loading-text">{{ loadingText }}</span>
      </div>
      <slot></slot>
    </div>
    <div slot="footer" class="dialog-footer" v-if="showFooter">
      <el-button v-if="showCancelBtn" :size="buttonSize" @click="handleCancel">
        {{ cancelText }}
      </el-button>
      <el-button
        v-if="showConfirmBtn"
        type="primary"
        :size="buttonSize"
        :loading="confirmLoading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ElDialogPlus',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: '50%'
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    top: {
      type: String,
      default: '15vh'
    },
    modal: {
      type: Boolean,
      default: true
    },
    modalAppendToBody: {
      type: Boolean,
      default: true
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    lockScroll: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: ''
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    beforeClose: {
      type: Function,
      default: null
    },
    center: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'small'
    },
    draggable: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: [String, Number],
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showCancelBtn: {
      type: Boolean,
      default: true
    },
    showConfirmBtn: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    buttonSize: {
      type: String,
      default: 'small'
    }
  },
  data() {
    return {
      dialogRef: null,
      dialogContent: null,
      isDragging: false,
      startX: 0,
      startY: 0,
      dialogLeft: 0,
      dialogTop: 0
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.draggable) {
        this.initDrag();
      }
    });
  },
  watch: {
    draggable(newVal) {
      if (newVal) {
        this.initDrag();
      } else {
        this.removeDrag();
      }
    }
  },
  beforeDestroy() {
    this.removeDrag();
  },
  methods: {
    initDrag() {
      this.$nextTick(() => {
        if (!this.$refs.dialogRef) {
          console.warn('ElDialogPlus: dialogRef is not found');
          return;
        }
        const dialogEl = this.$refs.dialogRef.$el;
        if (!dialogEl) {
          console.warn('ElDialogPlus: dialog element is not found');
          return;
        }
        const dialogHeader = dialogEl.querySelector('.el-dialog__header');
        if (dialogHeader) {
          dialogHeader.style.cursor = 'move';
          dialogHeader.addEventListener('mousedown', this.handleMouseDown);
          dialogHeader.addEventListener('touchstart', this.handleTouchStart);
        } else {
          console.warn('ElDialogPlus: dialog header is not found');
        }
      });
    },
    removeDrag() {
      this.$nextTick(() => {
        if (!this.$refs.dialogRef) return;
        const dialogEl = this.$refs.dialogRef.$el;
        if (!dialogEl) return;
        const dialogHeader = dialogEl.querySelector('.el-dialog__header');
        if (dialogHeader) {
          dialogHeader.style.cursor = 'default';
          dialogHeader.removeEventListener('mousedown', this.handleMouseDown);
          dialogHeader.removeEventListener('touchstart', this.handleTouchStart);
        }
      });
    },
    handleMouseDown(e) {
      this.startDrag(e.clientX, e.clientY);
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseMove(e) {
      this.drag(e.clientX, e.clientY);
    },
    handleMouseUp() {
      this.stopDrag();
    },
    handleTouchStart(e) {
      this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
      document.addEventListener('touchmove', this.handleTouchMove);
      document.addEventListener('touchend', this.handleTouchEnd);
    },
    handleTouchMove(e) {
      this.drag(e.touches[0].clientX, e.touches[0].clientY);
    },
    handleTouchEnd() {
      this.stopDrag();
    },
    startDrag(x, y) {
      this.isDragging = true;
      this.startX = x;
      this.startY = y;
      const dialogEl = this.$refs.dialogRef?.$el;
      if (!dialogEl) {
        this.isDragging = false;
        return;
      }
      this.dialogLeft = dialogEl.offsetLeft;
      this.dialogTop = dialogEl.offsetTop;
      dialogEl.style.userSelect = 'none';
    },
    drag(x, y) {
      if (!this.isDragging) return;
      const dialogEl = this.$refs.dialogRef?.$el;
      if (!dialogEl) return;
      const deltaX = x - this.startX;
      const deltaY = y - this.startY;
      let newLeft = this.dialogLeft + deltaX;
      let newTop = this.dialogTop + deltaY;

      // 限制在视窗内
      const maxLeft = window.innerWidth - dialogEl.offsetWidth;
      const maxTop = window.innerHeight - dialogEl.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      dialogEl.style.left = `${newLeft}px`;
      dialogEl.style.top = `${newTop}px`;
      dialogEl.style.marginTop = '0';
    },
    stopDrag() {
      this.isDragging = false;
      const dialogEl = this.$refs.dialogRef.$el;
      dialogEl.style.userSelect = '';
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('touchend', this.handleTouchEnd);
    },
    handleCancel() {
      this.$emit('update:visible', false);
      this.$emit('cancel');
    },
    handleConfirm() {
      this.$emit('confirm');
    },
    close() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style scoped>
.el-dialog-plus__content {
  position: relative;
  overflow: auto;
  padding: 20px 0;
}

.el-dialog-plus__content-loading {
  position: relative;
  min-height: 200px;
}

.el-dialog-plus__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-dialog-plus__loading-text {
  display: block;
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px 20px;
}

/* 拖拽时的样式优化 */
.el-dialog__header {
  transition: background-color 0.3s;
}

.el-dialog__header:hover {
  background-color: #f5f7fa;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .el-dialog {
    width: 90% !important;
    margin: 0 auto !important;
  }
}

@media (max-width: 480px) {
  .el-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }
}
</style>