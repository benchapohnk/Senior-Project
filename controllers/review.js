const prisma = require('../config/prisma')

exports.createReview = async(req,res)=>{
    try{

        const { productId, rating, comment } = req.body

        // check เคยรีวิวไหม
        const alreadyReview = await prisma.review.findFirst({
            where:{
                productId:Number(productId),
                userId:req.user.id
            }
        })

        if(alreadyReview){
            return res.status(400).json({
                message:'You already reviewed this product'
            })
        }

        const review = await prisma.review.create({
            data:{
                rating:Number(rating),
                comment:comment,

                productId:Number(productId),
                userId:req.user.id
            }
        })

        res.send(review)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
exports.listReviews = async(req,res)=>{
    try{

        const { productId } = req.params

        const reviews = await prisma.review.findMany({
            where:{
                productId:Number(productId)
            },
            include:{
                user:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })

        res.send(reviews)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}