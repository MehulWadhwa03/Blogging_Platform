const express= require('express');
const router = express.Router();
const Post=require('../modles/Post')
const User=require('../modles/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const adminLayout='../views/layouts/admin';
const jwtSecret= process.env.JWT_SECRET; 

// 

const authMiddleware =(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message:'unauthorised'})
    }
    try{
        const decoded = jwt.verify(token,jwtSecret)
        req.userId=decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({message:'unauthorised'})
    }
}




// GET
// HOME
router.get('/admin',async(req,res)=>{
    try {
        const locals ={
        title:'admin',
        description:'Simple blog with NodeJs Express and MongoDB'
        } 
        // const data=await Post.find()
        res.render('admin/index' ,{locals,layout:adminLayout})
        
    } catch (error) {
        console.log(error)
        
    }
    
})

// 
// post
// admin - register
// 
router.post('/register',async (req,res)=>{
  
    try {
        const {username,password} = req.body;
        // console.log(req.body)
        const hashedPassowrd = await bcrypt.hash(password,10)
        // const data = await Post.find();

        try {
            const user=await User.create({username,password:hashedPassowrd,role:'admin'})
            res.status(201).json({message:'user created',user})
            res.redirect('/admin')
        } catch (error) {
            if(error.code===11000){
                res.status(409).json({message:'user already in use'})
            }
            res.status(500).json({message:'Internal server error'})
        }
        // res.redirect('/admin')
    } catch (error) {
        console.log(error)
        
    }
});

// 
// post
// admin - checklogin
// 
router.post('/admin',async (req,res)=>{
  
    try {
        const {username,password} = req.body;
        const user =await User.findOne({username:'admin'});

        if(!user){
            return res.status(401).json({message:'invalid username or password'})
        }
        const isPasswordValid= await bcrypt.compare(password,user.password)
        if(!user){
            return res.status(401).json({message:'invalid username or password'})
        }
        
        const token =jwt.sign({userId:user._id},jwtSecret);//saving toke to cookie
        res.cookie('token',token,{httpOnly:true})//making cookie
        
        res.redirect('/dashboard')

    } catch (error) {
        console.log(error)
        
    }
});


// 
// get
// admin - dashboard
// 

router.get('/dashboard',authMiddleware,async (req,res)=>{
    try {
        const locals={
            title:'Dahsboard',
            title:'simple blog created with NodeJs Express and MongoDb'
        }

        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
   
});


// get
// Admin - create new post
//

router.get('/edit-post/:id',authMiddleware,async (req,res)=>{
    try {
        const locals={
            title:'add post',
            title:'simple blog created with NodeJs Express and MongoDb'
        }
        const data =await Post.findOne({_id:req.params.id})

        res.render('admin/edit-post',{
            locals,
            data,
            layout:adminLayout

        })

    } catch (error) {
        console.log(error)
    }
   
});  


//
// get
// Admin - create new post
//

router.get('/add-posts',authMiddleware,async (req,res)=>{
    try {
        const locals={
            title:'add post',
            title:'simple blog created with NodeJs Express and MongoDb'
        }

        const data = await Post.find();
        res.render('admin/add-posts',{
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
   
});

//
// post
// Admin - create new post
//

router.post('/add-posts',authMiddleware,async (req,res)=>{
    try {
        // console.log(req.body)
        try {
            const  newPost =  new Post({
                title:req.body.title,
                body:req.body.body
            })
            await Post.create(newPost)
            res.redirect('/dashboard')
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
    }
   
});

//
//GET
//admin -  edit post
//

router.get('/edit-posts/:id',authMiddleware,async (req,res)=>{
    try {

        const locals={
            title:'Edit Post',
            description:'simple blog with NodeJs and MongoDB'
        }
        const data= await Post.findOne({_id:req.params.id})

        // console.log(data)

        res.render('admin/edit-posts',{
            locals,
            data,
            layout:adminLayout
        })
        
    } catch (error) {
        console.log(error)
        
    }
})



//
//PUT
//admin -  edit post
//

router.put('/edit-posts/:id',authMiddleware,async (req,res)=>{
    try {

        await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/edit-posts/${req.params.id}`)
        
    } catch (error) {
        console.log(error)
        
    }
})

/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-posts/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });

/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });
  
// 
// check login middleware dunction
// // 

// const authMiddleware =(req,res,next)=>{
//     const token=req.cookies.token;
//     if(!token){
//         return res.status(401).json({message:'unauthorised'})
//     }
//     try{
//         const decoded = jwt.verify(token,jwtSecret)
//         req.userId=decoded.userId;
//         next();
//     }catch(error){
//         return res.status(401).json({message:'unauthorised'})
//     }
// }


module.exports = router;