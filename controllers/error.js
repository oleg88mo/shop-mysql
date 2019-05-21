exports.get404 = (req, res) => {
    res.status(404).render('404', {documentTitle: 'Page Not Found', path: '/404'})
};