document.addEventListener('DOMContentLoaded', function() {
    initPostEditor();
});

let isAuthenticated = false;
let authCode = '';

function initPostEditor() {
    const addBtn = document.getElementById('nav-add-btn');
    const modal = document.getElementById('post-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('article-form');
    const uploadBtn = document.getElementById('upload-cover-btn');
    
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!isAuthenticated) {
                showAuthModal();
            } else {
                modal.classList.add('active');
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            resetForm();
        });
    }
    
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
                        document.getElementById('cover').value = data.url;
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
                tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
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
                    modal.classList.remove('active');
                    resetForm();
                    location.reload();
                } else {
                    throw new Error(data.error || '保存失败');
                }
            } catch (error) {
                console.error('保存文章失败:', error);
                alert('❌ 保存失败：' + error.message);
            }
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function showAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h2>🔐 授权验证</h2>
            <p>请输入授权码以添加文章</p>
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
            
            const modal = document.querySelector('.auth-modal');
            if (modal) {
                modal.remove();
            }
            
            const postModal = document.getElementById('post-modal');
            if (postModal) {
                postModal.classList.add('active');
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

function resetForm() {
    const form = document.getElementById('article-form');
    if (form) {
        form.reset();
    }
}
