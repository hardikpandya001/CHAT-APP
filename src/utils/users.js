const users=[];

// addUser, removeUser ,getUser, getUsersInRoom

const addUser=({id,username,room})=>{
  //clean the data
  username=username.trim().toLowerCase()
  room=room.trim().toLowerCase()

  //validate the data
  if(!username || !room){
    return{
      error: 'Username and room are required'
    }
  }

  //check for existing User
  const existingUser=users.find((user)=>{
    return user.room==room && user.username==username
  })
//validate Username
  if(existingUser)
  {
    return{
      error: 'Username is in use!'
    }
  }
  //store user
 const user={id,username,room}
 users.push(user)
 return {user}
}

const removeUser=(id)=>{
  const index=users.findIndex((user)=>{
    return user.id===id
  })

  if(index!=-1){
    return users.splice(index,1)[0]
  }
}

const getUser=(id)=>{
  return users.find((user)=>{
    return user.id===id;
  })
}

//findIndex stops as soon as it finds the index
//filter goes through every users room number
const getUsersInRoom=(room)=>{
   return users.filter((user)=>{
    return user.room===room
   })
}

module.exports={
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}


// addUser({
//   id:22,
//   username:'   ABCDDDD',
//   room: '123'
// })
// console.log(users);

// const res=addUser({
//   id: 33,
//   username:'',
//   room: '278'
// })
//
// console.log(res)
