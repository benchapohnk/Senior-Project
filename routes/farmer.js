const express = require('express')
const router = express.Router()

// middleware
const {
    authCheck,
    farmerCheck,
    adminCheck,
    approvedFarmerCheck
} = require('../middlewares/authCheck')

// controller
const {
    registerFarmer,
    currentFarmer,
    listFarmers,
    approveFarmer,
    getFarmerOrders,
    updateOrderStatus,
    farmerDashboard,
    searchFarmers,
    updateFarmerProfile
} = require('../controllers/farmer')


// สมัครเป็นเกษตรกร
router.post(
    '/register-farmer',
    authCheck,
    registerFarmer
)


// ดูข้อมูล farmer ตัวเอง
router.get(
    '/current-farmer',
    authCheck,
    farmerCheck,
    approvedFarmerCheck,
    currentFarmer
)


// admin ดู farmer ทั้งหมด
router.get(
    '/farmers',
    authCheck,
    adminCheck,
    listFarmers
)
//admin approve farmer
router.put(
    '/approve-farmer/:id',
    authCheck,
    adminCheck,
    approveFarmer
)
router.get(
    '/farmer/orders',
    authCheck,
    farmerCheck,
    getFarmerOrders
)
router.put(
    '/farmer/order-status',
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

router.get(
    '/farmers/search',
    searchFarmers
)
router.put(
    '/farmer/profile',authCheck,farmerCheck,updateFarmerProfile
)
module.exports = router