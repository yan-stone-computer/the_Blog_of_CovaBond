document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
});

let isAuthenticated = false;
let authCode = '';

function initAdmin() {
    checkAuth();
    initTabs();
    initTagInput();
    initForm();
    initImageUpload();
    loadPosts();
}

function checkAuth() {
    const savedAuth = sessionStorage.getItem('authCode');
    if (savedAuth) {
        authCode = savedAuth;
        isAuthenticated = true;
    } else {
        showAuthModal();
    }
}

function showAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h2>🔐 授权验证</h2>
            <p>请输入授权码以访问管理功能</p>
            <input type="password" id="auth-input" placeholder="输入授权码" autofocus>
            <button onclick="verifyAuth()">验证</button>
            <p class="auth-hint">提示：授权码为 gaojunjie2026</p>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('auth-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyAuth();
        }
    });
}

async function verifyAuth() {
    const input = document.getElementById('auth-input');
    const code = input.value;
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isAuthenticated = true;
            authCode = code;
            sessionStorage.setItem('authCode', code);
            
            const modal = document.querySelector('.auth-modal');
            if (modal) {
                modal.remove();
            }
            
            alert('✅ 授权成功！');
        } else {
            alert('❌ 授权码错误，请重试');
            input.value = '';
            input.focus();
        }
    } catch (error) {
        console.error('验证失败:', error);
        alert('验证失败，请检查服务器是否启动');
    }
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
    let tags = [];
    
    if (tagInput) {
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
    }
    
    function renderTags() {
        const tagContainer = document.getElementById('tag-container');
        if (!tagContainer) return;
        
        const tagElements = tags.map(tag => `
            <span class="tag-item">
                ${tag}
                <button type="button" onclick="removeTag('${tag}')">&times;</button>
            </span>
        `).join('');
        
        tagContainer.innerHTML = tagElements + `<input type="text" class="tag-input" id="tag-input" placeholder="输入标签后按回车添加">`;
        
        const newTagInput = document.getElementById('tag-input');
        if (newTagInput) {
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

function initImageUpload() {
    const coverInput = document.getElementById('cover');
    const uploadBtn = document.getElementById('upload-cover-btn');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        coverInput.value = data.url;
                        alert('✅ 图片上传成功！');
                    } else {
                        alert('❌ 上传失败：' + data.error);
                    }
                } catch (error) {
                    console.error('上传失败:', error);
                    alert('上传失败，请检查服务器');
                }
            };
            
            input.click();
        });
    }
}

function initForm() {
    const form = document.getElementById('article-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!isAuthenticated) {
                alert('请先完成授权验证');
                showAuthModal();
                return;
            }
            
            const formData = {
                authCode: authCode,
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
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('✅ 文章保存成功！');
                    resetForm();
                    loadPosts();
                } else {
                    throw new Error(data.error || '保存失败');
                }
            } catch (error) {
                console.error('保存文章失败:', error);
                alert('❌ 保存失败：' + error.message);
            }
        });
    }
}

function resetForm() {
    const form = document.getElementById('article-form');
    if (form) {
        form.reset();
    }
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
    
    if (!postsList) return;
    
    if (posts.length === 0) {
        postsList.innerHTML = '';
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
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
                <button class="btn-delete" onclick="deletePost('${post.slug}')">删除</button>
            </div>
        </div>
    `).join('');
}

async function deletePost(slug) {
    if (!isAuthenticated) {
        alert('请先完成授权验证');
        showAuthModal();
        return;
    }
    
    if (!confirm('确定要删除这篇文章吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/posts/${slug}?authCode=${authCode}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ 文章删除成功！');
            loadPosts();
        } else {
            throw new Error(data.error || '删除失败');
        }
    } catch (error) {
        console.error('删除文章失败:', error);
        alert('❌ 删除失败：' + error.message);
    }
}
