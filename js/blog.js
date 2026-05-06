/**
 * 博客列表页 JavaScript
 * 包含搜索、筛选、标签等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    initFilterTabs();
    initTagFilters();
});

/**
 * 搜索功能
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const blogList = document.getElementById('blog-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!searchInput || !blogList) return;
    
    // 获取所有文章
    const posts = Array.from(blogList.querySelectorAll('.blog-post-item'));
    
    // 防抖搜索
    const debouncedSearch = debounce(function(query) {
        const lowerQuery = query.toLowerCase().trim();
        let visibleCount = 0;
        
        posts.forEach(post => {
            const title = post.querySelector('h2')?.textContent.toLowerCase() || '';
            const excerpt = post.querySelector('.post-excerpt')?.textContent.toLowerCase() || '';
            const tags = post.getAttribute('data-tags')?.toLowerCase() || '';
            const category = post.getAttribute('data-category')?.toLowerCase() || '';
            
            const isMatch = title.includes(lowerQuery) || 
                          excerpt.includes(lowerQuery) || 
                          tags.includes(lowerQuery) ||
                          category.includes(lowerQuery);
            
            if (isMatch) {
                post.style.display = 'grid';
                post.style.animation = 'fadeIn 0.4s ease';
                visibleCount++;
            } else {
                post.style.display = 'none';
            }
        });
        
        // 显示/隐藏空状态
        if (emptyState) {
            if (visibleCount === 0 && lowerQuery !== '') {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
            }
        }
        
        // 更新 URL 参数
        if (lowerQuery) {
            const url = new URL(window.location);
            url.searchParams.set('search', lowerQuery);
            window.history.replaceState({}, '', url);
        } else {
            const url = new URL(window.location);
            url.searchParams.delete('search');
            window.history.replaceState({}, '', url);
        }
    }, 300);
    
    searchInput.addEventListener('input', function() {
        debouncedSearch(this.value);
    });
    
    // 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = searchQuery;
        debouncedSearch(searchQuery);
    }
}

/**
 * 分类筛选功能
 */
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const blogList = document.getElementById('blog-list');
    
    if (!blogList) return;
    
    const posts = Array.from(blogList.querySelectorAll('.blog-post-item'));
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // 更新激活状态
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选文章
            posts.forEach(post => {
                const category = post.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    post.style.display = 'grid';
                    post.style.animation = 'fadeIn 0.4s ease';
                } else {
                    post.style.display = 'none';
                }
            });
            
            // 更新 URL 参数
            const url = new URL(window.location);
            if (filter !== 'all') {
                url.searchParams.set('category', filter);
            } else {
                url.searchParams.delete('category');
            }
            window.history.replaceState({}, '', url);
        });
    });
    
    // 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    if (categoryFilter) {
        const targetTab = document.querySelector(`.filter-tab[data-filter="${categoryFilter}"]`);
        if (targetTab) {
            targetTab.click();
        }
    }
}

/**
 * 标签筛选功能
 */
function initTagFilters() {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;
    
    // 为所有标签添加点击事件
    blogList.addEventListener('click', function(e) {
        if (e.target.classList.contains('post-tag')) {
            e.preventDefault();
            const tag = e.target.textContent.trim();
            
            // 更新搜索框
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = tag;
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    });
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 添加淡入动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
