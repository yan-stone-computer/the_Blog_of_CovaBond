document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
});

function initAdmin() {
    initTabs();
    initTagInput();
    initForm();
    loadPosts();
}

function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(`${tabName}-tab`).style.display = 'block';
        });
    });
}

function initTagInput() {
    const tagInput = document.getElementById('tag-input');
    const tagContainer = document.getElementById('tag-container');
    let tags = [];
    
    tagInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = this.value.trim();
            
            if (tag && !tags.includes(tag)) {
                tags.push(tag);
                renderTags();
                this.value = '';
            }
        }
    });
    
    function renderTags() {
        const tagElements = tags.map(tag => `
            <span class="tag-item">
                ${tag}
                <button type="button" onclick="removeTag('${tag}')">&times;</button>
            </span>
        `).join('');
        
        tagContainer.innerHTML = tagElements + `<input type="text" class="tag-input" id="tag-input" placeholder="输入标签后按回车添加">`;
        
        const newTagInput = document.getElementById('tag-input');
        newTagInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = this.value.trim();
                
                if (tag && !tags.includes(tag)) {
                    tags.push(tag);
                    renderTags();
                    this.value = '';
                }
            }
        });
    }
    
    window.removeTag = function(tag) {
        tags = tags.filter(t => t !== tag);
        renderTags();
    };
    
    window.getTags = function() {
        return tags;
    };
    
    window.resetTags = function() {
        tags = [];
        renderTags();
    };
}

function initForm() {
    const form = document.getElementById('article-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            tags: getTags(),
            excerpt: document.getElementById('excerpt').value,
            cover: document.getElementById('cover').value || 'https://via.placeholder.com/800x400',
            content: document.getElementById('content').value
        };
        
        if (!formData.title || !formData.category || !formData.excerpt || !formData.content) {
            alert('请填写所有必填项！');
            return;
        }
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                alert('文章保存成功！');
                resetForm();
                loadPosts();
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            console.error('保存文章失败:', error);
            alert('保存失败，请检查后端服务是否启动');
        }
    });
}

function resetForm() {
    document.getElementById('article-form').reset();
    resetTags();
}

async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        
        renderPosts(posts);
    } catch (error) {
        console.error('加载文章列表失败:', error);
    }
}

function renderPosts(posts) {
    const postsList = document.getElementById('posts-list');
    const emptyState = document.querySelector('.empty-state');
    
    if (posts.length === 0) {
        postsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-item-info">
                <h3>${post.title}</h3>
                <div class="post-item-meta">
                    <span>${post.date}</span>
                    <span>•</span>
                    <span>${post.category}</span>
                    <span>•</span>
                    <span>${post.reading_time}分钟阅读</span>
                </div>
            </div>
            <div class="post-item-actions">
                <button class="btn-edit" onclick="editPost('${post.slug}')">编辑</button>
                <button class="btn-delete" onclick="deletePost('${post.slug}')">删除</button>
            </div>
        </div>
    `).join('');
}

async function deletePost(slug) {
    if (!confirm('确定要删除这篇文章吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/posts/${slug}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('文章删除成功！');
            loadPosts();
        } else {
            throw new Error('删除失败');
        }
    } catch (error) {
        console.error('删除文章失败:', error);
        alert('删除失败');
    }
}

function editPost(slug) {
    alert('编辑功能开发中...');
}
