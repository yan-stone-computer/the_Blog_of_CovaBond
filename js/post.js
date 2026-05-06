/**
 * 文章详情页 JavaScript
 * 包含目录导航、分享、代码高亮等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    initTableOfContents();
    initShareButtons();
    initCodeHighlight();
});

/**
 * 目录导航功能
 */
function initTableOfContents() {
    const tocList = document.querySelector('.toc-list');
    const postBody = document.querySelector('.post-body');
    
    if (!tocList || !postBody) return;
    
    // 获取所有标题
    const headings = postBody.querySelectorAll('h2, h3, h4');
    
    // 如果目录为空，自动生成
    if (tocList.children.length === 0) {
        headings.forEach((heading, index) => {
            // 为标题添加 ID
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            // 创建目录项
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            a.dataset.target = heading.id;
            
            // 根据标题级别添加缩进
            if (heading.tagName === 'H3') {
                a.style.paddingLeft = '24px';
            } else if (heading.tagName === 'H4') {
                a.style.paddingLeft = '36px';
            }
            
            li.appendChild(a);
            tocList.appendChild(li);
        });
    }
    
    // 目录链接点击事件
    const tocLinks = tocList.querySelectorAll('a');
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 滚动时高亮当前目录项
    const observerOptions = {
        rootMargin: `-${document.querySelector('.header').offsetHeight + 50}px 0px -80% 0px`,
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    headings.forEach(heading => observer.observe(heading));
}

/**
 * 分享按钮功能
 */
function initShareButtons() {
    const shareBtn = document.querySelector('.share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', async function() {
            const url = window.location.href;
            const success = await copyToClipboard(url);
            
            if (success) {
                showToast('链接已复制到剪贴板');
            } else {
                showToast('复制失败，请手动复制');
            }
        });
    }
}

/**
 * 代码高亮
 */
function initCodeHighlight() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        // 添加复制按钮
        const pre = block.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        wrapper.style.position = 'relative';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        copyBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            background: var(--bg-primary);
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.2s ease;
        `;
        
        // 鼠标悬停显示复制按钮
        pre.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });
        pre.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
        
        copyBtn.addEventListener('click', async function() {
            const code = block.textContent;
            const success = await copyToClipboard(code);
            
            if (success) {
                this.innerHTML = `
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                this.style.color = 'var(--accent-color)';
                
                setTimeout(() => {
                    this.innerHTML = `
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    `;
                    this.style.color = 'var(--text-muted)';
                }, 2000);
            }
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
    });
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

/**
 * 显示提示消息
 */
function showToast(message, duration = 3000) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--text-primary);
        color: var(--bg-primary);
        padding: 12px 24px;
        border-radius: var(--radius-md);
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
