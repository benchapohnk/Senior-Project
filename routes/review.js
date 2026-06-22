const express = require('express')
const router = express.Router()

const {
    authCheck
} = require('../middlewares/authCheck')

const {
    createReview,
    listReviews,
    getProductRating
} = require('../controllers/review')

// สร้างรีวิว
router.post(
    '/review',
    authCheck,
    createReview
)

// ดูรีวิวสินค้า
router.get(
    '/reviews/:productId',
    listReviews
)

router.get(
    '/product-rating/:productId',
    getProductRating
)

module.exports = router