const userModel= require('../model/userModel')
const { isValidString, isValidName, isValidMobile, isValidPassword, isValidEmail , isIdValid} = require('../validation/validator')
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')

//////////////////////////////////////////////********AWS**********////////////////////////////////////////////////////
aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile= async ( file) =>{
 return new Promise( function(resolve, reject) {
  // this function will upload file to aws and return the link
  let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

  var uploadParams= {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "abc/" + file.originalname, //HERE 
      Body: file.buffer
  }


  s3.upload( uploadParams, function (err, data ){
      if(err) {
          return reject({"error": err})
      }
      console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
  })

  // let data= await s3.upload( uploadParams)
  // if( data) return data.Location
  // else return "there is an error"

 })
}


///////////////////////////////////////////////////////////////////////////////////////////////////

const createUser = async function (req , res) {
  try{
    let files = req.files
    if(files && files.length>0) {
      let uploadFileUrl = await uploadFile(files[0])
      req.body.profileImage = uploadFileUrl
    }
  const { fname, lname, email, profileImage, phone, password, address } = req.body
  // let files = req.files
  // console.log(files)
  // if(files && files.length>0) {
  //   let uploadFileUrl = await uploadFile(files[0])
  //   req.body.profileImage = uploadFileUrl
  // }
  if (Object.keys(req.body).length == 0) {
    return res.status(400).send({ status: false, message: "request body can't be empty" })
  }
  if (!fname) {
    return res.status(400).send({ status: false, message: "fname is required" })
  }
  if (!isValidString(fname) || !isValidName(fname)) {
    return res.status(400).send({ status: false, message: "fname is not valid" })
  }
  if (!lname) {
    return res.status(400).send({ status: false, message: "lname is required" })
  }
  if (!isValidString(lname) || !isValidName(lname)) {
    return res.status(400).send({ status: false, message: "lname is not valid" })
  }
  if (!email) {
    return res.status(400).send({ status: false, message: "email is required" })
  }
  if (!isValidEmail(email)) {
    return res.status(400).send({ status: false, message: "email is not valid" })
  }
  const findEmail = await userModel.findOne({email : email})
  if(findEmail) {
    return res.status(400).send({status : false, message : "email is already exist"})
  }
  // if (!profileImage) {
  //   return res.status(400).send({ status: false, message: "profileImage is required" })
  // }
  if (!phone) {
    return res.status(400).send({ status: false, message: "phone number is required" })
  }
  if (!isValidMobile(phone)) {
    return res.status(400).send({ status: false, message: "phone number is not valid" })
  }
  const findPhone = await userModel.findOne({phone : phone})
  if(findPhone) {
    return res.status(400).send({status : false, message : "phone number is already exist"})
  }
  if (!password) {
    return res.status(400).send({ status: false, message: "password is required" })
  }
  if (!isValidPassword(password)) {
    return res.status(400).send({ status: false, message: "password is not valid" })
  }
  let hashedPassword = bcrypt.hashSync(password , 10)
  if (!address) {
    return res.status(400).send({ status: false, message: "address is required" })
  }
  if (address) {
    const { shipping, billing } = address
    if (shipping) {
      const { street, city, pincode } = shipping
      if (street) {
        if (!isValidName(street) || !isValidString(street)) {
          return res.status(400).send({ status: false, message: "please enter valid street name" })
        }
      }
      if (city) {
        if (!isValidName(city) || !isValidString(city)) {
          return res.status(400).send({ status: false, message: "please enter valid city name" })
        }
      }
      if (pincode) {
        if (!/^[0-9]$/.test(pincode)) {
          return res.status(400).send({ status: false, message: "please enter valid pincode" })
        }
      }
    }
    if (billing) {
      const { street, city, pincode } = billing
      if (street) {
        if (!isValidName(street) || !isValidString(street)) {
          return res.status(400).send({ status: false, message: "please enter valid street name" })
        }
      }
      if (city) {
        if (!isValidName(city) || !isValidString(city)) {
          return res.status(400).send({ status: false, message: "please enter valid city name" })
        }
      }
      if (pincode) {
        if (!/^[0-9]$/.test(pincode)) {
          return res.status(400).send({ status: false, message: "please enter valid pincode" })
        }
      }
    }
  }
  const userCreate = await userModel.create({fname , lname , email , phone , profileImage , hashedPassword , address})
  return res.status(200).send({status : true , message : "data created succesfully" , data : userCreate})
}
catch(err) {
  return res.status(500).send({status : false, message : err.message})
}
}

module.exports.createUser = createUser


const getUserData= async function (req,res){

    try{
        let userId= req.params.userId
        if(!isIdValid(userId)) return res.status(400).send({status:false,message:"Invalid userId"})
        let fetchData= await userModel.findOne({userId:_id})
        if(!fetchData) return res.status(404).send({status:false,message:"No data found with this userId"})
        return res.status(200).send({status:true,message:"User profile details",data:fetchData})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={getUserData}