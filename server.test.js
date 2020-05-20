const request=require('supertest');
const _=require('lodash')
let server;
const {Todo}=require('./models/todo');
const {ObjectID} = require('mongodb');

beforeAll(done=>{
    server=require('./server');
    done()
})
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }];
  
beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
      return Todo.insertMany(todos);
    }).then(() => done());
  });
afterAll(done=>{
    server.close(done);
})


describe('POST /todos',()=>{
    test('Should add a new todo',async (done)=>{
        const res= await request(server).post('/todos').send({text: "todo TEst"})
        expect(res.status).toBe(200)
        expect(res.body.text).toEqual("todo TEst")
        const todos= await Todo.find({text: "todo TEst"})
        expect(todos.length).toBe(1);
        expect(todos[0].text).toEqual("todo TEst")
        done()
    })
    test('should not add a new todo',async(done)=>{
        const res= await request(server).post('/todos').send({})
        expect(res.status).toBe(400)
        const todos=await Todo.find()
        expect(todos.length).toBe(2);
        done()
    })
})

describe('GET /todos',()=>{
    test('Should get all todos',async (done)=>{
        const res=await request(server).get('/todos')
        expect(res.status).toBe(200)
        expect(res.body.todos.length).toBe(2)
        done()
    })
})

describe('GET /todos/:id',()=>{
    test('Should get todo with the id', async(done)=>{
        const res=await request(server).get(`/todos/${todos[0]._id.toHexString()}`)
        expect(res.status).toBe(200);
        expect(res.body.text).toBe(todos[0].text);
        done()
    })
    test('Should return 404 if ID not found',async(done)=>{
        const hexid= new ObjectID().toHexString();
        const res=await request(server).get(`/todos/${hexid}`)
        expect(res.status).toBe(404)
        done()
    })
    test('Should return 404 if Id not valid',async(done)=>{
        const res=await request(server).get(`/todos/123`)
        expect(res.status).toBe(404)
        done()
    })

})

describe('DELETE /todos/:id',()=>{
    test('Should delete the todo with the id',async(done)=>{
        const res=await request(server).delete(`/todos/${todos[0]._id.toHexString()}`)
        expect(res.status).toBe(200);
        expect(res.body.text).toBe(todos[0].text);
        const todo= await Todo.find({text: "First test todo"})
        expect(todo.length).toBe(0);
        done()
    })
    test('Should return 404 if ID not found',async(done)=>{
        const hexid= new ObjectID().toHexString();
        const res=await request(server).delete(`/todos/${hexid}`)
        expect(res.status).toBe(404)
        done()
    })
    test('Should return 404 if Id not valid',async(done)=>{
        const res=await request(server).delete(`/todos/123`)
        expect(res.status).toBe(404)
        done()
    })
})

describe('PATCH /todos/:id',()=>{
    test('should update the todo', async (done) =>{
        const hexId = todos[0]._id.toHexString();
        const text = 'This should be the new text';
        const res=await request(server).patch(`/todos/${hexId}`).send({
            completed: true,
            text
          });
        expect(res.body.text).toBe(text);
        expect(res.status).toBe(200)
        expect(res.body.completed).toBe(true)
        expect(_.isString(res.body.completedAt)).toBe(true)
        done()
    })
    test('completedAt at should be null when completed false', async (done) =>{
        const hexId = todos[0]._id.toHexString();
        const text = 'This should be the new text';
        const res=await request(server).patch(`/todos/${hexId}`).send({
            completed: false,
            text
          });
        expect(res.body.text).toBe(text);
        expect(res.status).toBe(200)
        expect(res.body.completed).toBe(false)
        expect(res.body.completedAt).toBe(null)
        done()
    })
    test('Should return 404 if ID not found',async(done)=>{
        const hexid= new ObjectID().toHexString();
        const text = 'This should be the new text';
        const res=await request(server).patch(`/todos/${hexid}`).send({completed: false,
            text})
        expect(res.status).toBe(404)
        done()
    })
    test('Should return 404 if Id not valid',async(done)=>{
        const text = 'This should be the new text';
        const res=await request(server).patch(`/todos/123`).send({completed: false,
            text})
        expect(res.status).toBe(404)
        done()
    })
})

