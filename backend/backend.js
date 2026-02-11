const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();
const {z} = require('zod');
const JWT_SECRET = 'anay123';
const saltRound = 5;
const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const { userModel , todoModel} = require('./db');


const cors = require('cors')


app.use(cors());

app.use(express.json());

mongoose.connect('mongodb+srv://AnayCse:anaycse@cluster0.k0pfjvb.mongodb.net/todo-app?appName=Cluster0')
.then(() => {
    console.log('Connected to db')
})
.catch((err) => {
    console.log("COnnection failed : " , err);
})

app.post('/signUp' , async (req , res) => {

    const requiredBody = z.object({
        email : z.string().email() , 
        name : z.string().max(100), 
        password : z.string()
                    .min(3)
                    .max(100)
                    .refine((password) => 
                        /[a-z]/.test(password) , 
                        {
                            message : "atleast one lower case character"
                        }
                    )
                    .refine((password) => 
                    /[A-Z]/.test(password) , {
                        message : "atleast one UPPER case character"
                                    
                    })
                    .refine((password) => 
                        /[0-9]/.test(password) , {
                            message : "atleast one number"
                    })
    })

    const parse = requiredBody.safeParse(req.body);

    if(!parse.success){
        return res.status(404).json({
            message : "The fields dont match the checks" , 
            err : parse.error
        })
    }

    const {email , password , name} = parse.data;

    try{
        const hashedPass = await bcrypt.hash(password , saltRound);
        await userModel.create({
            email , password : hashedPass , name
        })

        }catch(e){
            return res.status(501).json({
                message : "Signup failed" , error : e.message
            })
        }
        res.json({
        message : "sign up successful"
    })
    }


)

app.post('/signIn' , async(req , res) => {
    try{
        const requiredBody = z.object({
        email : z.string().email() , 
        password : z.string().min(3)
        })

        const parsed = requiredBody.safeParse(req.body);

        const {email , password} = parsed.data;
        if(!parsed.success){
            return res.status(404).json({
                message : "The fields dont match the checks"
            })
        }
        const user = await userModel.findOne({email : email});
        if(!user){
            return res.status(404).json({
                message : "The email does not exists.. check again"
           })
        }

        const passMatch = await bcrypt.compare(password , user.password);
        if(!passMatch){
            return res.status(404).json({
                message : "Invalid Email or password"
            })
        }

        const token = jwt.sign({
            id : user._id
        } , JWT_SECRET);

        res.json({
            token : token
        })

    }catch(err){
        res.status(500).send({
            errror : err.message
        })
    }
})

function verifyToken(req , res , next){
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(404).json({
                message : "no token provided"
            })
        }

        const token = authHeader.split(" ")[1];

        const decodedCode = jwt.verify(token , JWT_SECRET);

        const userId = decodedCode.id;
        if(userId){
            req.userId = userId;
            next();
        }

        else return res.status(404).json({
            mesasge : "You are not logged in"
        })


    }catch(err){
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}

app.post('/todo' , verifyToken , async(req , res) => {
        const {todo , done} = req.body;

        try{
            await todoModel.create({
                todo , done , userId : req.userId
            })
        }catch(err){
            return res.status(500).json({
                message : "There was an error while createing todo" , error : err.message
            })
        } 
        return res.json({
            message : "todo successfully created"
        })

    }
)

app.get('/todos' , verifyToken , async(req , res) => {
    const userId = req.userId;

    try{
        const todo = await todoModel.find({
            userId : userId
        }); 

        if(todo){
            return res.json({
                todo
            })
        }
    }catch(err){
        return res.status(500).json({
            message : "Cannnot load todos"
        })
    }

})


app.listen(3000);


