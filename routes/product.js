const express = require('express')
const router = express.Router()


// middleware
const { authCheck, farmerCheck} = require('../middlewares/authCheck')
const { ownerCheck } = require('../middlewares/ownerCheck')
//controllers
const { create,list,read,update,remove,listby,searchFilters,listFarmerProducts} = require('../controllers/product')
router.post('/product',authCheck,farmerCheck,create)
router.get('/products/:count',list)
router.get('/product/:id',read)
router.put('/product/:id',authCheck,farmerCheck,ownerCheck,update)
router.delete('/product/:id',authCheck, farmerCheck,ownerCheck,remove)
router.post('/productby',listby)
router.post('/search/filters',searchFilters)
//farmer product
router.get('/farmer/products',authCheck,farmerCheck,listFarmerProducts)



module.exports = router