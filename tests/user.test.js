const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
  _id:userOneId,
  name:'Ankur',
  email:'ankur@gmail.com',
  password:'ankur123',
  tokens:[{
    token:jwt.sign({ _id:userOneId }, process.env.JWT_SECRET)
  }]
}

beforeEach(async()=>{
  await User.deleteMany()
  await new User(userOne).save()
})

test('Should sign up a new user', async()=>{
  const response = await request(app).post('/users').send({
    name:'Shivam',
    email:'shivam@gmail.com',
    password:'shivam123'
  }).expect(201)

  //Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  //Assertions about the response
  expect(response.body).toMatchObject({
    user:{
      name:'Shivam',
      email:'shivam@gmail.com'
    },
    token:user.tokens[0].token
  })
  expect(user.password).not.toBe('shivam123')
})

test('Should login existing user', async()=>{
  const response = await request(app).post('/users/login').send({
    email:userOne.email,
    password:userOne.password
  }).expect(200)

  const user = await User.findById(userOneId)
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existent user', async()=>{
  await request(app).post('/users/login').send({
    email:userOne.email,
    password:'123'
  }).expect(400)
})

test('Should get profile for user',async()=>{
  await request(app)
  .get('/users/me')
  .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(200)
})

test('Should not get profile for unauthenticated user',async()=>{
  await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user',async()=>{
  const response = await request(app)
  .delete('/users/me')
  .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
  .send()
  .expect(200)

  //Validate user is removed
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for user',async()=>{
  await request(app)
  .delete('/users/me')
  .send()
  .expect(401)
})
