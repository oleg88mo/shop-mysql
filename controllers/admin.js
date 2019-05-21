const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        documentTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
};

exports.postAddProduct = (req, res) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    }).then(response => {
            res.redirect('/admin/products')
        }).catch(err => console.log('err postAddProduct', err));
};


exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/')
    }
    const prodId = req.params.productId;
    req.user.getProducts({where: {id: prodId}})
    // Product.findAll({where: {id: prodId}})
        .then(products => {
        if (!products[0]) {
            return res.redirect('/')
        }
        res.render('admin/edit-product', {
            documentTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: products[0]
        });
    }).catch(err => console.log('err getEditProduct', err));
};

exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    Product.findAll({where: {id: prodId}}).then(products => {
        products[0].title = updatedTitle;
        products[0].price = updatedPrice;
        products[0].description = updatedDescription;
        products[0].imageUrl = updatedImageUrl;

        return products[0].save();
    }).then(response => {
        console.log('UPDATED PRODUCT', response);
        res.redirect('/admin/products')
    }).catch(err => console.log('err postEditProduct', err));
};

exports.getProducts = (req, res) => {
    // Product.findAll()
    req.user.getProducts()
        .then(products => {
        res.render('admin/products', {
            prods: products,
            documentTitle: 'Admin Products',
            path: '/admin/products'
        })
    }).catch(err => console.log('err getProducts', err));
};

exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;

    Product.destroy({where: {id: prodId}}).then(products => {
        console.log('_____destroy prod', products);
        res.redirect('/admin/products')
    }).catch(err => console.log('err postDeleteProduct', err));

};