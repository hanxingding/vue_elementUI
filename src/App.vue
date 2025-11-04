<template>
  <div id="app" class="image-editor-container">
    <el-container>
      <!-- 顶部工具栏 -->
      <el-header class="editor-header">
        <div class="header-left">
          <el-button type="primary" @click="importImage">导入图片</el-button>
          <el-button @click="exportImage">导出图片</el-button>
          <el-button @click="exportPSDJSON">导出PSD JSON</el-button>
          <el-button @click="clearCanvas">清空画布</el-button>
        </div>
        <div class="header-right">
          <el-button @click="undo" :disabled="!canUndo">撤销</el-button>
          <el-button @click="redo" :disabled="!canRedo">重做</el-button>
        </div>
      </el-header>

      <!-- 主体内容区 -->
      <el-container>
        <!-- 左侧控制面板 -->
        <el-aside width="280px" class="editor-aside">
          <el-tabs v-model="activeTab" type="border-card">
            <!-- 基础编辑 -->
            <el-tab-pane label="基础编辑" name="basic">
              <el-collapse v-model="basicCollapse">
                <el-collapse-item title="裁剪" name="crop">
                  <div class="control-group">
                    <el-button @click="startCrop">开始裁剪</el-button>
                    <el-button @click="applyCrop">应用裁剪</el-button>
                    <el-button @click="cancelCrop">取消裁剪</el-button>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="旋转" name="rotate">
                  <div class="control-group">
                    <el-button @click="rotate(0)">0°</el-button>
                    <el-button @click="rotate(90)">90°</el-button>
                    <el-button @click="rotate(180)">180°</el-button>
                    <el-input-number v-model="customAngle" :min="0" :max="360" @change="rotateCustom"></el-input-number>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="缩放" name="scale">
                  <div class="control-group">
                    <el-slider v-model="scaleValue" :min="0.1" :max="3" :step="0.1" @change="scaleImage"></el-slider>
                    <span>{{ scaleValue.toFixed(1) }}x</span>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>

            <!-- 滤镜效果 -->
            <el-tab-pane label="滤镜效果" name="filter">
              <el-collapse v-model="filterCollapse">
                <el-collapse-item title="黑白" name="grayscale">
                  <el-slider v-model="grayscaleValue" :min="0" :max="100" @change="applyGrayscale"></el-slider>
                </el-collapse-item>
                <el-collapse-item title="复古" name="sepia">
                  <el-slider v-model="sepiaValue" :min="0" :max="100" @change="applySepia"></el-slider>
                </el-collapse-item>
                <el-collapse-item title="模糊" name="blur">
                  <el-slider v-model="blurValue" :min="0" :max="20" :step="1" @change="applyBlur"></el-slider>
                </el-collapse-item>
                <el-collapse-item title="亮度" name="brightness">
                  <el-slider v-model="brightnessValue" :min="-100" :max="100" @change="applyBrightness"></el-slider>
                </el-collapse-item>
                <el-collapse-item title="对比度" name="contrast">
                  <el-slider v-model="contrastValue" :min="-100" :max="100" @change="applyContrast"></el-slider>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>

            <!-- 图层管理 -->
            <el-tab-pane label="图层管理" name="layers">
              <div class="control-group">
                <el-button @click="addTextLayer">添加文字</el-button>
                <el-button @click="addShapeLayer">添加形状</el-button>
                <el-button @click="deleteLayer">删除选中图层</el-button>
              </div>
              <el-tree
                :data="layersTree"
                :props="treeProps"
                @node-click="selectLayer"
              ></el-tree>
            </el-tab-pane>

            <!-- 背景设置 -->
            <el-tab-pane label="背景设置" name="background">
              <div class="control-group">
                <el-color-picker v-model="bgColor" @change="changeBackground"></el-color-picker>
                <el-button @click="clearBackground">清除背景</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-aside>

        <!-- 画布区域 -->
        <el-main class="editor-main">
          <div class="canvas-wrapper">
            <canvas ref="canvas" id="imageCanvas" width="800" height="600"></canvas>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 文字编辑弹窗 -->
    <el-dialog title="编辑文字" :visible.sync="textDialogVisible" width="400px">
      <el-input v-model="textContent" placeholder="输入文字内容"></el-input>
      <el-input-number v-model="textSize" :min="12" :max="100" style="margin-top: 10px;"></el-input-number>
      <el-color-picker v-model="textColor" style="margin-top: 10px;"></el-color-picker>
      <span slot="footer" class="dialog-footer">
        <el-button @click="textDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateTextLayer">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as fabric from 'fabric'

export default {
  name: 'App',
  data() {
    return {
      canvas: null,
      activeObject: null,
      history: [],
      historyIndex: -1,
      cropMode: false,
      cropTarget: null,
      cropRect: null,
      activeTab: 'basic',
      basicCollapse: ['crop', 'rotate', 'scale'],
      filterCollapse: ['grayscale', 'sepia', 'blur', 'brightness', 'contrast'],
      customAngle: 0,
      scaleValue: 1,
      grayscaleValue: 0,
      sepiaValue: 0,
      blurValue: 0,
      brightnessValue: 0,
      contrastValue: 0,
      bgColor: '#ffffff',
      layersTree: [],
      treeProps: {
        label: 'name',
        children: 'children'
      },
      textDialogVisible: false,
      textContent: '',
      textSize: 24,
      textColor: '#000000'
    }
  },
  computed: {
    canUndo() {
      return this.historyIndex > 0
    },
    canRedo() {
      return this.historyIndex < this.history.length - 1
    }
  },
  mounted() {
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.Canvas('imageCanvas')
      this.saveHistory()
    },
    importImage() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = (event) => {
          fabric.Image.fromURL(event.target.result, (img) => {
            this.canvas.clear()
            this.canvas.add(img)
            this.canvas.centerObject(img)
            this.saveHistory()
          })
        }
        reader.readAsDataURL(file)
      }
      input.click()
    },
    exportImage() {
      this.$prompt('请输入文件名', '导出图片', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: 'edited-image',
        selectable: true
      }).then(({ value }) => {
        this.$confirm('选择导出格式', '格式选择', {
          confirmButtonText: 'PNG',
          cancelButtonText: 'JPG',
          type: 'info'
        }).then(() => {
          const dataURL = this.canvas.toDataURL({ format: 'png', quality: 1 })
          const link = document.createElement('a')
          link.download = `${value}.png`
          link.href = dataURL
          link.click()
        }).catch(() => {
          this.$prompt('请输入质量(0-100)', 'JPG质量', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^[0-9]+$/,
            inputValue: '80',
            inputErrorMessage: '请输入有效的数字'
          }).then(({ value }) => {
            const quality = parseInt(value) / 100
            const dataURL = this.canvas.toDataURL({ format: 'jpg', quality: quality })
            const link = document.createElement('a')
            link.download = `${value}.jpg`
            link.href = dataURL
            link.click()
          }).catch(() => {
            // 取消JPG导出
          })
        })
      }).catch(() => {
        // 取消导出
      })
    },
    exportPSDJSON() {
      const json = this.canvas.toJSON()
      const dataStr = JSON.stringify(json, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'layers.json'
      link.click()
      URL.revokeObjectURL(url)
    },
    clearCanvas() {
      this.canvas.clear()
      this.saveHistory()
    },
    saveHistory() {
      // 限制历史记录数量
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      this.history.push(JSON.stringify(this.canvas))
      this.historyIndex++
      // 最多保留50条历史记录
      if (this.history.length > 50) {
        this.history.shift()
        this.historyIndex--
      }
    },
    undo() {
      if (this.canUndo) {
        this.historyIndex--
        this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
          this.canvas.renderAll()
        })
      }
    },
    redo() {
      if (this.canRedo) {
        this.historyIndex++
        this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
          this.canvas.renderAll()
        })
      }
    },
    startCrop() {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject || !(activeObject instanceof fabric.Image)) {
        this.$message.warning('请先选择一张图片')
        return
      }
      
      // 创建裁剪框
      const cropRect = new fabric.Rect({
        left: activeObject.left + 50,
        top: activeObject.top + 50,
        width: activeObject.width - 100,
        height: activeObject.height - 100,
        fill: 'rgba(0, 0, 0, 0.3)',
        stroke: 'red',
        strokeWidth: 2,
        selectable: true,
        hasRotatingPoint: false,
        hasControls: true
      })
      
      this.canvas.add(cropRect)
      this.canvas.setActiveObject(cropRect)
      this.cropMode = true
      this.cropTarget = activeObject
      this.cropRect = cropRect
    },
    applyCrop() {
      if (!this.cropMode || !this.cropTarget || !this.cropRect) {
        return
      }
      
      const img = this.cropTarget
      const rect = this.cropRect
      
      // 计算裁剪区域
      const scaleX = img.width / img.getScaledWidth()
      const scaleY = img.height / img.getScaledHeight()
      
      const cropX = (rect.left - img.left) * scaleX
      const cropY = (rect.top - img.top) * scaleY
      const cropWidth = rect.width * scaleX
      const cropHeight = rect.height * scaleY
      
      // 创建新的裁剪后的图片
      const croppedImg = new fabric.Image(img._element, {
        left: img.left,
        top: img.top,
        width: cropWidth,
        height: cropHeight,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        cropX: cropX,
        cropY: cropY,
        cropWidth: cropWidth,
        cropHeight: cropHeight
      })
      
      this.canvas.remove(img)
      this.canvas.remove(rect)
      this.canvas.add(croppedImg)
      this.canvas.setActiveObject(croppedImg)
      
      this.cropMode = false
      this.cropTarget = null
      this.cropRect = null
      this.saveHistory()
    },
    cancelCrop() {
      if (this.cropRect) {
        this.canvas.remove(this.cropRect)
        this.cropRect = null
      }
      this.cropMode = false
      this.cropTarget = null
    },
    rotate(angle) {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.rotate(angle)
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    rotateCustom() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.rotate(this.customAngle)
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    scaleImage() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.scale(this.scaleValue)
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    applyGrayscale() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.filters = [new fabric.Image.filters.Grayscale({ value: this.grayscaleValue / 100 })]
        activeObject.applyFilters()
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    applySepia() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.filters = [new fabric.Image.filters.Sepia({ value: this.sepiaValue / 100 })]
        activeObject.applyFilters()
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    applyBlur() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.filters = [new fabric.Image.filters.Blur({ value: this.blurValue })]
        activeObject.applyFilters()
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    applyBrightness() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.filters = [new fabric.Image.filters.Brightness({ brightness: this.brightnessValue / 100 })]
        activeObject.applyFilters()
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    applyContrast() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.filters = [new fabric.Image.filters.Contrast({ contrast: this.contrastValue / 100 })]
        activeObject.applyFilters()
        this.canvas.renderAll()
        this.saveHistory()
      }
    },
    addTextLayer() {
      this.textDialogVisible = true
    },
    updateTextLayer() {
      const text = new fabric.Text(this.textContent, {
        left: 100,
        top: 100,
        fontSize: this.textSize,
        fill: this.textColor
      })
      this.canvas.add(text)
      this.textDialogVisible = false
      this.saveHistory()
    },
    addShapeLayer() {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 100,
        height: 100,
        stroke: 'black',
        strokeWidth: 2
      })
      this.canvas.add(rect)
      this.saveHistory()
    },
    deleteLayer() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        this.canvas.remove(activeObject)
        this.saveHistory()
      }
    },
    selectLayer(data) {
      // 图层选择功能待完善
      this.$message.info('图层选择功能开发中...')
    },
    changeBackground() {
      this.canvas.setBackgroundColor(this.bgColor, this.canvas.renderAll.bind(this.canvas))
      this.saveHistory()
    },
    clearBackground() {
      this.canvas.setBackgroundColor('', this.canvas.renderAll.bind(this.canvas))
      this.saveHistory()
    }
  }
}
</script>

<style>
.image-editor-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.editor-header {
  background-color: #333;
  color: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left, .header-right {
  display: flex;
  gap: 10px;
}

.editor-aside {
  background-color: #f5f5f5;
  padding: 10px;
  overflow-y: auto;
}

.editor-main {
  padding: 20px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-wrapper {
  border: 1px solid #ddd;
  background-color: #fafafa;
}

.control-group {
  margin-bottom: 15px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.el-collapse-item__content {
  padding: 10px 0;
}
</style>
