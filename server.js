const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB 连接
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://doreshop:Dore%40Shop123@cluster0.gfe4at4.mongodb.net/?retryWrites=true&w=majority';

console.log('正在连接 MongoDB...');
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ MongoDB 连接成功');
}).catch(err => {
    console.error('✗ MongoDB 连接失败:', err.message);
});

// 用户数据模型
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 订单数据模型
const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    items: [
        {
            id: Number,
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: '待处理' },
    orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// API 路由

// 注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (username.length < 3) {
            return res.json({ success: false, message: '用户名至少3个字符' });
        }
        if (password.length < 6) {
            return res.json({ success: false, message: '密码至少6个字符' });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.json({ success: false, message: '用户名已存在' });
            }
            return res.json({ success: false, message: '邮箱已被注册' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('Register error:', error);
        res.json({ success: false, message: '注册失败' });
    }
});

// 登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user || user.password !== password) {
            return res.json({ success: false, message: '用户名或密码错误' });
        }

        res.json({
            success: true,
            message: '登录成功',
            userId: user._id.toString(),
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: '登录失败' });
    }
});

// 创建订单
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, username, items, totalAmount } = req.body;

        if (!userId || !items || items.length === 0) {
            return res.json({ success: false, message: '订单信息不完整' });
        }

        const order = new Order({
            userId,
            username,
            items,
            totalAmount,
            status: '待处理'
        });

        await order.save();
        res.json({ success: true, message: '订单创建成功', orderId: order._id });
    } catch (error) {
        console.error('Order creation error:', error);
        res.json({ success: false, message: '创建订单失败' });
    }
});

// 获取用户订单
app.get('/api/orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.json([]);
    }
});

// 获取所有订单（管理员）
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.json([]);
    }
});

// 更新订单状态（管理员）
app.put('/api/admin/orders/:orderId', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
        res.json({ success: true, order });
    } catch (error) {
        console.error('Update order error:', error);
        res.json({ success: false, message: '更新失败' });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ 服务器运行在 http://localhost:${PORT}`);
});