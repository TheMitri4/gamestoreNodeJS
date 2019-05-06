const fs = require('fs');
const path = require('path');
const dirName = path.dirname(module.filename);
const dbPath = path.resolve(dirName, 'database.json');
const imgPath = path.resolve(dirName, '../img/gameImg');

function Game(id, title, description, platforms, price, image){
    this.id = id;
    this.title = title;
    this.description = description;
    this.platform = platforms;
    this.price = +price;
    this.rating = 0;
    this.votes = 0;
    this.locked = false;
    if(image){
        this.image = `img/gameImg/${image}`;
    }else{
        this.image = `img/placeholder.png`;
    }
}

function addGame(title, description, platforms, price, image){
    return _readDb().then(database => {
		let id = database[database.length - 1].id + 1;
		fs.writeFile(imgPath + '/' + id + '.jpg', image.buffer, (err) => {
			if(err){
				throw err;
			}
		})
        database.push(new Game(id, title, description, platforms, price, id + '.jpg'));
        return _writeDb(database);
    })
}

function getGame(id) {
    return _readDb().then(database => {
        let result = database.find(item => item['id'] === +id);
        if (result) {
            if(result.locked){
                return 423;
            }
            result.locked = true;
            _writeDb(database);
            return result;
        } else {
            throw new Error('There is no game with id ' + id);
        }
    });
}

function editGame(id, title, description, platforms, price, image){
    return _readDb().then(database => {
        let game = database.find(item => item['id'] === +id);
        game.title = title;
        game.description = description;
        game.platform = platforms;
        game.price = +price;
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
        database.splice(gameIndex,1);
        // fs.unlink(id + '.jpg')
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

function _readDb() {
    return new Promise(resolve => {
        fs.readFile(dbPath, (error, data) => {
            const database = JSON.parse(data);
            resolve(database);
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
    unlockGame
}