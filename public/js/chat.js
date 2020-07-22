const socket=io();

//elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $messages=document.querySelector('#messages');

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options
//parsing the username and the room number of the chat
const { username,room }=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll=()=>{
   //New message element
   const $newMessage=$messages.lastElementChild

   //Height of the new message
   const newMessageStyles=getComputedStyle($newMessage)
   const newMessageMargin=parseInt(newMessageStyles.marginBottom)
   const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

   //Visible Height
   const visibleHeight = $messages.offsetHeight

   //Height of message conatiner
   const containerHeight=$messages.scrollHeight

   //How far have I scrolled?
   const scrollOffset=$messages.scrollTop + visibleHeight

   if(containerHeight-newMessageHeight<=scrollOffset){
     $messages.scrollTop=$messages.scrollHeight
   }
  // console.log(newMessageMargin)
}

socket.on('message',(message)=>{
  console.log(message);
  const html=Mustache.render(messageTemplate,{
    username:message.username,
    m:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')
  }); //rendering a template
  $messages.insertAdjacentHTML('beforeend',html);

 autoscroll();
})

socket.on('locationMessage',(message)=>{
  console.log(message);
  const html=Mustache.render(locationMessageTemplate,{
    username:message.username,
    url:message.url,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
});

socket.on('roomData',({room,users})=>{
  const html=Mustache.render(sidebarTemplate,{
    room:room,
    users:users
  })
  document.querySelector('#sidebar').innerHTML=html
  //console.log(room)
  //console.log(users)
})

$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  $messageFormButton.setAttribute('disabled','disabled')
   //disable
  const message=e.target.elements.message.value;

  socket.emit('sendMessage',message,(error)=>{
      $messageFormButton.removeAttribute('disabled');
      $messageFormInput.value='';
      $messageFormInput.focus();
    //enable
     if(error)
     return console.log(error);
     else {
       console.log('Message Delivered');
     }
  });
})


document.querySelector('#send-location').addEventListener('click',()=>{
//disable
  document.querySelector('#send-location').setAttribute('disabled','disabled');
  //everything that we need for geo-location lives on navigator
  if(! navigator.geolocation){
    //enable
    document.querySelector('#send-location').removeAttribute('disabled');
    return alert('Geolocation is not supportive by your browser')
  }
  //enable
  document.querySelector('#send-location').removeAttribute('disabled');
  navigator.geolocation.getCurrentPosition((position)=>{
    //console.log(position);
    socket.emit('sendLocation',{
      latitude:position.coords.latitude,
      longitude:position.coords.longitude  },()=>{
        console.log('Location shared');
      });
});
});

socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href="/"
  }
})
