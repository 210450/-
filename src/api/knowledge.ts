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
  summary?: string
  coverImage?: string
  tags?: string
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

export interface KnowledgeArticleResponse {
  code: number | string
  message?: string
  msg?: string
  data: KnowledgeArticle
}

export const knowledgeApi = {
  // 获取知识分类选择器
  getCategoryList() {
    return request.get<KnowledgeCategoryList>('/knowledge/category/tree')
  },
  
  // 获取知识文章列表（带分页）
  getKnowledgeList(params: {
    current?: number
    size?: number
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
  },
  
  // 创建知识文章
  createArticle(data: {
    title: string
    categoryId: number
    summary: string
    tags: string
    coverImage: string
    content: string
    id: string
  }) {
    return request.post<KnowledgeArticleResponse>('/knowledge/article', data)
  },
  
  // 更新知识文章
  updateArticle(id: string, data: {
    title: string
    categoryId: number
    summary: string
    tags: string
    coverImage: string
    content: string
    id: string
  }) {
    return request.put<KnowledgeArticleResponse>(`/knowledge/article/${id}`, data)
  },

  // 删除知识文章
  deleteArticle(id: string) {
    return request.delete<{ code: number; msg: string }>(`/knowledge/article/${id}`)
  }
}