<template>
  <div class="dialog-test-container">
    <h1>CustomDialog 组件测试</h1>
    
    <div class="test-section">
      <h2>基础用法</h2>
      <el-button type="primary" @click="dialogVisible1 = true">打开基础弹窗</el-button>
      
      <CustomDialog 
        :visible.sync="dialogVisible1"
        title="基础弹窗"
        width="500px"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <p>这是一个基础的 CustomDialog 弹窗示例。</p>
        <p>可以自定义内容区，支持 HTML 标签。</p>
      </CustomDialog>
    </div>
    
    <div class="test-section">
      <h2>嵌套弹窗</h2>
      <el-button type="primary" @click="dialogVisible2 = true">打开第一层弹窗</el-button>
      
      <CustomDialog 
        :visible.sync="dialogVisible2"
        title="第一层弹窗"
        width="500px"
        append-to-body
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <p>这是第一层弹窗，可以打开第二层弹窗。</p>
        <el-button type="primary" @click="dialogVisible3 = true" style="margin-top: 10px;">打开第二层弹窗</el-button>
        
        <CustomDialog 
          :visible.sync="dialogVisible3"
          title="第二层弹窗"
          width="400px"
          position="top-right"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        >
          <p>这是第二层弹窗，可以打开第三层弹窗。</p>
          <el-button type="primary" @click="dialogVisible4 = true" style="margin-top: 10px;">打开第三层弹窗</el-button>
          
          <CustomDialog 
            :visible.sync="dialogVisible4"
            title="第三层弹窗"
            width="300px"
            position="bottom-left"
            @confirm="handleConfirm"
            @cancel="handleCancel"
          >
            <p>这是第三层弹窗，支持最多 3 级嵌套。</p>
          </CustomDialog>
        </CustomDialog>
      </CustomDialog>
    </div>
    
    <div class="test-section">
      <h2>加载状态</h2>
      <el-button type="primary" @click="handleLoading">打开加载弹窗</el-button>
      
      <CustomDialog 
        :visible.sync="dialogVisible5"
        title="加载弹窗"
        width="400px"
        :loading="loading"
        loading-text="数据加载中，请稍候..."
        loading-size="50px"
        @load-success="handleLoadSuccess"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <p>这是加载完成后的内容。</p>
        <p>加载状态结束后自动显示。</p>
      </CustomDialog>
    </div>
    
    <div class="test-section">
      <h2>定位测试</h2>
      <el-button type="primary" @click="dialogVisible6 = true">居中弹窗</el-button>
      <el-button type="primary" @click="dialogVisible7 = true" style="margin-left: 10px;">右上角弹窗</el-button>
      <el-button type="primary" @click="dialogVisible8 = true" style="margin-left: 10px;">左下角弹窗</el-button>
      
      <CustomDialog 
        :visible.sync="dialogVisible6"
        title="居中弹窗"
        width="400px"
        position="center"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <p>这是居中显示的弹窗。</p>
      </CustomDialog>
      
      <CustomDialog 
        :visible.sync="dialogVisible7"
        title="右上角弹窗"
        width="400px"
        position="top-right"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <p>这是右上角显示的弹窗。</p>
      </CustomDialog>
      
      <CustomDialog 
        :visible.sync="dialogVisible8"
        title="左下角弹窗"
        width="400px"
        position="bottom-left"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <p>这是左下角显示的弹窗。</p>
      </CustomDialog>
    </div>
    
    <div class="test-section">
      <h2>拖拽功能</h2>
      <el-button type="primary" @click="dialogVisible9 = true">打开可拖拽弹窗</el-button>
      
      <CustomDialog 
        :visible.sync="dialogVisible9"
        title="可拖拽弹窗"
        width="500px"
        draggable
        @confirm="handleConfirm"
        @cancel="handleCancel"
        @drag-end="handleDragEnd"
      >
        <p>这是一个可拖拽的弹窗，点击标题栏可以拖动。</p>
        <p>拖拽范围限制在视口内。</p>
        <p>拖拽结束位置：{{ dragPosition.top }}px 顶部, {{ dragPosition.left }}px 左侧</p>
      </CustomDialog>
    </div>
    
    <div class="test-section">
      <h2>自定义插槽</h2>
      <el-button type="primary" @click="dialogVisible10 = true">打开自定义弹窗</el-button>
      
      <CustomDialog 
        :visible.sync="dialogVisible10"
        width="500px"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <!-- 自定义标题栏 -->
        <template #header>
          <div class="custom-header">
            <i class="el-icon-star-on" style="color: #409EFF; margin-right: 8px;"></i>
            <span style="font-weight: bold;">自定义标题</span>
            <el-button 
              type="text" 
              size="small" 
              @click="dialogVisible10 = false"
              style="margin-left: auto; color: #909399;"
            >
              关闭
            </el-button>
          </div>
        </template>
        
        <!-- 自定义内容 -->
        <div class="custom-content">
          <p>这是自定义的内容区域。</p>
          <el-form :model="formData" label-width="80px">
            <el-form-item label="姓名">
              <el-input v-model="formData.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="formData.age" type="number" placeholder="请输入年龄"></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 自定义底部按钮区 -->
        <template #footer>
          <el-button @click="dialogVisible10 = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </template>
      </CustomDialog>
    </div>
    
    <div class="test-section">
      <h2>响应式设计</h2>
      <p>在移动端（屏幕宽度 < 768px），弹窗会自动调整样式：</p>
      <ul>
        <li>宽度默认为 90%</li>
        <li>取消阴影效果</li>
        <li>增大边框圆角</li>
        <li>禁用拖拽功能</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DialogTest',
  
  data() {
    return {
      dialogVisible1: false,
      dialogVisible2: false,
      dialogVisible3: false,
      dialogVisible4: false,
      dialogVisible5: false,
      dialogVisible6: false,
      dialogVisible7: false,
      dialogVisible8: false,
      dialogVisible9: false,
      dialogVisible10: false,
      loading: false,
      dragPosition: { top: 0, left: 0 },
      formData: {
        name: '',
        age: ''
      }
    }
  },
  
  methods: {
    handleConfirm() {
      console.log('确认按钮被点击')
      this.dialogVisible1 = false
      this.dialogVisible2 = false
      this.dialogVisible3 = false
      this.dialogVisible4 = false
      this.dialogVisible5 = false
      this.dialogVisible6 = false
      this.dialogVisible7 = false
      this.dialogVisible8 = false
      this.dialogVisible9 = false
      this.dialogVisible10 = false
    },
    
    handleCancel() {
      console.log('取消按钮被点击')
      this.dialogVisible1 = false
      this.dialogVisible2 = false
      this.dialogVisible3 = false
      this.dialogVisible4 = false
      this.dialogVisible5 = false
      this.dialogVisible6 = false
      this.dialogVisible7 = false
      this.dialogVisible8 = false
      this.dialogVisible9 = false
      this.dialogVisible10 = false
    },
    
    handleLoading() {
      this.loading = true
      this.dialogVisible5 = true
      
      // 模拟加载过程
      setTimeout(() => {
        this.loading = false
      }, 2000)
    },
    
    handleLoadSuccess() {
      console.log('加载成功')
    },
    
    handleDragEnd(position) {
      this.dragPosition = position
      console.log('拖拽结束，位置：', position)
    },
    
    handleSubmit() {
      console.log('表单提交：', this.formData)
      this.dialogVisible10 = false
    }
  }
}
</script>

<style scoped>
.dialog-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.custom-header {
  display: flex;
  align-items: center;
  width: 100%;
}

.custom-content {
  padding: 20px 0;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  color: #606266;
}
</style>