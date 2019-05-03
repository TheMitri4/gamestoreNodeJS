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

});

app.listen(3000, function(){
    console.log('Server is running on port 3000');
});