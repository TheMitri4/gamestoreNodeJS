const express = require('express');
const app = express();
const {getGame, addGame, editGame, deleteGame, unlockGame, rateGame, getGameEdit} = require('./public/db');

const root = __dirname + '/public/';

const multer = require('multer');
const extensionFinder = /\.[0-9a-z]{1,5}$/;

const uploadLimits = {
    fileSize: 8000000
}

let storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, __dirname + '/public/img/gameImg')
    },
    filename: function(req, file, cb){
        cb(null, req.body.id + extensionFinder.exec(file.originalname)[0]);
    }
});
const upload = multer({storage: storage, limits: uploadLimits});

let memoryStorage = multer.memoryStorage();
const uploadMemory = multer({storage: memoryStorage, limits: uploadLimits});

app.use(express.static('public'));
app.use('/delete', express.urlencoded({extended: true}));
app.use('/unlock', express.urlencoded({extended: true}));
app.use('/vote', express.urlencoded({extended: true}));

app.get('/', function(req, res){
	let options = {
		root: root,
	}
	res.sendFile('showcase.html', options, function(err){
		if(err){
			console.log('Error')
		}
	})
});

app.get('/get', function(req, res){
	let id = req.query['id'];
	if(!id){
		res.sendStatus(404);
		return;
	}
	getGame(id).then(result => {
		res.json(result);
	});    
});

app.get('/getEdit', function(req, res){
	let id = req.query['id'];
	if(!id){
		res.sendStatus(404);
		return;
	}
	getGameEdit(id).then(result => {
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
	let videoLink = req.body.videoLink;
	if(req.file){
		var image = req.file;
	}
	addGame(title, description, platforms, price, videoLink, image).then(result => {
		if(result){
			res.sendStatus(200);
		}
	});    
});

app.post('/edit', upload.single('image'), function(req, res){
	if(!req.body || !req.body.id){
		res.sendStatus(404);
		return;
	}
	let id = req.body.id;
	let title = req.body.title;
	let description = req.body.description;
	let platforms = JSON.parse(req.body.platform);
	let price = req.body.price;
	let videoLink = req.body.videoLink;
	if(req.file){
		var imageName = req.file.filename;
	}
	editGame(id, title, description, platforms, price, videoLink, imageName).then(result => {
		if(result){
			res.sendStatus(200);
		}else{
			res.sendStatus(404);
		}
	});    
});

app.post('/vote', function(req, res){
	if((!req.body || !req.body.id) || (req.body.rating < 0 || req.body.rating > 10)){
		res.sendStatus(404);
		return;
	}
	let id = req.body.id;
	let rating = req.body.rating;
	rateGame(id, rating).then(result => {
		if(result){
			res.sendStatus(200);
		}else{
			res.sendStatus(404);
		}
	});  
})

app.post('/delete', function(req, res){
	if(!req.body || !req.body.id){
		res.sendStatus(404);
		return;
	}
	let id = req.body.id;
	deleteGame(id).then(result => {
		if(result){
			res.sendStatus(200);
		}else{
			res.sendStatus(404);
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
		}
	})
});

app.listen(3000, function(){
	console.log('Server is running on port 3000');
});