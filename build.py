import os
import re
import json
import shutil
from datetime import datetime
from pathlib import Path

try:
    import markdown
except ImportError:
    print("正在安装 markdown 库...")
    os.system("pip install markdown")
    import markdown

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    print("提示: 安装 watchdog 库可以启用自动监听功能: pip install watchdog")

class BlogBuilder:
    def __init__(self):
        self.posts_dir = Path("posts")
        self.output_dir = Path("dist/posts")
        self.template_dir = Path("templates")
        self.posts_data = []
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def parse_frontmatter(self, content):
        """解析Markdown文件的frontmatter"""
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter_str = parts[1].strip()
                body = parts[2].strip()
                
                frontmatter = {}
                for line in frontmatter_str.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        key = key.strip()
                        value = value.strip()
                        
                        if value.startswith('[') and value.endswith(']'):
                            value = [item.strip() for item in value[1:-1].split(',')]
                        elif value.startswith('"') and value.endswith('"'):
                            value = value[1:-1]
                        
                        frontmatter[key] = value
                
                return frontmatter, body
        
        return {}, content
    
    def markdown_to_html(self, md_content):
        """将Markdown转换为HTML"""
        md = markdown.Markdown(extensions=[
            'fenced_code',
            'codehilite',
            'tables',
            'toc'
        ])
        return md.convert(md_content)
    
    def generate_slug(self, title):
        """生成URL友好的slug"""
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[\s]+', '-', slug)
        return slug
    
    def calculate_reading_time(self, content):
        """计算阅读时间（分钟）"""
        word_count = len(content.split())
        return max(1, word_count // 200)
    
    def load_template(self, template_name):
        """加载HTML模板"""
        template_path = self.template_dir / f"{template_name}.html"
        if template_path.exists():
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        return ""
    
    def build_post(self, md_file):
        """构建单篇文章"""
        print(f"正在处理: {md_file.name}")
        
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        frontmatter, body = self.parse_frontmatter(content)
        
        title = frontmatter.get('title', '未命名文章')
        date = frontmatter.get('date', datetime.now().strftime('%Y-%m-%d'))
        category = frontmatter.get('category', '未分类')
        tags = frontmatter.get('tags', [])
        excerpt = frontmatter.get('excerpt', body[:150] + '...')
        cover = frontmatter.get('cover', 'https://via.placeholder.com/800x400')
        author = frontmatter.get('author', '博主')
        reading_time = frontmatter.get('reading_time', self.calculate_reading_time(body))
        
        html_content = self.markdown_to_html(body)
        
        slug = self.generate_slug(title)
        output_file = self.output_dir / f"{slug}.html"
        
        post_data = {
            'title': title,
            'date': date,
            'category': category,
            'tags': tags,
            'excerpt': excerpt,
            'cover': cover,
            'author': author,
            'reading_time': reading_time,
            'slug': slug,
            'url': f"posts/{slug}.html"
        }
        
        template = self.load_template('post')
        if template:
            html = template.format(
                title=title,
                date=date,
                category=category,
                tags=', '.join(tags) if isinstance(tags, list) else tags,
                excerpt=excerpt,
                cover=cover,
                author=author,
                reading_time=reading_time,
                content=html_content,
                slug=slug
            )
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html)
        
        return post_data
    
    def build_all_posts(self):
        """构建所有文章"""
        self.posts_data = []
        
        md_files = sorted(self.posts_dir.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)
        
        for md_file in md_files:
            post_data = self.build_post(md_file)
            self.posts_data.append(post_data)
        
        print(f"共构建 {len(self.posts_data)} 篇文章")
    
    def generate_index_data(self):
        """生成索引数据文件"""
        data_file = Path("dist/posts.json")
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(self.posts_data, f, ensure_ascii=False, indent=2)
        
        print(f"已生成文章索引: {data_file}")
    
    def copy_static_files(self):
        """复制静态文件"""
        if Path("css").exists():
            if Path("dist/css").exists():
                shutil.rmtree("dist/css")
            shutil.copytree("css", "dist/css")
        
        if Path("js").exists():
            if Path("dist/js").exists():
                shutil.rmtree("dist/js")
            shutil.copytree("js", "dist/js")
        
        if Path("index.html").exists():
            shutil.copy("index.html", "dist/index.html")
        
        if Path("blog.html").exists():
            shutil.copy("blog.html", "dist/blog.html")
        
        print("已复制静态文件")
    
    def build(self):
        """执行完整构建"""
        print("开始构建博客...")
        
        self.build_all_posts()
        self.generate_index_data()
        self.copy_static_files()
        
        print("构建完成！")


class WatchHandler(FileSystemEventHandler):
    def __init__(self, builder):
        self.builder = builder
    
    def on_modified(self, event):
        if event.src_path.endswith('.md'):
            print(f"\n检测到文件变化: {event.src_path}")
            self.builder.build()
    
    def on_created(self, event):
        if event.src_path.endswith('.md'):
            print(f"\n检测到新文件: {event.src_path}")
            self.builder.build()


def main():
    import sys
    
    builder = BlogBuilder()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--watch':
        if WATCHDOG_AVAILABLE:
            print("启动监听模式，监听 posts 目录变化...")
            print("按 Ctrl+C 停止监听\n")
            
            event_handler = WatchHandler(builder)
            observer = Observer()
            observer.schedule(event_handler, 'posts', recursive=False)
            observer.start()
            
            builder.build()
            
            try:
                while True:
                    pass
            except KeyboardInterrupt:
                observer.stop()
                print("\n停止监听")
            
            observer.join()
        else:
            print("错误: 需要安装 watchdog 库才能使用监听模式")
            print("请运行: pip install watchdog")
    else:
        builder.build()


if __name__ == "__main__":
    main()
