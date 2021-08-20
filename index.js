const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const http = require('http')
const server = http.createServer(app)
const formatMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userleave,getRoomUsers} = require('./utils/users')

const socketio = require('socket.io')
const io = socketio(server)


app.use(express.static('./public'))

io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room)
        socket.join(user.room)
        socket.emit('message',formatMessage('Web Chatter Bot','Welcome to Web Chatter'))
        socket.broadcast.to(user.room).emit('message',formatMessage('Web Chatter Bot',`${user.username} has joined the server`))
        io.to(user.room).emit('roomUsers',{room:user.room,users:getRoomUsers(user.room)})
    })
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
    socket.on('disconnect',()=>{
        const user = userleave(socket.id)
        if(user){
            io.to(user.room).emit('message',formatMessage('Web Chatter Bot',`${user.username} has left the server`))
            io.to(user.room).emit('roomUsers',{room:user.room,users:getRoomUsers(user.room)})
        }
    })
})

server.listen(port,function(err){
    if(err){
        console.log(`Error in running the server: ${err}`)
    }
    console.log(`Server is up and running on port ${port}`)
})