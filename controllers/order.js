const prisma = require('../config/prisma')

exports.listFarmerOrders = async(req,res)=>{
    try{

        const orders = await prisma.order.findMany({
            where:{
                products:{
                    some:{
                        product:{
                            farmerId:req.user.id
                        }
                    }
                }
            },
            include:{
                orderedBy:true,
                products:{
                    include:{
                        product:true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })

        res.send(orders)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.updateOrderStatus = async(req,res)=>{
    try{

        const { id } = req.params
        const { orderStatus, trackingNumber } = req.body

        const order = await prisma.order.update({
            where:{
                id:Number(id)
            },
            data:{
                orderStatus,
                trackingNumber
            }
        })

        res.send(order)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.farmerDashboard = async(req,res)=>{
    try{

        // จำนวนสินค้า
        const totalProducts = await prisma.product.count({
            where:{
                farmerId:req.user.id
            }
        })

        // จำนวนออเดอร์
        const totalOrders = await prisma.order.count({
            where:{
                products:{
                    some:{
                        product:{
                            farmerId:req.user.id
                        }
                    }
                }
            }
        })

        // ดึง orders
        const orders = await prisma.order.findMany({
            where:{
                products:{
                    some:{
                        product:{
                            farmerId:req.user.id
                        }
                    }
                }
            },
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })

        // คำนวณรายได้
        let totalRevenue = 0

        orders.forEach((order)=>{
            order.products.forEach((item)=>{

                if(item.product.farmerId === req.user.id){
                    totalRevenue += item.price * item.count
                }

            })
        })

        res.send({
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