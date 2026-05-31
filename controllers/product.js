const prisma = require("../config/prisma")

 exports.create = async(req,res)=>{
    try{ 
        //code
        const { title,description,price,quantity,categoryId ,images,origin,
            unit,
            harvestDate,
            organic} = req.body
        // console.log(title,description,price,quantity,images)
        const product = await prisma.product.create({
            data:{
                title:title,
                description:description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId : parseInt(categoryId),
                farmerId:req.user.id,

                // organic info
                origin:origin,
                unit:unit,
                organic:organic,

                harvestDate: harvestDate
                    ? new Date(harvestDate)
                    : null,

                images:{
                    create: images
                        ? images.map((item)=>({
                            asset_id:item.asset_id,
                            public_id:item.public_id,
                            url:item.url,
                            secure_url:item.secure_url
                      }))
                    : []
                }
            }
        })
         res.send(product)
    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }

}
 exports.list = async(req,res)=>{
    try{ 
        //code
        const {count} = req.params
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: { createdAt : "desc"}, //สินค้าเรียงจากมากไปน้อย สินค้าที่ถูกเพิ่มล่าสุดจะอยู่ด้านบน
            include: {
                category: true,
                images:true,
                farmer:true
            }
        })
         res.send(products)
    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }

}
exports.listFarmerProducts = async(req,res)=>{
    try{

        const products = await prisma.product.findMany({
            where:{
                farmerId:req.user.id
            },
            include:{
                category:true,
                images:true
            }
        })

        res.send(products)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:'Server Error'
        })
    }
}
 exports.read = async(req,res)=>{
    try{ 
        //code
        const {id} = req.params
        const products = await prisma.product.findFirst({
            where:{
                id: Number(id)
            },
            include: {
                category: true,
                images:true,
                farmer:true
            }
        })
         res.send(products)
    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }

}

exports.update = async(req,res)=>{
    try{ 
        //code
        const { title,description,price,quantity,categoryId ,images, origin,
    unit,
    harvestDate,
    organic} = req.body
        // console.log(title,description,price,quantity,images)
       //clear images
       // check owner
        //const product = await prisma.product.findFirst({
        const existingProduct = await prisma.product.findFirst({
            where:{
                id:Number(req.params.id)
            }
        })

        // 
        if(existingProduct.farmerId !== req.user.id){
            return res.status(403).json({
                message:'Access Denied'
            })
        }

       await prisma.image.deleteMany({
        where:{
            productId:Number(req.params.id) //ตารางimage
        }
       })
        const product = await prisma.product.update({
           where:{
            id:Number(req.params.id)
           },
            data:{
                title:title,
                description:description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId : parseInt(categoryId)
                    ? parseInt(categoryId)
                    : null,
                origin,
                unit,
                harvestDate,
                organic,
                harvestDate: harvestDate
                ? new Date(harvestDate)
                : null,
                images:{
                    create: images.map((item)=>({
                        asset_id:item.asset_id,
                        public_id:item.public_id,
                        url:item.url,
                        secure_url:item.secure_url
                    }))
                }
            }
        })
         res.send(product)

    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }

}
exports.remove = async(req,res)=>{
    try{ 
        //code
        const { id } = req.params
            // check owner
        const product = await prisma.product.findFirst({
            where:{
                id:Number(id)
            }
        })

        if(product.farmerId !== req.user.id){
            return res.status(403).json({
                message:'Access Denied'
            })
        }
        ////รอสำหรับimages
        await prisma.product.delete({
            where:{
                id: Number(id)
            }
        })

         res.send('Delete Success')

    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }
}
exports.listby = async(req,res)=>{
    try{ 
        //code
        const { sort,order, limit } = req.body
        console.log(sort, order, limit)
        const products = await prisma.product.findMany({
            take: limit,
            orderBy:{ [sort]:order },
            include: { category: true }
        })
         res.send(products)
    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }
}





const handleQuery = async(req,res,query)=>{
    try{
        //code
        const products = await prisma.product.findMany({
            where:{
                title:{
                    contains: query,
                }
            },
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        //err
        console.log(err)
        res.status(500).json({message:"Search Error"})
    }
}
const handlePrice = async(req,res,priceRange)=>{
    try{
        const products = await prisma.product.findMany({
            where:{
                price:{
                    gte: priceRange[0],
                    lte:priceRange[1]
                }
            },
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch (err) {
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}
const handleCategory = async(req,res,categoryId)=>{
    try{
        const products = await prisma.product.findMany({
            where:{
                    categoryId: {
                        in: categoryId.map((id)=> Number(id))
                    }
                },
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch (err) {
        console.log(err)
        res.status(500).json({message:'Server Error'})
    }
}

exports.searchFilters = async(req,res)=>{
    try{ 
        //code
        const { query, category, price } = req.body
        if(query){
            console.log('query-->', query)
            await handleQuery(req,res,query)
        }
        if(category){
            console.log('category-->', category)
            await handleCategory(req,res,category)
        }
        if(price){
            console.log('price-->', price)
            await handlePrice(req,res,price)
        }


        //  res.send('Hello searchfilters product')

    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }
}


