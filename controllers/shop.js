const Product = require('../models/product');

exports.getProducts = (req, res) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            documentTitle: 'All Products',
            path: '/products'
        })
    }).catch(err => console.log('err Get Index', err));
};

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findAll({where: {id: prodId}}).then(products => {
        res.render('shop/product-detail', {
            product: products[0],
            documentTitle: products[0].title,
            path: '/products'
        })
    }).catch(err => console.log('err get one product', err));
};

exports.getIndex = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/index', {
            prods: products,
            documentTitle: 'My Shop',
            path: '/'
        })
    }).catch(err => console.log('err Get Index', err));
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        documentTitle: 'Your cart',
                        path: '/cart',
                        products: products
                    });
                })
                .catch(err => console.log('err getCart!', err));
        })
        .catch(err => console.log('err getCart', err))
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: prodId}})
        })
        .then(products => {
            let product;

            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;

                return product;
            }

            return Product.findByPk(prodId)
        })
        .then(product => {
            return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
        })
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => console.log('err postCart', err))
};

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({where: {id: prodId}})
        })
        .then(products => {
            const product = products[0];

            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log('err', err));
};

exports.postOrder = (req, res) => {
    let fetchedCart;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts()
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderItem = {quantity: product.cartItem.quantity};

                        return product;
                    }))
                })
                .catch(err => console.log('err createOrder', err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect('/orders')
        })
        .catch(err => console.log('err postOrder', err))
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                documentTitle: 'Your orders',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => console.log('err', err));
};

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         documentTitle: 'Checkout',
//         path: '/checkout'
//     })
// };