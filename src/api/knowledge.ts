import { request } from '@/utils/request'

export interface KnowledgeCategory {
  id: number
  categoryName: string
  description: string
  sortOrder: number
  status: number
  statusText: string
  articleCount: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgeArticle {
  id: number
  title: string
  categoryId: number
  categoryName: string
  content: string
  status: number
  statusText: string
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgeCategoryList {
  code: number | string
  message?: string
  msg?: string
  data: KnowledgeCategory[]
}

export interface KnowledgeArticleList {
  code: number | string
  message?: string
  msg?: string
  data: {
    list: KnowledgeArticle[]
    total: number
  }
}

export const knowledgeApi = {
  // 获取知识分类选择器
  getCategoryList() {
    return request.get<KnowledgeCategoryList>('/knowledge/category/tree')
  },
  
  // 获取知识文章列表（带分页）
  getKnowledgeList(params: {
    page?: number
    pageSize?: number
    title?: string
    categoryId?: number
    status?: number
  }) {
    return request.get<KnowledgeArticleList>('/knowledge/article/page', params)
  },
  
  // 获取单个知识分类详情
  getCategoryDetail(id: number) {
    return request.get<KnowledgeCategory>(`/knowledge/category/${id}`)
  },
  
  // 创建知识分类
  createCategory(data: {
    categoryName: string
    description: string
    sortOrder?: number
    status?: number
  }) {
    return request.post<KnowledgeCategory>('/knowledge/category', data)
  },
  
  // 更新知识分类
  updateCategory(id: number, data: {
    categoryName?: string
    description?: string
    sortOrder?: number
    status?: number
  }) {
    return request.put<KnowledgeCategory>(`/knowledge/category/${id}`, data)
  },
  
  // 删除知识分类
  deleteCategory(id: number) {
    return request.delete<{ code: number; msg: string }>(`/knowledge/category/${id}`)
  }
}