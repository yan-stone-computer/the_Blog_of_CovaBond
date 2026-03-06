from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime
from pathlib import Path
import re

app = Flask(__name__)
CORS(app)

POSTS_DIR = Path('posts')
DIST_DIR = Path('dist')

@app.route('/')
def index():
    return send_from_directory(DIST_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('posts/') and path.endswith('.html'):
        return send_from_directory(DIST_DIR, path)
    elif path.endswith(('.css', '.js', '.html', '.json')):
        return send_from_directory(DIST_DIR, path)
    else:
        return send_from_directory(DIST_DIR, path)

@app.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        with open(DIST_DIR / 'posts.json', 'r', encoding='utf-8') as f:
            posts = json.load(f)
        return jsonify(posts)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    
    title = data.get('title')
    category = data.get('category')
    tags = data.get('tags', [])
    excerpt = data.get('excerpt')
    cover = data.get('cover', 'https://via.placeholder.com/800x400')
    content = data.get('content')
    
    if not all([title, category, excerpt, content]):
        return jsonify({'error': '缺少必填字段'}), 400
    
    date = datetime.now().strftime('%Y-%m-%d')
    
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[\s]+', '-', slug)
    
    frontmatter = f"""---
title: {title}
date: {date}
category: {category}
tags: [{', '.join(tags)}]
excerpt: {excerpt}
cover: {cover}
author: 高俊杰
reading_time: {max(1, len(content.split()) // 200)}
---

"""
    
    full_content = frontmatter + content
    
    filepath = POSTS_DIR / f"{slug}.md"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)
    
    import subprocess
    subprocess.run(['python', 'build.py'], check=True)
    
    return jsonify({'message': '文章创建成功', 'slug': slug}), 201

@app.route('/api/posts/<slug>', methods=['DELETE'])
def delete_post(slug):
    filepath = POSTS_DIR / f"{slug}.md"
    
    if not filepath.exists():
        return jsonify({'error': '文章不存在'}), 404
    
    os.remove(filepath)
    
    import subprocess
    subprocess.run(['python', 'build.py'], check=True)
    
    return jsonify({'message': '文章删除成功'})

if __name__ == '__main__':
    POSTS_DIR.mkdir(exist_ok=True)
    DIST_DIR.mkdir(exist_ok=True)
    
    print("🚀 博客服务器启动中...")
    print("📝 文章管理: http://localhost:5000/admin.html")
    print("🌐 博客首页: http://localhost:5000")
    print("\n按 Ctrl+C 停止服务器\n")
    
    app.run(debug=True, port=5000)
