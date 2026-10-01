// 商品数据
const products = [
    { id: 1, name: '笔记本', emoji: '📓', description: '精美的学生笔记本，适合记录课堂笔记', price: 29.99 },
    { id: 2, name: '钢笔套装', emoji: '✏️', description: '高质量钢笔，书写流畅，送朋友必备', price: 49.99 },
    { id: 3, name: '手账贴纸', emoji: '🎨', description: '可爱的装饰贴纸，让你的手账更有趣', price: 19.99 },
    { id: 4, name: '书签', emoji: '🔖', description: '创意书签，多种设计可选', price: 14.99 },
    { id: 5, name: '手机支架', emoji: '📱', description: '便携式手机支架，学习追剧必备', price: 39.99 },
    { id: 6, name: '帆布包', emoji: '🎒', description: '环保帆布包，轻便耐用，适合上学', price: 79.99 }
];

// 页面加载时显示商品
window.addEventListener('DOMContentLoaded', () => {
    console.log('页面已加载，开始显示商品');
    displayProducts();
    updateLoginStatus();
});

// 显示商品列表
function displayProducts() {
    const productsList = document.getElementById('productsList');
    
    if (!productsList) {
        console.error('找不到 productsList');
        return;
    }
    
    const html = products.map(product => `
        <div class="product-card">
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">¥${product.price}</div>
                    <a href="product-detail.html?id=${product.id}" style="text-decoration: none; flex: 1;">
                        <button class="btn-add-cart" style="width: 100%; margin: 0;">查看详情</button>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
    
    productsList.innerHTML = html;
    console.log('商品已显示');
}

// 检查登录状态并更新导航
function updateLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (currentUser && loginLink) {
        loginLink.textContent = `👤 ${currentUser.username}`;
        loginLink.href = '#';
        loginLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    }
}

// 登出函数
function logout() {
    if (confirm('确定要登出吗？')) {
        localStorage.removeItem('currentUser');
        window.location.reload();
    }
}