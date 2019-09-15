const express = require('express')
const app = express()
const path = require('path')

app.use('/static', express.static(path.join(__dirname, 'res')));
app.use('/static', express.static(path.join(__dirname, 'js')));

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

const FACTOR = 0.8;
const INFINITY = 10000000000
const VALID_CTNS = ['07720078480', '08145391459'];

var activeSessions = [];

app.post('/start', (req, res) => {
  const ctn = req.body.ctn;
  const dur = req.body.dur;
  if(!validCTN(ctn))
  {
    console.log("Invalid CTN " + ctn);
    res.send('Invalid CTN');
    return;
  }
 
  const i = findSession(ctn);
  if(i >= 0)
  {
    activeSessions.splice(i, 1);
  }
 
  activeSessions.push({ctn: ctn, duration: dur, intervals: []});
  res.send("Watch " + Math.round(dur) + " seconds more of this video to earn $1 OFF on your next bill !");
});

app.post('/play', (req, res) => {
  const ctn = req.body.ctn;
  const interval = [req.body.start, INFINITY];
  
  const i = findSession(ctn);
  if(i < 0)
  {
    res.send('Invalid Session'); 
    return;
  }
 
  activeSessions[i].intervals.push(interval);
  res.send("OK");
});


app.post('/pause', (req, res) => {
  const ctn = req.body.ctn;
  const end = req.body.end; 

  const i = findSession(ctn);

  if(i < 0)
  {
    res.send('Invalid Session'); 
    return;
  }
  
  const cur_i = activeSessions[i].intervals.length - 1;
  if(cur_i < 0)
  {
    res.send("Pause before start ?");
    return;
  }

  activeSessions[i].intervals[cur_i][1] = end;
  const watched = computeWatched(activeSessions[i].intervals, activeSessions[i].duration);
  const toWatch = FACTOR * activeSessions[i].duration;
  const remaining = Math.round(toWatch - watched);

  if(remaining  <= 0)
  {
    res.send("Congrats! You will get $1 OFF on your next bill");
  }else
  {
    res.send("Watch " + remaining + " seconds more of this video to earn $1 OFF on your next bill !");
  }

});

var computeWatched = function(intervals, duration) {
  let watched = 0;
  for(let endp = 0; endp < duration; ++endp)
  {
    if(isContained(intervals, endp))
    {
      watched++;
    } 
  }    

  console.log("Duration = " + duration);
  console.log("Watched = " + watched);
  return watched;
}

var isContained = function(intervals, endp) {
  let contains = false;
  intervals.forEach((interval) => {
    if(endp >= interval[0] && endp <= interval[1])
    {
      contains = true;
    }
  });

  return contains;
}

var findSession = (ctn) => activeSessions.findIndex((session) => session.ctn == ctn);
var validCTN = (ctn) => VALID_CTNS.includes(ctn);

app.listen(8000);
  
