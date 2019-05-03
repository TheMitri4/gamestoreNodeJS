const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', function(req, res){
    res.send('Hello world!');
});

app.get('/list', function(req, res){
    
    let options = {
        root: __dirname + '/public/',
    }

    res.sendFile('list.html', options, function(err){
        if(err){
            console.log('Error')
        }else{
            console.log('File sent')
        }
    })
});

app.listen(3000, function(){
    console.log('Server is running on port 3000');
});