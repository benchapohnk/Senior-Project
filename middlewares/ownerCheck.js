const prisma = require('../config/prisma')

exports.ownerCheck = async(req,res,next)=>{
    try{

        // หา product จาก id
        const product = await prisma.product.findUnique({
            where:{
                id:Number(req.params.id)
            }
        })

        // ถ้าไม่มีสินค้า
        if(!product){
            return res.status(404).json({
                message:'Product not found'
            })
        }

        // เช็คว่าเป็นเจ้าของสินค้าหรือไม่
        if(product.farmerId !== req.user.id){
            return res.status(403).json({
                message:'Access Denied'
            })
        }

        next()

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Owner Check Error'
        })
    }
}