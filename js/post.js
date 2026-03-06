document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('.toc a');
    const headings = document.querySelectorAll('.post-body h2');

    tocLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (headings[index]) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = headings[index].offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(headings).indexOf(entry.target);
                tocLinks.forEach(link => link.classList.remove('active'));
                if (tocLinks[index]) {
                    tocLinks[index].classList.add('active');
                }
            }
        });
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));

    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.dataset.platform;
            const url = window.location.href;
            const title = document.querySelector('.post-header h1').textContent;
            
            let shareUrl = '';
            
            switch(platform) {
                case 'weibo':
                    shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
                    break;
                case 'wechat':
                    alert('请使用微信扫描二维码分享');
                    return;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(commentForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const content = formData.get('content');

            console.log('评论提交:', { name, email, content });
            
            const commentsList = document.querySelector('.comments-list');
            const newComment = createCommentElement(name, content);
            commentsList.insertBefore(newComment, commentsList.firstChild);
            
            alert('评论发表成功！');
            commentForm.reset();
        });
    }

    function createCommentElement(name, content) {
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.innerHTML = `
            <div class="comment-avatar">
                <img src="https://via.placeholder.com/50x50" alt="评论者头像">
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${name}</span>
                    <span class="comment-date">${new Date().toLocaleString('zh-CN')}</span>
                </div>
                <p>${content}</p>
                <button class="reply-btn">回复</button>
            </div>
        `;
        return comment;
    }

    const replyButtons = document.querySelectorAll('.reply-btn');
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentAuthor = this.closest('.comment').querySelector('.comment-author').textContent;
            const commentForm = document.querySelector('.comment-form textarea');
            
            commentForm.value = `@${commentAuthor} `;
            commentForm.focus();
            
            document.querySelector('.comment-form').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });
    });

    const codeBlocks = document.querySelectorAll('.post-body pre code');
    codeBlocks.forEach(block => {
        block.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = this.textContent;
                this.textContent = '已复制到剪贴板！';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = '#fff';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                    this.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        });
        
        block.style.cursor = 'pointer';
        block.title = '点击复制代码';
    });

    const readingProgressBar = document.createElement('div');
    readingProgressBar.className = 'reading-progress';
    readingProgressBar.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        width: 0%;
        height: 3px;
        background-color: var(--primary-color);
        z-index: 999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(readingProgressBar);

    window.addEventListener('scroll', function() {
        const article = document.querySelector('.post-article');
        if (article) {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;
            
            const progress = Math.min(
                Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
                1
            );
            
            readingProgressBar.style.width = `${progress * 100}%`;
        }
    });
});
