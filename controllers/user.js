const  prisma  = require("../config/prisma")


exports.listUsers = async(req, res) => {
    try {
        //code
        const users = await prisma.user.findMany({
            select:{
                id:true,
                email:true,
                role:true,
                enable:true,
                address:true
            }
        })
        res.json(users)
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.changeStatus = async(req, res) => {  //ปิดสถานะการใช้งานของuser
    try {
        //code
        const {id , enable} = req.body
        console.log(id,enable)
        const user = await prisma.user.update({
            where:{id:Number(id)},
            data:{ enable: enable}
        })
        res.send('Update status Success')
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.changeRole = async(req, res) => {
    try {
         //code
        const {id , role} = req.body
        const user = await prisma.user.update({
            where:{id:Number(id)},
            data:{ role: role}
        })
        res.send('Update Role Success')
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.userCart = async(req, res) => {
    try {

        const { cart } = req.body

        // เช็ค cart ว่าง
        if(!cart || cart.length === 0){
            return res.status(400).json({
                message:'Cart is empty'
            })
        }

        const user = await prisma.user.findFirst({
            where:{
                id:Number(req.user.id)
            }
        })

        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }

        // ลบ cart เก่า
        await prisma.productOnCart.deleteMany({
            where:{
                cart:{
                    orderedById:user.id
                }
            }
        })

        await prisma.cart.deleteMany({
            where:{
                orderedById:user.id
            }
        })

        let products = []

        for(const item of cart){

            // ตรวจสอบจำนวน
            if(isNaN(item.count)){
                return res.status(400).json({
                    message:'Count must be number'
                })
            }

            if(item.count <= 0){
                return res.status(400).json({
                    message:'Invalid quantity'
                })
            }

            const productFromDB = await prisma.product.findUnique({
                where:{
                    id:Number(item.id)
                }
            })

            if(!productFromDB){
                return res.status(404).json({
                    message:'Product not found'
                })
            }

            // เช็ค stock
            if(item.count > productFromDB.quantity){
                return res.status(400).json({
                    message:'Stock not enough'
                })
            }

            products.push({
                productId: productFromDB.id,
                count: Number(item.count),
                price: productFromDB.price
            })
        }

        const cartTotal = products.reduce(
            (sum,item)=> sum + (item.price * item.count),
            0
        )

        const newCart = await prisma.cart.create({
            data:{
                products:{
                    create:products
                },
                cartTotal,
                orderedById:user.id
            }
        })

        res.json({
            ok:true,
            message:'Add Cart Success',
            cart:newCart
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.getUserCart = async(req,res)=>{
    try{
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById:Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })

        // ไม่มี cart
        if(!cart){
            return res.status(404).json({
                message:'Cart not found'
            })
        }

        res.json({
            products:cart.products,
            cartTotal:cart.cartTotal
        })

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.emptyCart = async(req, res) => {
    try {
        //code
        // console.log("empty cart")
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id)}
        })
        //  console.log("USER ID =", req.user.id)
        // console.log("CART =", cart)
        if(!cart){
            return res.status(400).json({message: 'No Cart'})
        }
        await prisma.productOnCart.deleteMany({
            where:{ cartId: cart.id}
        })
        const result = await prisma.cart.deleteMany({
            where:{orderedById:Number(req.user.id)}
        })
        console.log(result)
        res.json({
             message:'Cart Empty Success',
            deletedCount: result.count
            })
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.saveAddress = async(req, res) => {
    try {
        //code
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where:{
                id:Number(req.user.id)
            },
            data:{
                address: address
            }
        })

        res.json({ ok: true, message:'Address update Success'})
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.saveOrder = async(req, res) => {
    try {
        //code
        //step 1 get user cart
        const userCart = await prisma.cart.findFirst({
            where:{ 
                orderedById: Number(req.user.id)
            },
            include:{
                 products:true
            }
        })

        //check empty
        if(!userCart || userCart.products.length === 0){
            return res.status(400).json({ok: false,message:'Cart is empty'})
        }
        //check quantity
        for( const item of userCart.products){
            // console.log(item)
            const product = await prisma.product.findUnique({
                where:{ id:item.productId },
                select: { quantity: true,title:true }
            })
            // console.log(item)
            // console.log(product)
            if(!product || item.count > product.quantity){ //ถ้าสินค้าที่ซื้ิมีมากกว่าในคลัง
                return res.status(400).json({ok:false,message: 'ขออภัย สินค้าหมด '})
            }
        }

        // Create a new order
        const order = await prisma.order.create({
            data:{
                products:{
                    create: userCart.products.map((item)=>({
                        productId : item.productId,
                        count: item.count,
                        price:item.price
                    }))  
                },
                orderedBy:{
                    connect: { id: req.user.id }
                },
                cartTotal: userCart.cartTotal
            }
        })

        // update product
        const update = userCart.products.map((item)=>({
            where:{ id:item.productId },
            data:{
                quantity: { decrement : item.count },
                sold: { increment: item.count }
            }
        }))

        console.log(update)

        await Promise.all(
            update.map((updated)=>prisma.product.update(updated))
        )

        await prisma.cart.deleteMany({
            where:{ orderedById : Number(req.user.id) }
        })

        res.json({ok: true,order})
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.getOrder = async(req, res) => {
    try {
        //code
        const orders = await prisma.order.findMany({
            where:{ orderedById: Number(req.user.id)},
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })

    if(orders.length === 0 ){
        return res.status(400).json({ ok: false, message: 'No orders'})
    }

    res.json({ ok:true, orders })
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
exports.currentUser = async(req,res)=>{
    try{

        const user = await prisma.user.findUnique({
            where:{
                id:req.user.id
            },
            select:{
                id:true,
                email:true,
                role:true,
                address:true
            }
        })

        res.json(user)

    }catch(err){
        res.status(500).json({
            message:'Server Error'
        })
    }
}