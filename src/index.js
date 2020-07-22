const path=require('path');
const http=require('http');
const express= require('express');
const socketio=require('socket.io');
const Filter=require('bad-words');

const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const {generateMessage,generateLocationMessage}=require('./utils/messages')

const app= express();
const server=http.createServer(app);
const io=socketio(server);

const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));
//when a new client gets connected
io.on('connection',(socket)=>{
  console.log('New websocket connection');

//socket.emit('message',generateMessage('Welcome!'));

//socket.broadcast.emit('message',generateMessage('A new user has joined!'))

socket.on('join',({username,room},callback)=>{
    const{error,user} =addUser({id:socket.id,username,room})
    if(error){
    return  callback(error)
    }
    socket.join(user.room)
    socket.emit('message',generateMessage('Admin','Welcome!'));
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin','${user.username} has joined!'))
    callback();//let the client know they were able to join without any error

    //socket.emit, io.emit and socket.broadcast.emit
    //io.to.emit, socket.broadcast.to.emit
    io.to(user.room).emit('roomData',{
      room: user.room,
      users: getUsersInRoom(user.room)
    })

})

socket.on('sendMessage',(message,callback)=>{

  const user=getUser(socket.id);
  const filter= new Filter();
  if(filter.isProfane(message)){
    return callback('Profanity is not allowed');
  }

  io.to(user.room).emit('message',generateMessage(user.username,message));
  callback();
})

 socket.on('disconnect',()=>{
  const user=removeUser(socket.id)
   if(user){
       io.to(user.room).emit('message',generateMessage('Admin','$(user.username) has left'))
       io.to(user.room).emit('roomData',{
         room: user.room,
         users: getUsersInRoom(user.room)
       })
     }
    //io.emit('message',generateMessage('A user has left'))
  })

socket.on('sendLocation',(obj,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,'https://google.com/maps?q='+obj.latitude+' ,'+obj.longitude))
    callback();
  })
})

server.listen(port,function(){
  console.log("Port is listening");
});
