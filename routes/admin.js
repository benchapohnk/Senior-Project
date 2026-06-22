
// import
const express = require('express')
const { authCheck,adminCheck } = require('../middlewares/authCheck')
const router = express.Router()
//import controller
const { getOrderAdmin, changeOrderStatus,adminDashboard } = require('../controllers/admin')

router.put('/admin/order-status',authCheck,changeOrderStatus)
router.get('/admin/orders',authCheck,getOrderAdmin)
// router.get('/api/farmers')

router.get('/admin/dashboard', authCheck,adminCheck, adminDashboard)


module.exports = router
