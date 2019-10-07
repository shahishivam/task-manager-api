const express = require('express')
const Task = require('../models/task.js')
const auth = require('../middleware/auth.js')
const router = new express.Router()

router.post('/tasks', auth, async(req,res)=>{
  const task = new Task({
    ...req.body,
    owner:req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }

})

//GET /tasks?completed=true or false or no value//if no value of completed is given it will return all the tasks
//GET /tasks?limit=10(no. of data u want to show)&skip=20
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async(req,res)=>{

  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'//if req.query.completed is string true it will return boolean true and hence match.completed will be equal to boolean true
  }
  if(req.query.sortBy){
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user.populate({
      path:'tasks',
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send()
  }

})

router.get('/tasks/:id', auth, async (req,res)=>{
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner:req.user._id})
    if(!task){
        return res.status(404).send()
      }
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }

})

router.patch('/tasks/:id', auth, async (req,res)=>{

  const updates = Object.keys(req.body)
  const allowedUpdates = ['description','completed']
  const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
  if(!isValidOperation){
    res.status(400).send({ error:'Invalid Updates!' })
  }

  try{
    const task =await Task.findOne({ _id:req.params.id, owner:req.user._id })

    if(!task){
      res.status(404).send()
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()

    res.send(task)
  } catch(e){
    res.status(400).send(e)
  }

})

router.delete('/tasks/:id', auth, async(req,res)=>{
  try {
    const task = await Task.findOneAndDelete({ _id:req.params.id, owner:req.user._id })
    if(!task){
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
