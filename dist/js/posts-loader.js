document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
});

async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        const posts = await response.json();
        
        renderFeaturedPosts(posts.slice(0, 3));
    } catch (error) {
        console.error('加载文章失败:', error);
        console.log('提示: 请先运行 python build.py 构建文章');
    }
}

function renderFeaturedPosts(posts) {
    const postsGrid = document.querySelector('.posts-grid');
    if (!postsGrid) return;
    
    postsGrid.innerHTML = posts.map(post => `
        <article class="post-card">
            <div class="post-image">
                <img src="${post.cover}" alt="${post.title}">
            </div>
            <div class="post-content">
                <span class="post-category">${post.category}</span>
                <h3><a href="${post.url}">${post.title}</a></h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-reading-time">${post.reading_time}分钟阅读</span>
                </div>
            </div>
        </article>
    `).join('');
}
