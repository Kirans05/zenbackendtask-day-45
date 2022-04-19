// mongodb+srv://kiran:t8uG7DcduW7VpOl1@cluster0.yo2mf.mongodb.net/test?authSource=admin&replicaSet=atlas-21lddk-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true
const {MongoClient} = require("mongodb")
const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const {hashPassword,comparePassword} = require("./hash")
const { createTransport } = require("nodemailer")
const app = express()
app.use(express.json())
app.use(cors())
const url = `mongodb+srv://kiran:NRAgrrZT70l3ZH2x@cluster0.pchuk.mongodb.net/test?authSource=admin&replicaSet=atlas-sgk23x-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`
const databasenmae = "urlshortner"
const client = new MongoClient(url)


// signup process
app.post("/signup",async (req,res)=>{
    console.log(req.body)
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.findOne({email:req.body.email})
    if(user) {
        res.send("user already exist")
    }else{
        let modifiedPasword = await hashPassword(req.body.password)
        req.body.password = modifiedPasword
        let inserteddata = await table.insertOne(req.body)
        res.send("SignUp Successfull")
    }
})


// login process
app.post("/login",async (req,res)=>{
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.find({email:req.body.email}).toArray()
    console.log(user)
    if(user.length){
        let compareResult = await comparePassword(req.body.password,user[0].password)
        if(compareResult){
            res.json({
                message:"login Successfull",
                email:user[0].email
            })
        }else{
            res.json({
                message:"Incorrect Password"
            })
        }
    }else{
        res.json({
            message:"emailid does not exist"
        })
    }
})

// updatePassword
app.post("/updatepassword",async (req,res)=>{
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.findOne({email:req.body.email})
    if(user){
        let modifiedPasword = await hashPassword(req.body.password1)
        req.body.password = modifiedPasword  
        let updatePassword = await table.updateOne({email:user.email},{$set:{password:req.body.password}})
        res.send("Password Updated")
    }else{
        res.send("EmailId does not exist Please SignUP")
    }
})


// email verification 
app.post("/emailverification",async (req,res)=> {
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.find({email:req.body.email}).toArray()
    if(user.length){
                        let transporter = createTransport({
                            service:"gmail",
                            auth:{
                                user:"nodejs500@gmail.com",
                                pass:"kiran@7624"
                            }
                        })
                        let randomValues = (Math.random()*1000000).toFixed(0)
                        let updateotp = await table.updateOne({email:req.body.email},{$set:{otp:randomValues}})
                        let mailOptions = {
                            from:"nodejs500@gmail.com",
                            to:`${req.body.email}`,
                            subject:"Password ResetEmail Verification",
                            text:`this is a password reset mail Your otp for password reset is - ${randomValues}`
                        }
                        transporter.sendMail(mailOptions,(err,info)=>{
                            if(err){
                                res.send("err")
                            }else{
                                res.send("OTP sent")
                            }
                        })
    }else{
        res.send("User Does Not Exist")
    }
})



//otp verification
app.post("/otpverification",async (req,res)=>{
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.find({email:req.body.email}).toArray()
    console.log(user)
    if(user.length> 0){
            if(user[0].otp == req.body.otp){
                let removeOtp = await table.updateOne({email:user[0].email},{$unset:{otp:req.body.otp}})
                res.send("Correct OTP")
            }else{
                res.send("Incorrect OTP")
            }
    }else{
        res.send("User Does Not Exists")
    }
})




// adding url to database 
app.post("/addurl",async (req,res) => {
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.find({email:req.body.email}).toArray()
    if(user.length){
        if(user[0].urlshorten){
            user[0].urlshorten.push(req.body.urlvalue)
            let insertUrl = await table.updateOne({email:req.body.email},{$set:{urlshorten:user[0].urlshorten}})
            res.send("url inserted")
        }else{
            let urlshorten = []
            urlshorten.push(req.body.urlvalue)
            let insertUrl = await table.updateOne({email:req.body.email},{$set:{urlshorten:urlshorten}})
            res.send("url inserted")
        }
    }else{
        res.send("User Does Not Exists")
    }
})


app.post("/showurl",async (req,res) => {
    let response = await client.connect()
    let db = await response.db(databasenmae)
    let table = await db.collection("table")
    let user = await table.find({email:req.body.email}).toArray()
    if(user.length){
        if(user[0].urlshorten){
            res.json({
                message:"user found",
                list:user[0].urlshorten
            })
        }else{
            res.json({
                message:"no url found"
            })
        }
    }else{
        res.json({
            message:"user not found"
        })
    }
})


app.listen(4000,()=>{
    console.log("port is running")
})