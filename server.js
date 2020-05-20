require('./config/config')

const express=require('express');
const{ObjectID}=require('mongodb')
const bodyParser=require('body-parser');
const _=require('lodash');

const {mongoose}= require('./db/mongoose');
const {Todo}=require('./models/todo');
const {users}=require('./models/users');

const app=express();
app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
    const todo =new Todo({
        text: req.body.text
    })
    todo.save()
        .then((doc)=>res.status(200).send(doc))
        .catch((err)=>res.status(400).send(err))
});

app.get('/todos',(req,res)=>{
    Todo.find()
        .then((todos)=>res.status(200).send({todos}))
        .catch((err)=>res.status(400).send(err));
})

app.get('/todos/:id',(req,res)=>{
    var id=req.params.id
    if(!ObjectID.isValid(id))
        return res.status(404).send('ID is not valid')
    Todo.findById(id)
        .then((todos)=>{
            if(todos!==null)
                return res.status(200).send(todos);
            else
                return res.status(404).send('ID not found')
        }).catch((err)=>{res.status(400).send(err)})
})

app.delete('/todos/:id',(req,res)=>{
    var id=req.params.id;
    if(!ObjectID.isValid(id))
        return res.status(404).send('ID is not valid')
    
    Todo.findByIdAndRemove(id)
        .then((todos)=>{
            if(todos!==null)
                return res.status(200).send(todos);
            else
                return res.status(404).send('ID not found')
        }).catch((err)=>{res.status(400).send(err)})
})

app.patch('/todos/:id',(req,res)=>{
    const id=req.params.id;
    let body=_.pick(req.body,['text','completed']);
    if(!ObjectID.isValid(id))
        return res.status(404).send('ID is not valid')
    if(_.isBoolean(body.completed) && body.completed)
        body.completedAt= String(new Date());
    else{
        body.completed=false;
        body.completedAt=null;
    }
    Todo.findByIdAndUpdate(id,{$set: body},{new: true})
        .then((todo)=>{
            if(!todo){
                return res.status(404).send('ID not found')
            }else{
                return res.status(200).send(todo)
            }
        }).catch((err)=>{res.status(400).send(err)})

})

const server= app.listen(process.env.PORT,()=>{
    console.log(`Listening on port ${process.env.PORT}...`);
})

module.exports=server;