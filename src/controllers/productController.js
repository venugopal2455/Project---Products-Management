const productModel = require("../models/productModel")
const  { isValid,isValidBody, validString, validMobileNum, validEmail, validPwd, isValidObjectId, validPrice, validSize} = require('../utils/validation')
const {uploadFile} = require("../utils/awss3")



////=====================================product api post===================================
const createProduct= async function(req, res) {
    try{

    let files= req.files
    let data= req.body

    if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter product details"})

    //title is Present or not
    if(!data.title) return res.status(400).send({status: false, message: "title is required"}) 

    //validate title
    if(validString(data.title) ) return res.status(400).send({status: false, message: "title should be characters and should not contains any numbers"})

    //check title already exist or not
    let checkUniqueTitle = await productModel.findOne({title: data.title})
    if(checkUniqueTitle) return res.status(400).send({status: false, message: "title is already exist"})

    //check description is present or not
    if(!data.description) return res.status(400).send({status: false, message: "description is required"})

    //validate description
    if(!isValid(data.description)) return res.status(400).send({status: false, message: " valid description is required"})

    //check for price
    if(!data.price) return res.status(400).send({status: false, message: "price is required"})

    //validate price
    if(validPrice(data.price)) return res.status(400).send({status: false, message: "Price is accept both number and decimal"})

    //check for currecyId
    if(!data.currencyId) return res.status(400).send({status: false, message: "currencyId is required"})
     if(data.currencyId !=="INR") return res.status(400).send({status: false, message: " valid currencyId i.e..,INR is required"})

     //check for currency format
    if(!data.currencyFormat) return res.status(400).send({status: false, message: "currency format  is required"})
    if(data.currencyFormat!=="₹") return res.status(400).send({status: false, message: " valid currencyformat i.e., ₹ is required"})

    //check for size and validate sizes
    if(!data.availableSizes) return res.status(400).send({status: false, message: "size is required"})
    if(isValid(data.availableSizes) && validString(data.availableSizes))  return res.status(400).send({ status: false, message: "Enter at least one available size" });

    data.availableSizes = data.availableSizes.split(",")
    console.log(data.availableSizes)
    for (let i = 0; i < data.availableSizes.length; i++) {
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(data.availableSizes[i]))
            return res.status(400).send({ status: false, message: "Avaliable Size CAN BE S,XS,M,X,L,XXL,XL.in body give like this S,XL type" })
    }
   
    //check for style
    if(data.style){
    if(!isValid(data.style)) return res.status(400).send({status: false, message: "style is required"})
    }

    //check for installment
      if(data.installments){
        if(!isValid(data.installments)) return res.status(400).send({status: false, message: "installments is required"})   
      }


    if(files && files.length>0){
        let uploadedFileURL= await uploadFile( files[0] )
        data.productImage=uploadedFileURL
    }
    else{
        res.status(400).send({status: false, message: "Product Image is required" })
    }

    // here we can start user creation

    let productData= await productModel.create(data)
    res.status(201).send({status: true, message: "created successfully", data: productData})
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

//===============================================================GET /products================================================================

const getProduct = async(req, res) => {
    try {
        let data = req.query
        let conditions = {isDeleted: false}

       
        if(isValidBody(data)){
            let products = await productModel.find(conditions).sort({price: 1})
            if(products.length == 0) return res.status(404).send({status: false, message: "No products found"})
            return res.status(200).send({status: true, count: products.length,  message: "success", data: products})
        }

        //filter

        if(data?.size || typeof data.size == 'string'){
            data.size = data.size.toUpperCase()
            if(!validSize(data.size)) return res.status(400).send({status: false, message: "Size should be one of S,XS,M,X,L,XXL,XL"})
          
            conditions.availableSizes = {}
            conditions.availableSizes['$in'] = [data.size]
        }

        if(data?.name){
            if(validString(data.name)) return res.status(400).send({status: false, message: "Enter the value of products in name"})

            //using $regex to match the names of products 
            conditions.title = {}
            conditions.title['$regex'] = data.name
        }

        //validating the filter - PRICEGREATERTHAN
        if(data?.priceGreaterThan) {
        if(typeof data.priceGreaterThan == 'string') {
          if(!validString(data.priceGreaterThan)) return res.status(400).send({ status: false, message: "Price of product should be in numbers" });
          
          data.priceGreaterThan = JSON.parse(data.priceGreaterThan);
          if(!(/^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(data.priceGreaterThan))) return res.status(400).send({ status: false, message: "Price of product should be valid" });
  
          if(!conditions?.price){
            conditions.price = {}
          }
          conditions.price['$gte'] = data.priceGreaterThan
        }
      }
  
      //validating the filter - PRICELESSTHAN
        if(data?.priceLessThan) {
        if(typeof data.priceLessThan == 'string') {
          if(!validString(data.priceLessThan)) return res.status(400).send({ status: false, message: "Price of product should be in numbers" });
          
          data.priceLessThan = JSON.parse(data.priceLessThan);
          if(!(/^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(data.priceLessThan))) return res.status(400).send({ status: false, message: "Price of product should be valid" });
  
          if(!conditions?.price){
            conditions.price = {}
          }
          conditions.price['$lte'] = data.priceLessThan
        }
      }
        
        //get the products with the condition provided
        let filterProducts = await productModel.find(conditions).sort({sort: 1})
        //console.log(filterProducts)
        if(filterProducts.length == 0) return res.status(404).send({status: false, message: "No products foundd"})
        return res.status(200).send({status: true, count: filterProducts.length, message: "success", data: filterProducts})
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

//============================================================getProductById===================================================================

const getProductById = async function (req, res) {
    try {
      let productId = req.params.productId
  
      //validate userId        
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })
  
      //get all the details 
      let productDetails = await productModel.findById(productId)
  
      if(productDetails.isDeleted==true) return res.status(404).send({ status: false, message: "Product is not Present"})
  
      if (!productDetails)
        return res.status(400).send({ status: false, message: "Product doesn't exist" })
      else
        return res.status(200).send({ status: true, message: "Product details", data: productDetails })
  
  
    } catch (err) {
      res.status(500).send({ status: false, Error: err.message })
    }
  }

  //=====================================================update api==========================================================================

  const updateProduct = async(req, res) => {
      try{
        let productId = req.params.productId

        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Enter a valid productId" });
    
        let checkProduct = await productModel.findById(productId) ;
        if(!checkProduct) return res.status(404).send({ status: false, message: "No product found check the ID and try again" })
    
        if(checkProduct.isDeleted == true) return res.status(404).send({ status: false, message: "No products found or might have already been deleted" })
    
        let data = req.body;
        let files = req.files
    
        //checking for product image
        if(files.length > 0) {
          //uploading the product image
          let productImgUrl = await uploadFile(files[0]);
          data.productImage = productImgUrl;
        }
    
        if(isValidBody(data)) return res.status(400).send({ status: false, message: "Enter data to update product" });
    
        //if(isValid(data)) return res.status(400).send({ status: false, message: "Enter data to update product" });
    
       if(data?.isDeleted || data?.deletedAt) return res.status(400).send({ status: false, message: "Action forbidden" });
    
        // if(data?.title) {
        //   //checking for product title
        //   if(validString(data.title)) return res.status(400).send({ status: false, message: "Title should not be an empty string" });
    
        //   //checking for duplicate title
        //   if(checkProduct.title == data.title) return res.status(400).send({ status: false, message: "Title already exist" });
        // };
        //validate title
        if(validString(data.title) ) return res.status(400).send({status: false, message: "title should be characters and should not contains any numbers"})

         //check title already exist or not
        let checkUniqueTitle = await productModel.findOne({title: data.title})
        if(checkUniqueTitle) return res.status(400).send({status: false, message: `${data.title} title is already exist `})

    
        if(data?.description) {
          //checking for product description
          if(!isValid(data.description) && validString(data.description)) return res.status(400).send({ status: false, message: "Description should not be an empty string or any numbers in it" });
        };
    
        if(data?.price) {
          //checking for product price
          if((!validString(data.price) && validPrice(data.price))) return res.status(400).send({ status: false, message: "Price of product should be valid and in numbers" });
        }
    
        if(data?.currencyId) {
          //checking for currencyId 
          if(!data.currencyId) return res.status(400).send({status: false, message: "currencyId is required"})
          if(data.currencyId!=="INR") return res.status(400).send({status: false, message: " valid currencyId i.e..,INR is required"})
        }
    
        if(data?.currencyFormat) {
          //checking for currency formate
          if(!data.currencyFormat) return res.status(400).send({status: false, message: "currency format  is required"})
          if(data.currencyFormat!=="₹") return res.status(400).send({status: false, message: " valid currencyformat i.e., ₹ is required"})
        }
    
        //checking freeShipping value is present
        if(data?.isFreeShipping) {
          if(typeof data.isFreeShipping == 'string'){
            //converting it to lowercase and removing white spaces
            data.isFreeShipping = data.isFreeShipping.toLowerCase().trim();
            if(data.isFreeShipping == 'true' || data.isFreeShipping == 'false') {
              //convert from string to boolean
              data.isFreeShipping = JSON.parse(data.isFreeShipping);
            }else {
              return res.status(400).send({ status: false, message: "Enter a valid value for isFreeShipping" })
            }
          }
          if(typeof data.isFreeShipping !== 'boolean') return res.status(400).send({ status: false, message: "Free shipping should be in boolean value" })
        }
    
        //checking for style in data
        if(data?.style){
          if(isValid(data.style) && validString(data.style)) return res.status(400).send({ status: false, message: "Style should be valid an does not contain numbers" });
        }

        if(data?.availableSizes) {
            //checking for available Sizes of the products
            if(isValid(data.availableSizes) && validString(data.availableSizes))  return res.status(400).send({ status: false, message: "Enter at least one available size" });
      
              data.availableSizes = data.availableSizes.split(",")
            console.log(data.availableSizes)
      for (let i = 0; i < data.availableSizes.length; i++) {
          if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(data.availableSizes[i]))
              return res.status(400).send({ status: false, message: "Avaliable Size CAN BE S,XS,M,X,L,XXL,XL" })
      }
          }
        
        //checking for installments in data
        if(data?.installments) {
          if(!validString(data.installments)) return res.status(400).send({ status: false, message: "Installments should be in numbers" });
          if(validPrice(data.installments)) return res.status(400).send({ status: false, message: "Installments should be valid" });
        }
    
        let updatedProduct = await productModel.findByIdAndUpdate( {_id: productId}, data,{new: true})
        res.status(200).send({ status: true, message: "Product updated successfully", data: updatedProduct })
      }catch(err){
        res.status(500).send({ status: false, Error: err.message })
      }
  }

  const deleteProduct = async function (req, res) {
    try {
        const productId=req.params.productId
        if (!isValidObjectId(productId)) 
        return  res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
        const existProductId=await productModel.findById({_id: productId})
        if(!existProductId){
            return res.staus(400).send({status:false,msg:"please provide valid productId"})
        }
        if (existProductId.isDeleted === false) {
            await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } })

            return res.status(200).send({ status: true, message: "Product deleted successfully."})
        }else{
            return res.status(400).send({ status:false, message: "Product is alredy deleted."})
        }
    } catch (err) {
      res.status(500).send({ status: false, Error: err.message })
    }
  }




module.exports = {createProduct, getProduct, getProductById, updateProduct, deleteProduct}