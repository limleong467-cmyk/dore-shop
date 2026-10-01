const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// 中间件
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// ⚠️ 替换成你的 MongoDB 连接字符串
const MONGO_URI = 'mongodb+srv://doreuser:123456dore@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority';

console.log('正在连接 MongoDB...');

// 连接 MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB 已连接');
    })
    .catch((err) => {
        console.error('❌ MongoDB 连接失败:', err.message);
        console.log('继续运行（使用本地存储）...');
    });

// 定义数据模型
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API: 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log('注册请求:', { username, email });

        // 检查用户是否已存在
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: '用户已存在' });
        }

        // 创建新用户
        const newUser = new User({ username, email, password });
        await newUser.save();

        console.log('✅ 用户已注册:', username);
        res.json({ success: true, message: '注册成功' });
    } catch (err) {
        console.error('❌ 注册错误:', err.message);
        res.status(500).json({ error: '注册失败' });
    }
});

// API: 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('登录请求:', email);

        // 查找用户
        const user = await User.findOne({
            $or: [{ email }, { username: email }],
            password: password
        });

        if (!user) {
            return res.status(401).json({ error: '邮箱/用户名或密码错误' });
        }

        console.log('✅ 用户已登录:', user.username);
        res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('❌ 登录错误:', err.message);
        res.status(500).json({ error: '登录失败' });
    }
});

// API: 测试
app.get('/api/test', (req, res) => {
    res.json({ message: '服务器正常运行' });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});