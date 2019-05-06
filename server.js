const express = require('express');
const app = express();
const fs = require('fs');
const root = __dirname + '/public/';
const dbLink = root + 'api/database.json';

const multer = require('multer');
let storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, __dirname + '/public/img/gameImg')
	},
	filename: function(req, file, cb){
		cb(null, req.body.id + '.jpg')
	}
});
const upload = multer({storage: storage});

let memoryStorage = multer.memoryStorage();
const uploadMemory = multer({storage: memoryStorage});

const {getGame, addGame, editGame, deleteGame, unlockGame} = require('./public/db');

app.use(express.static('public'));
// app.use('/add', express.urlencoded());
// app.use('/edit', express.urlencoded());
app.use('/delete', express.urlencoded());
app.use('/unlock', express.urlencoded());

app.get('/', function(req, res){
	res.send('Hello world!');
});

app.get('/get', function(req, res){
	let id = req.query['id'];
	getGame(id).then(result => {
		if(result === 423){
			res.sendStatus(423);
		}else{
			res.json(result);
		}
	});    
});

app.post('/add', uploadMemory.single('image'), function(req, res){
	let title = req.body.title;
	let description = req.body.description;
	let platforms = JSON.parse(req.body.platform);
	let price = req.body.price;
	if(req.file){
		var image = req.file;
	}
	addGame(title, description, platforms, price, image).then(result => {
		if(result){
			res.sendStatus(200);
		}
	});    
});

app.post('/edit', upload.single('image'), function(req, res){
	let id = req.body.id;
	let title = req.body.title;
	let description = req.body.description;
	let platforms = JSON.parse(req.body.platform);
	let price = req.body.price;
	if(req.file){
		var imageName = req.file.filename;
	}
	editGame(id, title, description, platforms, price, imageName).then(result => {
		if(result){
			res.sendStatus(200);
		}
	});    
});

app.post('/delete', function(req, res){
	let id = req.body.id;
	deleteGame(id).then(result => {
		if(result){
			res.sendStatus(200);
		}
	});    
});

app.post('/unlock', function(req,res){
	let id = req.body.id;
	unlockGame(id).then(result => {
		res.sendStatus(200);
	})
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