const prisma = require("../config/prisma")

exports.changeOrderStatus = async(req,res) => {
    try {
        const { orderId, orderStatus } = req.body
        // console.log(orderId, orderStatus)
        const orderUpdate = await prisma.order.update({
            where:{id: orderId},
                data:{ orderStatus: orderStatus }
            
        })
        res.json(orderUpdate)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error "})
    }
}

exports.getOrderAdmin = async(req,res) => {
    try {
        const orders = await prisma.order.findMany({
            include:{
                products:{
                    include:{
                        product: true
                    }
                },
            orderedBy:{
                select:{
                    id:true,
                    email:true,
                    address:true,
                }
            }
        }
        })
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error "})
    }
}
exports.adminDashboard = async(req,res)=>{
    try{

        const totalUsers = await prisma.user.count()

        const totalFarmers = await prisma.user.count({
            where:{
                role:'farmer'
            }
        })

        const totalProducts = await prisma.product.count()

        const totalOrders = await prisma.order.count()

        const products = await prisma.product.findMany()

        const totalRevenue = products.reduce(
            (sum,item)=> sum + (item.sold * item.price),
            0
        )

        res.json({
            totalUsers,
            totalFarmers,
            totalProducts,
            totalOrders,
            totalRevenue
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}