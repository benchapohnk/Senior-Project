const prisma = require('../config/prisma')


// สมัคร farmer
exports.registerFarmer = async(req,res)=>{
    try{

        const {
            farmName,
            phone,
            description,
            address,
            provinceTH,
            provinceEN,
            latitude,
            longitude
        } = req.body

        // เช็คว่ามี profile แล้วหรือยัง
        const alreadyFarmer = await prisma.farmerProfile.findUnique({
            where:{
                userId:req.user.id
            }
        })

        if(alreadyFarmer){
            return res.status(400).json({
                message:'You are already farmer'
            })
        }

        // สร้าง farmer profile
        const farmer = await prisma.farmerProfile.create({
            data:{
                farmName,
                phone,
                description,
                address,
                provinceTH,
                provinceEN,
                latitude,
                longitude,
                userId:req.user.id
            }
        })

        // update role สมัครแล้วรอแอดมินอนุมัติ
        await prisma.user.update({
            where:{
                id:req.user.id
            },
            data:{
                role:'farmer_pending'
            }
        })
        res.send({
            message:'Register Farmer Success',
            farmer
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}


// ดูข้อมูล farmer ตัวเอง
exports.currentFarmer = async(req,res)=>{
    try{

        const farmer = await prisma.farmerProfile.findUnique({
            where:{
                userId:req.user.id
            }
        })

        res.send(farmer)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}


// admin ดู farmer ทั้งหมด
exports.listFarmers = async(req,res)=>{
    try{

        const farmers = await prisma.farmerProfile.findMany({
            include:{
                user:true
            }
        })

        res.send(farmers)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.approveFarmer = async(req,res)=>{
   try{

      const { id } = req.params

      const farmer = await prisma.farmerProfile.update({
         where:{
            id:Number(id)
         },
         data:{
            isApproved:true
         }
      })

      await prisma.user.update({
         where:{
            id: farmer.userId
         },
         data:{
            role:'farmer'
         }
      })

      res.send({
         message:'Approve Farmer Success',
         farmer
      })

   }catch(err){

      console.log(err)

      res.status(500).json({
         message:'Server Error'
      })
    }
}
exports.getFarmerOrders = async(req,res)=>{
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
                orderedBy:{
                    select:{
                        id:true,
                        email:true,
                        address:true
                    }
                },
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })

        res.json({
            ok:true,
            orders
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.updateOrderStatus = async(req,res)=>{
    try{

        const { orderId, status } = req.body

        // ตรวจสอบว่า Order มีอยู่จริง
        const existingOrder = await prisma.order.findUnique({
            where:{
                id:Number(orderId)
            }
        })

        if(!existingOrder){
            return res.status(404).json({
                message:'Order not found'
            })
        }

        // ตรวจสอบสถานะที่อนุญาต
        const allowedStatus = [
            'Pending',
            'Preparing',
            'Shipping',
            'Delivered',
            'Cancelled'
        ]

        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message:'Invalid status'
            })
        }

        // ตรวจสอบว่า Farmer เป็นเจ้าของสินค้าใน Order นี้
        const farmerOrder = await prisma.order.findFirst({
            where:{
                id:Number(orderId),
                products:{
                    some:{
                        product:{
                            farmerId:req.user.id
                        }
                    }
                }
            }
        })

        if(!farmerOrder){
            return res.status(403).json({
                message:'Access Denied'
            })
        }

        // อัปเดตสถานะ Order
        const updatedOrder = await prisma.order.update({
            where:{
                id:Number(orderId)
            },
            data:{
                orderStatus: status
            }
        })

        res.json({
            ok:true,
            order: updatedOrder
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.farmerDashboard = async(req,res)=>{
    try{

        const farmerId = req.user.id

        // จำนวนสินค้า
        const totalProducts = await prisma.product.count({
            where:{
                farmerId: farmerId
            }
        })

        // สินค้าทั้งหมดของเกษตรกร
        const products = await prisma.product.findMany({
            where:{
                farmerId: farmerId
            }
        })

        // จำนวนขายทั้งหมด
        const totalSold = products.reduce(
            (sum,item)=>sum + item.sold,
            0
        )

        // รายได้รวม
        const totalRevenue = products.reduce(
            (sum,item)=>sum + (item.sold * item.price),
            0
        )

        // id สินค้า
        const productIds = products.map(item => item.id)

        // จำนวนรีวิว
        const totalReviews = await prisma.review.count({
            where:{
                productId:{
                    in: productIds
                }
            }
        })

        // รีวิวทั้งหมด
        const reviews = await prisma.review.findMany({
            where:{
                productId:{
                    in: productIds
                }
            }
        })

        // คะแนนเฉลี่ย
        const averageRating =
            reviews.length > 0
                ? reviews.reduce(
                    (sum,item)=>sum + item.rating,
                    0
                ) / reviews.length
                : 0

        // จำนวนออเดอร์
        const totalOrders = await prisma.productOnOrder.count({
            where:{
                productId:{
                    in: productIds
                }
            }
        })

        res.json({
            totalProducts,
            totalSold,
            totalRevenue,
            totalOrders,
            totalReviews,
            averageRating
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.searchFarmers = async(req,res)=>{
    try{

        const { keyword } = req.query

        const farmers = await prisma.farmerProfile.findMany({
    where:{
        isApproved:true,
        OR:[
            {
                farmName:{
                    contains: keyword
                }
            },
            {
                address:{
                    contains: keyword
                }
            },
            {
                provinceTH:{
                    contains: keyword
                }
            },
            {
                provinceEN:{
                    contains: keyword
                }
            }
        ]
    },
    include:{
        user:true
    }
})

        res.json(farmers)

    }catch(err){
        console.log(err)
        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.updateFarmerProfile = async(req,res)=>{
    try{

        const {
            farmName,
            phone,
            description,
            address,
            latitude,
            longitude
        } = req.body

        const farmer = await prisma.farmerProfile.update({
            where:{
                userId:req.user.id
            },
            data:{
                farmName,
                phone,
                description,
                address,
                latitude,
                longitude
            }
        })

        res.json(farmer)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}