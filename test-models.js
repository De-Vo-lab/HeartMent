import fetch from 'node-fetch';

const apiKey = 'AIzaSyBkUKumI3bR2uTidN8N5Nlx98PxtoGE4ek';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.map(m => console.log(m.name));
    } else {
      console.log(data);
    }
  })
  .catch(console.error);
