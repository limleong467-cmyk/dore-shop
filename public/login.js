// 登录表单处理
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    // 简单验证
    if (!email || !password) {
        showError(errorMsg, '请填写所有字段');
        return;
    }

    // 从本地存储获取已注册用户
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 查找用户
    const user = users.find(u => 
        (u.email === email || u.username === email) && u.password === password
    );

    if (!user) {
        showError(errorMsg, '邮箱/用户名或密码错误');
        return;
    }

    // 登录成功
    localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        email: user.email
    }));

    errorMsg.style.display = 'none';
    alert('登录成功！');
    window.location.href = 'index.html';
});

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}