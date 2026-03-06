import os
import sys
from datetime import datetime
from pathlib import Path

def create_article():
    print("\n" + "="*50)
    print("📝 创建新文章")
    print("="*50 + "\n")
    
    title = input("文章标题: ").strip()
    if not title:
        print("❌ 标题不能为空！")
        return
    
    print("\n分类选项:")
    print("1. 技术")
    print("2. 生活")
    print("3. 学习")
    print("4. 其他")
    category_choice = input("\n选择分类 (1-4): ").strip()
    
    category_map = {
        '1': '技术',
        '2': '生活',
        '3': '学习',
        '4': '其他'
    }
    category = category_map.get(category_choice, '其他')
    
    tags_input = input("\n标签 (用逗号分隔，如: JavaScript,前端,教程): ").strip()
    tags = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
    
    excerpt = input("\n文章摘要: ").strip()
    if not excerpt:
        excerpt = "这是一篇精彩的文章..."
    
    cover = input("\n封面图片URL (直接回车使用默认): ").strip()
    if not cover:
        cover = "https://via.placeholder.com/800x400"
    
    author = input("\n作者名称 (直接回车使用'博主'): ").strip()
    if not author:
        author = "博主"
    
    print("\n" + "="*50)
    print("📝 文章内容")
    print("="*50)
    print("提示: 输入完成后，在新行输入 'END' 并回车结束\n")
    
    content_lines = []
    while True:
        line = input()
        if line.strip() == 'END':
            break
        content_lines.append(line)
    
    content = '\n'.join(content_lines)
    
    date = datetime.now().strftime('%Y-%m-%d')
    
    slug = ''.join(c for c in title.lower() if c.isalnum() or c in (' ', '-', '_'))
    slug = slug.replace(' ', '-')
    
    filename = f"{slug}.md"
    filepath = Path("posts") / filename
    
    frontmatter = f"""---
title: {title}
date: {date}
category: {category}
tags: [{', '.join(tags)}]
excerpt: {excerpt}
cover: {cover}
author: {author}
---

"""
    
    full_content = frontmatter + content
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)
    
    print("\n" + "="*50)
    print("✅ 文章创建成功！")
    print("="*50)
    print(f"文件位置: {filepath}")
    print(f"文件名: {filename}")
    print("\n下一步:")
    print("1. 运行 'python build.py' 构建博客")
    print("2. 打开 'dist/index.html' 查看效果")
    print("="*50 + "\n")

def main():
    posts_dir = Path("posts")
    if not posts_dir.exists():
        posts_dir.mkdir()
        print("✅ 已创建 posts 目录")
    
    while True:
        print("\n" + "="*50)
        print("📚 博客文章管理工具")
        print("="*50)
        print("1. 创建新文章")
        print("2. 查看现有文章")
        print("3. 退出")
        print("="*50)
        
        choice = input("\n请选择操作 (1-3): ").strip()
        
        if choice == '1':
            create_article()
        elif choice == '2':
            posts = list(posts_dir.glob("*.md"))
            if posts:
                print("\n现有文章:")
                for i, post in enumerate(posts, 1):
                    print(f"{i}. {post.name}")
            else:
                print("\n暂无文章")
        elif choice == '3':
            print("\n👋 再见！\n")
            break
        else:
            print("\n❌ 无效选择，请重试")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 已取消操作\n")
        sys.exit(0)
