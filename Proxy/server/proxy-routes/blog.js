const express = require('express');
const router = express.Router();
const {
    create,
    createComment,
    addEmoji,
    getEmojis,
    list,
    listForSitemap,
    listAllBlogsCategoriesTags,
    read,
    remove,
    toggle,
    update,
    photo,
    listRelated,
    listSearch,
    listByUser
} = require('../proxy-controllers/blog');

const { requireSignin, adminMiddleware, 
    authMiddleware, canUpdateDeleteBlog } = require('../proxy-controllers/auth');

//initializing Blogs Index View
router.get('/', listAllBlogsCategoriesTags);
router.get('/blogs', listAllBlogsCategoriesTags);


router.get('/sitemap', listForSitemap);
router.post('/blog', requireSignin, adminMiddleware, create);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, adminMiddleware, remove);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);
router.put('/blog/toggle/:slug', requireSignin, adminMiddleware, toggle);

// auth user blog crud
router.post('/user/blog', requireSignin, authMiddleware, create);
router.get('/:username/blogs', listByUser);
router.delete('/user/blog/:slug', requireSignin, authMiddleware, remove);
router.put('/user/blog/toggle/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, toggle);

// comments
router.post('/user/blog/comment', requireSignin, authMiddleware, createComment);

//emojis
router.post('/user/blog/emoji', requireSignin, authMiddleware, addEmoji);
router.post('/blog/emojis', getEmojis);

module.exports = router;
