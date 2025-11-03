<template>
  <div class="test-dialog-container">
    <el-button type="primary" @click="showBasicDialog = true">基础弹窗</el-button>
    <el-button type="success" @click="showDragDialog = true">可拖拽弹窗</el-button>
    <el-button type="warning" @click="showAsyncDialog = true">异步加载弹窗</el-button>
    <el-button type="danger" @click="showMaxHeightDialog = true">最大高度弹窗</el-button>
    <el-button type="info" @click="showNestedDialog1 = true">多级嵌套弹窗</el-button>
    <el-button type="primary" @click="showNoFooterDialog = true">无底部按钮弹窗</el-button>

    <!-- 基础弹窗 -->
    <el-dialog-plus
      :visible.sync="showBasicDialog"
      title="基础弹窗"
      width="600px"
    >
      <div>
        <p>这是一个基础弹窗示例，演示了ElDialogPlus的基本用法。</p>
        <p>您可以自定义标题、宽度、按钮等属性。</p>
      </div>
    </el-dialog-plus>

    <!-- 可拖拽弹窗 -->
    <el-dialog-plus
      :visible.sync="showDragDialog"
      title="可拖拽弹窗"
      width="500px"
      draggable
      :close-on-click-modal="false"
    >
      <div>
        <p>这是一个可拖拽弹窗示例，您可以通过拖拽标题栏来移动弹窗。</p>
        <p>拖拽功能在PC端和移动端都能正常工作。</p>
      </div>
    </el-dialog-plus>

    <!-- 异步加载弹窗 -->
    <el-dialog-plus
      :visible.sync="showAsyncDialog"
      title="异步加载弹窗"
      width="700px"
      :loading="asyncLoading"
      loading-text="正在加载数据，请稍候..."
    >
      <div v-if="asyncData.length > 0">
        <el-table :data="asyncData" border stripe>
          <el-table-column prop="name" label="姓名" width="150"></el-table-column>
          <el-table-column prop="age" label="年龄" width="100"></el-table-column>
          <el-table-column prop="gender" label="性别" width="100"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
        </el-table>
      </div>
    </el-dialog-plus>

    <!-- 最大高度弹窗 -->
    <el-dialog-plus
      :visible.sync="showMaxHeightDialog"
      title="最大高度弹窗"
      width="500px"
      max-height="300px"
    >
      <div>
        <p v-for="i in 20" :key="i">
          这是第{{ i }}行内容，用于测试最大高度限制。当内容超过最大高度时，会显示滚动条。
        </p>
      </div>
    </el-dialog-plus>

    <!-- 多级嵌套弹窗1 -->
    <el-dialog-plus
      :visible.sync="showNestedDialog1"
      title="一级弹窗"
      width="500px"
    >
      <div>
        <p>这是一级弹窗，点击按钮可以打开二级弹窗。</p>
        <el-button type="primary" @click="showNestedDialog2 = true">打开二级弹窗</el-button>
      </div>
    </el-dialog-plus>

    <!-- 多级嵌套弹窗2 -->
    <el-dialog-plus
      :visible.sync="showNestedDialog2"
      title="二级弹窗"
      width="400px"
      append-to-body
    >
      <div>
        <p>这是二级弹窗，点击按钮可以打开三级弹窗。</p>
        <el-button type="primary" @click="showNestedDialog3 = true">打开三级弹窗</el-button>
      </div>
    </el-dialog-plus>

    <!-- 多级嵌套弹窗3 -->
    <el-dialog-plus
      :visible.sync="showNestedDialog3"
      title="三级弹窗"
      width="300px"
      append-to-body
    >
      <div>
        <p>这是三级弹窗，演示了多级弹窗嵌套功能。</p>
        <el-button type="primary" @click="showNestedDialog3 = false">关闭</el-button>
      </div>
    </el-dialog-plus>

    <!-- 自定义按钮和样式弹窗 -->
    <el-dialog-plus
      :visible.sync="showCustomDialog"
      title="自定义弹窗"
      width="500px"
      :show-cancel-btn="false"
      confirm-text="保存"
      :confirm-loading="confirmLoading"
      custom-class="custom-dialog"
    >
      <div>
        <el-form :model="formData" label-width="80px">
          <el-form-item label="姓名">
            <el-input v-model="formData.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog-plus>

    <!-- 无底部按钮弹窗 -->
    <el-dialog-plus
      :visible.sync="showNoFooterDialog"
      title="无底部按钮弹窗"
      width="400px"
      :show-footer="false"
    >
      <div>
        <p>这是一个没有底部按钮栏的弹窗示例。</p>
        <p>可以通过设置 show-footer="false" 来隐藏底部按钮栏。</p>
        <el-button type="primary" @click="showNoFooterDialog = false" style="margin-top: 20px;">关闭弹窗</el-button>
      </div>
    </el-dialog-plus>
  </div>
</template>

<script>
export default {
  name: 'TestDialog',
  data() {
    return {
      showBasicDialog: false,
      showDragDialog: false,
      showAsyncDialog: false,
      showMaxHeightDialog: false,
      showNestedDialog1: false,
      showNestedDialog2: false,
      showNestedDialog3: false,
      showCustomDialog: false,
      showNoFooterDialog: false,
      asyncLoading: false,
      asyncData: [],
      confirmLoading: false,
      formData: {
        name: '',
        email: ''
      }
    };
  },
  methods: {
    // 模拟异步加载数据
    loadAsyncData() {
      this.asyncLoading = true;
      setTimeout(() => {
        this.asyncData = [
          { name: '张三', age: 28, gender: '男', email: 'zhangsan@example.com' },
          { name: '李四', age: 32, gender: '女', email: 'lisi@example.com' },
          { name: '王五', age: 25, gender: '男', email: 'wangwu@example.com' },
          { name: '赵六', age: 30, gender: '女', email: 'zhaoliu@example.com' },
          { name: '钱七', age: 27, gender: '男', email: 'qianqi@example.com' }
        ];
        this.asyncLoading = false;
      }, 2000);
    }
  },
  watch: {
    showAsyncDialog(newVal) {
      if (newVal && this.asyncData.length === 0) {
        this.loadAsyncData();
      }
    }
  }
};
</script>

<style scoped>
.test-dialog-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 400px;
}

.test-dialog-container .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.custom-dialog .el-dialog__header {
  background-color: #409eff;
  color: white;
}

.custom-dialog .el-dialog__header .el-dialog__title {
  color: white;
}

.custom-dialog .el-dialog__headerbtn .el-icon-close {
  color: white;
}
</style>