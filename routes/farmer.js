const express = require('express')
const router = express.Router()

// middleware
const {
    authCheck,
    farmerCheck,
    adminCheck
} = require('../middlewares/authCheck')

// controller
const {
    registerFarmer,
    currentFarmer,
    listFarmers,
    approveFarmer
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

module.exports = router