const fs = require('fs');
const path = require('path');
const dirName = path.dirname(module.filename);
const dbPath = path.resolve(dirName, 'database.json');
const imgPath = path.resolve(dirName, '../img/gameImg');

const timeToUnlockGameMs = 600000;
const extensionFinder = /\.[0-9a-z]{1,5}$/;

function Game(id, title, description, platforms, price, videoLink,imageUrl){
    this.id = id;
    this.title = title;
    this.description = description;
    this.platform = platforms;
    this.price = +price;
    this.videoLink = videoLink;
    this.rating = 0;
    this.votes = 0;
    this.locked = false;
    if(imageUrl){
        this.image = `img/gameImg/${imageUrl}`;
    }else{
        this.image = `img/gameImg/placeholder.png`;
    }
}

function addGame(title, description, platforms, price, videoLink, image){
    return _readDb().then(database => {
		let id = database[database.length - 1].id + 1;
		if(image){
            const fileExtension = extensionFinder.exec(image.originalname)[0];
            fs.writeFile(imgPath + '/' + id + fileExtension, image.buffer, (err) => {
			    if(err){
			    	throw err;
			    }
            })
            var imageUrl = id + fileExtension;
        }
        database.push(new Game(id, title, description, platforms, price, videoLink,imageUrl));
        return _writeDb(database);
    })
}

function getGame(id) {
    return _readDb().then(database => {
        let result = database.find(item => item['id'] === +id);
        if (result) {
            return result;
        } else {
            throw new Error('There is no game with id ' + id);
        }
    });
}

function getGameEdit(id) {
    return _readDb().then(database => {
        let result = database.find(item => item['id'] === +id);
        if (result) {
            if(result.locked){
                return 423;
            }
            result.locked = true;
            setTimeout(() => {
                unlockGameTime(id);
            }, timeToUnlockGameMs);
            _writeDb(database);
            return result;
        } else {
            throw new Error('There is no game with id ' + id);
        }
    });
}

function unlockGameTime(id){
    _readDb().then(database => {
        let result = database.find(item => item['id'] === +id);
        if(result.locked){
            result.locked = false;
            _writeDb(database);
        }
    })
}

function editGame(id, title, description, platforms, price, videoLink, image){
    return _readDb().then(database => {
        let game = database.find(item => item['id'] === +id);
        if(!game){
            return false;
        }
        game.title = title || game.title;
        game.description = description || game.description;
        game.platform = platforms || game.platform;
        game.price = price || game.price;
        game.videoLink = videoLink || game.videoLink;
        game.locked = false;
        if(image){
            game.image = `img/gameImg/${image}`;
        }
        return _writeDb(database);
    })
}

function deleteGame(id){
    return _readDb().then(database => {
        let gameIndex = database.indexOf(database.find(item => item['id'] === +id));
        if(gameIndex === -1){
            return false;
        }
        const imagePath = path.resolve(dirName, `../${database[gameIndex].image}`);
        database.splice(gameIndex,1);
        fs.unlink(imagePath, (err) => {
            if (err) throw err;
        })
        return _writeDb(database);
    });
}

function unlockGame(id){
    return _readDb().then(database => {
        let result = database.find(item => item['id'] === +id);
        if (result) {
            if(result.locked){
                result.locked = false;
                return _writeDb(database);
            }                      
        } else {
            throw new Error('There is no game with id ' + id);
        }
    });
}

function rateGame(id, rating){
    return _readDb().then(database => {
        let game = database.find(item => item['id'] === +id);
        if(!game){
            return false;
        }
        let votesSum = Math.round(game.rating * game.votes);
        votesSum += +rating;
        game.votes++;
        game.rating = votesSum / game.votes;
        return _writeDb(database);
    })
}

function _readDb() {
    return new Promise(resolve => {
        fs.readFile(dbPath, (error, data) => {
            if(error){
                reject(error)
            }else{
                const database = JSON.parse(data);
                resolve(database);
            } 
        });
    });
}

function _writeDb(item){
    return new Promise((resolve, reject) => {
        fs.writeFile(dbPath, JSON.stringify(item), error => {
            if (error) {
                console.error(new Error('File writing error: ' + error.message));
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}
module.exports = {
    getGame,
    addGame,
    editGame,
    deleteGame,
    unlockGame,
    rateGame,
    getGameEdit
}