const express = require('express')
const router = express.Router()

const {
    authCheck
} = require('../middlewares/authCheck')

const {
    createReview,
    listReviews
} = require('../controllers/review')

router.post(
    '/review',
    authCheck,
    createReview
)

router.get(
    '/reviews/:productId',
    listReviews
)

module.exports = router