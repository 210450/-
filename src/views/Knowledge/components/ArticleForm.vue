<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="articleFormRef"
      :model="articleForm"
      :rules="articleRules"
      label-width="100px"
    >
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="articleForm.title"
          placeholder="请输入文章标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="所属分类" prop="categoryId">
        <el-select
          v-model="articleForm.categoryId"
          placeholder="请选择分类"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.categoryName"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="文章摘要" prop="summary">
        <el-input
          v-model="articleForm.summary"
          type="textarea"
          placeholder="请输入文章摘要"
          maxlength="200"
          show-word-limit
          :rows="3"
        />
      </el-form-item>
      
      <el-form-item label="标签">
        <el-select
          v-model="articleForm.tags"
          multiple
          placeholder="请选择标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="封面图片">
        <div class="cover-upload">
          <div class="cover-image-wrapper">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
              :disabled="!!articleForm.coverImage"
            >
              <img
                v-if="articleForm.coverImage"
                :src="articleForm.coverImage"
                class="avatar"
                alt="封面图片"
                style="display: block; width: 100%; height: 100%; object-fit: cover;"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <el-button
              v-if="articleForm.coverImage"
              type="danger"
              size="small"
              @click="handleRemoveCover"
              class="remove-cover-btn"
            >
              移除封面
            </el-button>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="文章内容" prop="content">
        <div style="border: 1px solid #dcdfe6; border-radius: 4px;">
          <Toolbar
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            mode="default"
            style="border-bottom: 1px solid #dcdfe6;"
          />
          <Editor
            :defaultConfig="editorConfig"
            v-model="articleForm.content"
            mode="default"
            style="height: 400px; overflow-y: hidden;"
            @onCreated="handleCreated"
          />
        </div>
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="articleForm.status">
          <el-radio :label="1">已发布</el-radio>
          <el-radio :label="0">草稿</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount, shallowRef, defineAsyncComponent } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeCategory, KnowledgeArticle } from '@/api/knowledge'
import '@wangeditor/editor/dist/css/style.css'

// 动态导入 WangEditor 组件
const Editor = defineAsyncComponent(() => import('@wangeditor/editor-for-vue').then(m => m.Editor))
const Toolbar = defineAsyncComponent(() => import('@wangeditor/editor-for-vue').then(m => m.Toolbar))

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '新增文章'
  },
  categories: {
    type: Array as () => KnowledgeCategory[],
    default: () => []
  },
  article: {
    type: Object as () => KnowledgeArticle | null,
    default: null
  }
})

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: any): void
  (e: 'close'): void
}>()

// 表单引用
const articleFormRef = ref()

// 编辑器实例
const editorRef = shallowRef()

// 编辑器配置
const editorConfig = {
  placeholder: '请输入文章内容...',
  MENU_CONF: {
    uploadImage: {
      fieldName: 'file',
      server: '/api/upload',
      maxFileSize: 5 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      metaWithUrl: false,
      customInsert(res: any, insertFn: any) {
        insertFn(res.data.url)
      }
    }
  }
}

// 工具栏配置
const toolbarConfig = {}

// 处理编辑器创建
const handleCreated = (editor: any) => {
  editorRef.value = editor
}

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 对话框状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogTitle = computed(() => props.title)

// 文章表单
const articleForm = reactive({
  id: '',
  title: '',
  categoryId: '',
  summary: '',
  tags: [] as string[],
  coverImage: '',
  content: '',
  status: 1
})

// 监听 article 属性变化，填充表单数据
watch(() => props.article, (newArticle) => {
  if (newArticle) {
    // 编辑模式，填充表单数据
    articleForm.id = newArticle.id.toString() // 转换为字符串
    articleForm.title = newArticle.title
    articleForm.categoryId = newArticle.categoryId.toString() // 转换为字符串
    articleForm.summary = newArticle.summary || ''
    articleForm.tags = newArticle.tags ? newArticle.tags.split(',') : [] // 转换为数组
    articleForm.coverImage = newArticle.coverImage || ''
    articleForm.content = newArticle.content || ''
    articleForm.status = newArticle.status
  } else {
    // 新增模式，清空表单
    articleForm.id = ''
    articleForm.title = ''
    articleForm.categoryId = ''
    articleForm.summary = ''
    articleForm.tags = []
    articleForm.coverImage = ''
    articleForm.content = ''
    articleForm.status = 1
  }
}, { immediate: true })

// 标签选项
const tagOptions = [
  '情绪管理',
  '焦虑',
  '抑郁',
  '压力',
  '睡眠',
  '冥想',
  '正念',
  '放松',
  '心理健康',
  '自我成长',
  '人际关系',
  '工作压力',
  '学习方法',
  '生活技巧'
]

// 表单验证规则
const articleRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择所属分类', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 处理图片上传
const handleImageChange = (file: any) => {
  console.log('图片上传:', file)
  if (file.raw) {
    // 使用 URL.createObjectURL 更简单直接
    articleForm.coverImage = URL.createObjectURL(file.raw)
    console.log('封面图片设置:', articleForm.coverImage)
  }
}

// 处理移除封面
const handleRemoveCover = () => {
  articleForm.coverImage = ''
}

// 处理表单提交
const handleSubmit = async () => {
  if (!articleFormRef.value) return
  
  try {
    await articleFormRef.value.validate()
    
    // 准备提交数据
      const submitData = {
        title: articleForm.title,
        categoryId: Number(articleForm.categoryId),
        summary: articleForm.summary,
        tags: articleForm.tags.join(','), // 转换为逗号分隔的字符串
        coverImage: articleForm.coverImage,
        content: articleForm.content,
        status: articleForm.status,
        id: articleForm.id // 确保传递 id
      }
      
      let res
      if (articleForm.id) {
        // 更新文章
        res = await knowledgeApi.updateArticle(articleForm.id, submitData)
      } else {
        // 创建文章
        res = await knowledgeApi.createArticle(submitData)
      }
    
    emit('submit', res.data)
  } catch (error: any) {
    console.error('提交失败:', error)
  }
}

// 处理对话框关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.cover-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cover-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-uploader {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #c0c4cc;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-cover-btn {
  margin-top: 5px;
  width: 100px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
