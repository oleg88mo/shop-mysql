const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const productsController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extend: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    }).catch(err => console.log('err app.use', err))
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(productsController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});

sequelize
// .sync({force: true})
    .sync()
    .then(res => {
        return User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({name: 'Oleh', email: 'yo@mail.com'})
        }
        return user
    })
    .then(user => {
        return user.createCart();
    })
    .then(cart => {
        app.listen(3005);
    })
    .catch(err => console.log('err sequelize.sync()', err));

// LESS 149 - 1.08