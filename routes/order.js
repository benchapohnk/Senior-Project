const express = require('express')
const router = express.Router()

const {
    authCheck,
    farmerCheck
} = require('../middlewares/authCheck')

const {
    listFarmerOrders,
    updateOrderStatus,
    farmerDashboard
} = require('../controllers/order')

router.get(
    '/farmer/orders',
    authCheck,
    farmerCheck,
    listFarmerOrders
)

router.put(
    '/farmer/order-status/:id',
    authCheck,
    farmerCheck,
    updateOrderStatus
)
router.get(
    '/farmer/dashboard',
    authCheck,
    farmerCheck,
    farmerDashboard
)

module.exports = router