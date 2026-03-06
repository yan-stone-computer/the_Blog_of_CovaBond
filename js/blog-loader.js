document.addEventListener('DOMContentLoaded', function() {
    loadAllPosts();
});

async function loadAllPosts() {
    try {
        const response = await fetch('posts.json');
        const posts = await response.json();
        
        renderBlogPosts(posts);
        updateSidebar(posts);
    } catch (error) {
        console.error('加载文章失败:', error);
        console.log('提示: 请先运行 python build.py 构建文章');
    }
}

function renderBlogPosts(posts) {
    const blogPostsContainer = document.querySelector('.posts-grid');
    if (!blogPostsContainer) return;
    
    blogPostsContainer.innerHTML = posts.map(post => `
        <article class="blog-post-item" data-category="${getCategorySlug(post.category)}">
            <div class="post-thumbnail">
                <img src="${post.cover}" alt="${post.title}">
            </div>
            <div class="post-info">
                <span class="post-category">${post.category}</span>
                <h2><a href="${post.url}">${post.title}</a></h2>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-reading-time">${post.reading_time}分钟阅读</span>
                </div>
            </div>
        </article>
    `).join('');
}

function updateSidebar(posts) {
    const categoryList = document.querySelector('.category-list');
    if (categoryList) {
        const categories = {};
        posts.forEach(post => {
            categories[post.category] = (categories[post.category] || 0) + 1;
        });
        
        categoryList.innerHTML = Object.entries(categories).map(([category, count]) => `
            <li><a href="#" data-category="${getCategorySlug(category)}">${category} <span class="count">(${count})</span></a></li>
        `).join('');
    }
    
    const popularPosts = document.querySelector('.popular-posts');
    if (popularPosts) {
        popularPosts.innerHTML = posts.slice(0, 3).map((post, index) => `
            <li>
                <a href="${post.url}">
                    <span class="rank">${index + 1}</span>
                    ${post.title}
                </a>
            </li>
        `).join('');
    }
    
    const tagCloud = document.querySelector('.tag-cloud');
    if (tagCloud) {
        const allTags = new Set();
        posts.forEach(post => {
            if (Array.isArray(post.tags)) {
                post.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        tagCloud.innerHTML = Array.from(allTags).map(tag => `
            <a href="#" class="tag">${tag}</a>
        `).join('');
    }
}

function getCategorySlug(category) {
    const categoryMap = {
        '技术': 'tech',
        '生活': 'life',
        '学习': 'study'
    };
    return categoryMap[category] || 'other';
}
