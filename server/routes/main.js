const express= require('express');
const router = express.Router();
const Post=require('../modles/Post')
const adminLayout='../views/layouts/admin';
const User=require('../modles/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const jwtSecret= process.env.JWT_SECRET; 

//auth
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
// router.get('',async(req,res)=>{
//     try {
//         const locals ={
//         title:'Bogging',
//         description:'Simple blog with NodeJs Express and MongoDB'
//         } 
//         const data=await Post.find()
//         res.render('index',{locals,data})
        
//     } catch (error) {
//         console.log(error)
        
//     }
    
// })

//
// GET 
// HOME
//
router.get('', async (req, res) => {
    try {
      const locals = {
        title: "NodeJs Blog",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      let perPage = 10;
      let page = req.query.page || 1;
  
      const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
  
      const count = await Post.count();
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);
  
      res.render('index', { 
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        currentRoute: '/'
      });
    } catch (error) {
      console.log(error);
    }
  
  });


// GET
// POSTS ;id
router.get('/posts/:id',async(req,res)=>{
    try {
        

        let slug= req.params.id
        console.log(slug)
        

        const data=await Post.findById({_id:slug})
        const locals ={
            title:data.title,
            description:'Simple blog with NodeJs Express and MongoDB'
    
            } 
        res.render('posts',{locals,data})
        
    } catch (error) {
        console.log(error)
        
    }
    
})


// Post
// POSTS -search tem
router.post('/search',async(req,res)=>{
    try {
        
        const locals ={
            title:'search',
            description:'Simple blog with NodeJs Express and MongoDB'
            } 
        let searchTerm=req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

        const data = await Post.find({
            $or: [
              { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
              { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
          })
        // res.render('posts',{locals,data})
        res.render('search',{data,locals})
        
    } catch (error) {
        console.log(error)
        
    }
    
})
// USERS

// get
// Register
//
router.get('/register',async(req,res)=>{
      try {
          const locals ={
          title:'Register',
          description:'Simple blog with NodeJs Express and MongoDB'
          } 
          const data=await Post.find()
          res.render('register',{locals,data})
          
      } catch (error) {
          console.log(error)
          
      }
      
  })

// GET
// HOME
// router.get('/admin',async(req,res)=>{
//   try {
//       const locals ={
//       title:'admin',
//       description:'Simple blog with NodeJs Express and MongoDB'
//       } 
//       // const data=await Post.find()
//       res.render('admin/index' ,{locals,layout:adminLayout})
      
//   } catch (error) {
//       console.log(error)
      
//   }
  
// })


//registe
//post
  router.post('/register',async (req,res)=>{
  
    try {
        const {username,password} = req.body;
        // console.log(req.body)
        const hashedPassowrd = await bcrypt.hash(password,10)
        // const data = await Post.find();

        try {
            const user=await User.create({username,password:hashedPassowrd})
            // res.status(201).json({message:'user created',user})
            console.log(`message:'user created',user`)
            res.render('about')
        } catch (error) {
            if(error.code===11000){
                res.status(409).json({message:'user already in use'})
            }
            res.status(500).json({message:'Internal server error'})
        }
        // res.redirect('about')
    } catch (error) {
        console.log(error)
        
    }
});


// get
// Sign IN
//
// get
// Register
//
router.get('/signin',async(req,res)=>{
  try {
      const locals ={
      title:'Register',
      description:'Simple blog with NodeJs Express and MongoDB'
      } 
      const data=await Post.find()
      // console.log(data)
      res.render('signin',{locals,data})
      
  } catch (error) {
      console.log(error)
      
  }
  
})


// 
// post
// admin - checklogin
// 
router.post('/signin',async (req,res)=>{
  
  try {
      const {username,password} = req.body;
      const user =await User.findOne({username:username});
      // console.log(username,user)

      if(!user){
          return res.status(401).json({message:'invalid username or password'})
      }
      const isPasswordValid= await bcrypt.compare(password,user.password)
      if(!user){
          return res.status(401).json({message:'invalid username or password'})
      }
      
      const token =jwt.sign({userId:user._id,username:username},jwtSecret);//saving toke to cookie
      res.cookie('token',token,{httpOnly:true})//making cookie
      
      res.redirect('users-posts')

  } catch (error) {
      console.log(error)
      
  }
});

// 
// get
// admin - dashboard
// 

router.get('/users-posts',authMiddleware, async(req,res)=>{
  try {
    const locals={
      title:'Dahsboard',
      title:'simple blog created with NodeJs Express and MongoDb'
  }
    const token=req.cookies.token;
  const decoded = jwt.verify(token,jwtSecret)
  console.log('type of id'+decoded.userId)

  const data = await Post.find({ owner: (decoded.userId) });
  console.log(data)
  // res.render('users-posts')
  res.render('users-posts',{
      locals,
      data,
  })
    
  } catch (error) {
    console.log(error)
    
  }

})

//
// GET 
// Admin Logout
//¸


router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});

// user
//add new post
//
router.get('/users-add-posts',authMiddleware,async (req,res)=>{
  try {
      const locals={
          title:'add post',
          title:'simple blog created with NodeJs Express and MongoDb'
      }

      const data = await Post.find();
      res.render('users-add-posts',{
          locals,
          data,
          
      })
  } catch (error) {
      console.log(error)
  }
 
});


//
// post
// Admin - create new post
//

router.post('/users-add-posts',authMiddleware,async (req,res)=>{
  try {
      // console.log(req.body)
      const token=req.cookies.token;
  const decoded = jwt.verify(token,jwtSecret)
      try {
          const  newPost =  new Post({
              title:req.body.title,
              body:req.body.body,
              owner:decoded.userId
          })
          await Post.create(newPost)
          res.redirect('users-posts')
      } catch (error) {
          console.log(error)
      }
  } catch (error) {
      console.log(error)
  }
 
});


//
//GET
//users -  edit post
//

router.get('users-edit-posts/:id',authMiddleware,async (req,res)=>{
  try {

      const locals={
          title:'Edit Post',
          description:'simple blog with NodeJs and MongoDB'
      }
      const data= await Post.findOne({_id:req.params.id})

      // console.log(data)

      res.render('users-edit-posts',{
          locals,
          data,
      })
      
  } catch (error) {
      console.log(error)
      
  }
})


//
//PUT
//admin -  edit post
//

router.put('/users-edit-posts/:id',authMiddleware,async (req,res)=>{
  try {

      await Post.findByIdAndUpdate(req.params.id,{
          title: req.body.title,
          body: req.body.body,
          updatedAt: Date.now()
      })
      res.redirect(`users-edit-posts/${req.params.id}`)
      
  } catch (error) {
      console.log(error)
      
  }
})


/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/users-delete-posts/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/users-posts');
  } catch (error) {
    console.log(error);
  }

});


// router.get('/users-posts',authMiddleware,async (req,res)=>{
//   try {
//       const locals={
//           title:'Dahsboard',
//           title:'simple blog created with NodeJs Express and MongoDb'
//       }
//       console.log(username)
//       const data = await Post.find({owner:username});
//       res.render('user-posts',{
//           locals,
//           data,
        
//       })
//   } catch (error) {
//       console.log(error)
//   }
 
// });





router.get('/about',(req,res)=>{
  res.render('about')
});


// function insertPostData(){
//   Post.insertMany([
//     {
//                         title: "test1",
//                         body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js",
//                         owner:'mehul'
//                       },
//                       {
//                         title: "test2",
//                         body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments...",
//                         owner:'mehul'

//                       },
//   ])
// }
// insertPostData()
// router.get('/post/:id',async (req,res)=>{
 
//     try {
        
//         let slug= req.params.id;

//         const data = await Post.findById({_id: slug})

//         const locals = {
//             title: data.title,
//             description:'simple blog created with NodeJs Express & MongoDB'
//         }

//         res.render('post',{locals,data})
//     } catch (error) {
//         console.log(error)
        
//     }

// });




// function insertPostData(){
//     Post.insertMany([
//         {
//                   title: "Building APIs with Node.js",
//                   body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//                 },
//                 {
//                   title: "Deployment of Node.js applications",
//                   body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//                 },
//                 {
//                   title: "Authentication and Authorization in Node.js",
//                   body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//                 },
//                 {
//                   title: "Understand how to work with MongoDB and Mongoose",
//                   body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//                 },
//                 {
//                   title: "build real-time, event-driven applications in Node.js",
//                   body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//                 },
//                 {
//                   title: "Discover how to use Express.js",
//                   body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//                 },
//                 {
//                   title: "Asynchronous Programming with Node.js",
//                   body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//                 },
//                 {
//                   title: "Learn the basics of Node.js and its architecture",
//                   body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//                 },
//                 {
//                   title: "NodeJs Limiting Network Traffic",
//                   body: "Learn how to limit netowrk traffic."
//                 },
//                 {
//                   title: "Learn Morgan - HTTP Request logger for NodeJs",
//                   body: "Learn Morgan."
//                 },
//     ])

// }
// insertPostData()
module.exports=router