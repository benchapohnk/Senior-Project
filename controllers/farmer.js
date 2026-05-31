const prisma = require('../config/prisma')


// สมัคร farmer
exports.registerFarmer = async(req,res)=>{
    try{

        const {
            farmName,
            phone,
            description,
            address
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