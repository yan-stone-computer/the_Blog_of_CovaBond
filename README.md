# 个人博客系统

一个简单易用的Markdown博客系统，支持自动将Markdown文档转换为HTML博客文章。

## 🚀 快速开始

### 1. 创建文章

运行文章创建工具：

```bash
python new-post.py
```

按照提示输入文章信息即可。

### 2. 构建博客

```bash
python build.py
```

### 3. 查看效果

打开 `dist/index.html` 文件查看博客。

## 📝 文章格式

Markdown文件需要包含以下frontmatter：

```markdown
---
title: 文章标题
date: 2026-03-06
category: 技术
tags: [标签1, 标签2]
excerpt: 文章摘要
cover: https://via.placeholder.com/800x400
author: 博主
---

## 文章正文

这里是文章内容...
```

## 📁 项目结构

```
PersonalBlog/
├── posts/          # Markdown文章目录
├── templates/      # HTML模板
├── dist/           # 构建输出目录
├── css/            # 样式文件
├── js/             # JavaScript文件
├── new-post.py     # 文章创建工具
└── build.py        # 构建脚本
```

## ✨ 功能特性

- ✅ Markdown自动转HTML
- ✅ 代码语法高亮
- ✅ 响应式设计
- ✅ 文章分类和标签
- ✅ 自动生成文章索引
- ✅ 阅读时间计算

## 📖 详细文档

查看 [快速开始.md](快速开始.md) 了解更多使用方法。
