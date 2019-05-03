const express = require('express');
const app = express();
const fs = require('fs');
const root = __dirname + '/public/';
const dbLink = root + 'api/database.json';

app.use(express.static('public'));

app.get('/', function(req, res){
    res.send('Hello world!');
});

app.get('/get', function(req, res){
    let id = req.query['id'];
    let db;
    db = fs.readFileSync(dbLink);
    db = JSON.parse(db);
    let result = db.find(item => item.id === +id);
    res.json(result);
});

app.get('/list', function(req, res){
    
    let options = {
        root: root,
    }

    res.sendFile('list.html', options, function(err){
        if(err){
            console.log('Error')
        }else{
            console.log('File sent');
        }
    })
});

app.listen(3000, function(){
    console.log('Server is running on port 3000');
});