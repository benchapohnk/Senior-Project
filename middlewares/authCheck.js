const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')




exports.authCheck = async(req,res,next)=>{
    try{
        //code
        const headerToken = req.headers.authorization
          console.log(headerToken)
    if(!headerToken){
            return res.status(400).json({message:"No Token"})
        }
        const token = headerToken.split(" ")[1]
        const decode = jwt.verify(token,process.env.SECRET)

        const user = await prisma.user.findFirst({
            where:{
                email: decode.email // เช็คข้อมูลในฐานข้อมูล
            }
        })
        if(!user){
    return res.status(404).json({
        message:'User not found'
    })
}
        if(!user.enable){
            return res.status(400).json({message:'This account cannot access'})
        }
        req.user = user
        next()
    }catch(err){

    console.log(err)

    // token หมดอายุ
    if(err.name === 'TokenExpiredError'){
        return res.status(401).json({
            message:'Token Expired'
        })
    }

    // token ไม่ถูกต้อง
    res.status(401).json({
        message:'Token Invalid!!'
    })
}
    }

exports.adminCheck = async(req,res,next)=>{
    try{
        //code
        const { email }= req.user
        const adminUser = await prisma.user.findFirst({
            where:{email: email}
        })
        if(!adminUser || adminUser.role !== 'admin'){
            return res.status(403).json({message:'Access Deied : Admin Only'})
        }
        //  console.log('adminCheck',email)
        next()
    }catch (err){
        console.log(err)
        res.status(500).json({message:'Error Admin access denied'})
    }
}
exports.farmerCheck = async(req,res,next)=>{
    try{

        const { email } = req.user

        const farmerUser = await prisma.user.findFirst({
            where:{
                email: email
            }
        })

        if(!farmerUser || farmerUser.role !== 'farmer'){
            return res.status(403).json({
                message:'Access Denied : Farmer Only'
            })
        }

        next()

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Error Farmer Access Denied'
        })
    }
}
exports.approvedFarmerCheck = async(req,res,next)=>{
    try{

        const farmer = await prisma.farmerProfile.findUnique({
            where:{
                userId:req.user.id
            }
        })

        if(!farmer){
            return res.status(404).json({
                message:'Farmer profile not found'
            })
        }

        if(!farmer.isApproved){
            return res.status(403).json({
                message:'Waiting for admin approval'
            })
        }

        next()

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}