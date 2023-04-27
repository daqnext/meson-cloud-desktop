const {ipcRenderer, remote} = require('electron');

let input = document.getElementById('tokenin')

ipcRenderer.on('TOKEN_GETTING', function(event, data) {
  if (data) {
    input.value = data
  } else {
    input.value = 'LOADING ERROR'
  }
})

let btn = document.getElementById('tokenBtn');

btn.addEventListener('click', function(event) {
  event.preventDefault();
  let preferences = {};
  preferences['token'] = input.value
  ipcRenderer.send('TOKEN_SETTING', preferences)
})

ipcRenderer.send('TOKEN_LOADING');
