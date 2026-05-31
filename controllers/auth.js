const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async(req,res)=>{
    //code
    try{ 
        //code
        const {email,password} = req.body
        if(!email){
            return res.status(400).json({massage: 'Email is required!!'})
        }
        if(!password){
            return res.status(400).json({massage: 'Password is required!!'})
        }
        //step2 check emaill in already?
       
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(user){
            return res.status(400).json({ meessage: "Email already exits!"})
        }
        // step 3 hashpassword
        const hashPassword = await bcrypt.hash(password,10)
        console.log(hashPassword)

        //step 4 Register
        await prisma.user.create({
            data: {
                email: email,
                password: hashPassword
            }
        })
    

         res.send('Register Success')

    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }

}

exports.login = async(req,res)=>{
    try{ 
        //code
        const {email, password}= req.body
        //step 1 check email
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(!user || !user.enable){
            return res.status(400).json({message: 'User Not found or Enabled'})
        }
        //check password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({ message: 'Password Invalid!!!'})
        }
        //create payload
        const payload = {
            id: user.id,
            email:user.email,
            role: user.role
        }
        //generate token
        jwt.sign(payload,process.env.SECRET,{ expiresIn: '1d'},(err,token)=>{ //เป็นการกำหนดสิทธ์การเข้าใช้งาน1dคือให้ใช้งานในระบบแค่1วัน
            if(err){
                return res.status(500).json({ messag: "Server Error"})
            }
            res.json({payload,token})
        })
    }catch (err){
        //err
        console.log(err)
        res.status(500).json({message: "Server Error "})
    }
}
exports.currentUser = async(reg,res)=>{
    try{
        //code
        res.send('hello current user ')
    }catch (err){
    //err
    console.log(err)
    res.status(500).json({ message: "Server error"})
}
}
