/**
 * CovaBond个人博客 - 主 JavaScript 文件
 * 包含粒子动画、主题切换、导航、3D卡片、滚动动画、
 * 鼠标光标跟随、数字滚动等高级交互效果
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==================== 初始化 ====================
    initLoader();
    initThemeToggle();
    initNavigation();
    initMobileMenu();
    initParticles();
    initScrollAnimations();
    initCursorFollower();
    initSmoothScroll();
    initTiltCards();
    initStatCounters();
    initParallax();

});

// ==================== 工具函数 ====================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-999999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); return true; }
        catch (_2) { return false; }
        finally { document.body.removeChild(ta); }
    }
}

function showToast(message, duration) {
    duration = duration || 3000;
    var existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText =
        'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);' +
        'background:var(--text-primary);color:var(--bg-primary);padding:12px 24px;' +
        'border-radius:var(--radius-md);font-size:14px;font-weight:500;z-index:9999;' +
        'opacity:0;transition:all 0.3s ease;box-shadow:var(--shadow-lg);';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(function () { toast.remove(); }, 300);
    }, duration);
}

// ==================== 1. 加载动画 ====================

function initLoader() {
    var loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', function () {
            setTimeout(function () { loader.classList.add('hidden'); }, 500);
        });
    }
}

// ==================== 2. 主题切换 ====================

function initThemeToggle() {
    var themeToggle = document.getElementById('theme-toggle');
    var sunIcon = themeToggle ? themeToggle.querySelector('.sun-icon') : null;
    var moonIcon = themeToggle ? themeToggle.querySelector('.moon-icon') : null;

    var savedTheme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateIcons('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateIcons('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateIcons(next);
        });
    }

    function updateIcons(theme) {
        if (!sunIcon || !moonIcon) return;
        sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
        moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
    }
}

// ==================== 3. 导航栏滚动隐藏/显示 ====================

function initNavigation() {
    var header = document.getElementById('header');
    if (!header) return;
    var lastScrollY = window.scrollY;
    var ticking = false;

    function updateHeader() {
        var currentScrollY = window.scrollY;
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}

// ==================== 4. 移动端菜单 ====================

function initMobileMenu() {
    var menuToggle = document.getElementById('menu-toggle');
    var navMenu = document.getElementById('nav-menu');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        var spans = menuToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    var navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            var spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// ==================== 5. Canvas 粒子动画系统 ====================

function initParticles() {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var PARTICLE_COUNT = 80;
    var CONNECTION_DIST = 120;
    var MOUSE_RADIUS = 150;
    var COLORS = ['#FF2D78', '#00F0FF'];
    var animId = null;
    var isVisible = true;

    // 设置画布尺寸
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', debounce(resize, 200));

    // 粒子类
    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.5 + 0.3;
    }

    Particle.prototype.update = function () {
        // 鼠标引力效果
        var dx = mouse.x - this.x;
        var dy = mouse.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
            var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
        }

        // 速度衰减
        this.vx *= 0.99;
        this.vy *= 0.99;

        this.x += this.vx;
        this.y += this.vy;

        // 边界反弹
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
    };

    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    };

    // 初始化粒子
    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    // 绘制连线
    function drawConnections() {
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    var alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // 动画循环
    function animate() {
        if (!isVisible) {
            animId = requestAnimationFrame(animate);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        drawConnections();
        animId = requestAnimationFrame(animate);
    }
    animate();

    // 鼠标跟踪（相对于 canvas）
    canvas.parentElement.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // 页面不可见时暂停
    document.addEventListener('visibilitychange', function () {
        isVisible = !document.hidden;
    });
}

// ==================== 6. 滚动动画增强 ====================

function initScrollAnimations() {
    // 基础 reveal 动画
    var revealElements = document.querySelectorAll(
        '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur'
    );

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) { observer.observe(el); });

    // 为 .reveal-blur 注入初始样式（如果尚未在 CSS 中定义）
    var blurElements = document.querySelectorAll('.reveal-blur');
    blurElements.forEach(function (el) {
        if (!el.dataset.blurStyled) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(60px)';
            el.style.filter = 'blur(10px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease';
            el.dataset.blurStyled = 'true';
        }
    });

    // 监听 .reveal-blur 激活状态
    var blurObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.filter = 'blur(0)';
                blurObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    blurElements.forEach(function (el) { blurObserver.observe(el); });
}

// ==================== 7. 鼠标跟随光标 + 拖尾效果（已禁用）====================

function initCursorFollower() {
    // 已禁用自定义光标效果，使用系统默认光标
    // 如需启用，取消下面代码的注释
    return;
}

// ==================== 8. 3D 倾斜卡片效果（已禁用）====================

function initTiltCards() {
    // 已禁用3D倾斜效果，避免抖动和延迟
    // 如需启用，取消下面代码的注释
    return;
}

// ==================== 9. 数字滚动动画 ====================

function initStatCounters() {
    var statElements = document.querySelectorAll('.stat-number');
    if (statElements.length === 0) return;

    // easeOutExpo 缓动函数
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
        if (isNaN(target)) return;

        var duration = 2000; // 2 秒
        var startTime = null;
        var suffix = el.getAttribute('data-suffix') || '';

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easedProgress = easeOutExpo(progress);
            var current = Math.floor(easedProgress * target);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statElements.forEach(function (el) { observer.observe(el); });
}

// ==================== 10. 平滑滚动 & 导航激活状态 ====================

function initSmoothScroll() {
    // 平滑滚动
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href !== '#') {
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var headerHeight = document.getElementById('header').offsetHeight;
                    var targetPosition = target.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                    // 更新导航激活状态
                    document.querySelectorAll('.nav-menu a').forEach(function (navLink) {
                        navLink.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            }
        });
    });

    // 滚动时保持导航激活状态
    var sections = document.querySelectorAll('section[id]');
    var ticking = false;

    function updateActiveNav() {
        var current = '';
        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('.nav-menu a').forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateActiveNav);
            ticking = true;
        }
    }, { passive: true });
}

// ==================== 11. 视差滚动效果 ====================

function initParallax() {
    var parallaxElements = document.querySelectorAll('.shape, .hero-grid');
    if (parallaxElements.length === 0) return;

    var ticking = false;

    function updateParallax() {
        var scrolled = window.scrollY;
        parallaxElements.forEach(function (el, index) {
            var speed = 0.5 + index * 0.1;
            el.style.transform = 'translateY(' + (-(scrolled * speed)) + 'px)';
        });
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}
