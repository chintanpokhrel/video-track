const CTN = "07720078480"

var postHelper = function(url, data, onresponse) {
  fetch(url,
        { method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then((res) => onresponse(res));
}

var play = function(start) {
  let onresponse = (res) => console.log(res);
  postHelper('/play', {ctn: CTN, start: start}, onresponse);
}

var updateLbl = function(res){
  let videoLbl = document.querySelector('#videoLbl');
  res.text().then((txt) => {
    videoLbl.innerText = txt;
  });
}

var pause = function(end) {
  postHelper('/pause', {ctn: CTN, end: end}, updateLbl);
}

var start = function(dur) {
  postHelper('/start', {ctn: CTN, dur: dur}, updateLbl);
}

window.addEventListener('DOMContentLoaded', (evt) => {
  const video = document.querySelector('#sampleVideo');
  video.ondurationchange = (evt) => start(video.duration); 
  video.onplay = (evt) => play(video.currentTime);
  video.onpause = (evt) => pause(video.currentTime);
});
