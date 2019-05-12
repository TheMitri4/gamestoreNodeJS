let saveErrorMessage = document.querySelector('.error-message--save');
let loadErrorMessage = document.querySelector('.error-message--load');
let showCase = document.querySelector('.showcase');

function showError(errorMessage){
	errorMessage.classList.remove('error-message--hidden');
	setTimeout(() => {
		errorMessage.style.opacity = 1;
	},10);
	function removeMessage(){
		errorMessage.classList.add('error-message--hidden');
		errorMessage.removeEventListener('transitionend', removeMessage);
	}
	setTimeout(() => {
		errorMessage.style.opacity = 0;
		errorMessage.addEventListener('transitionend', removeMessage);
	}, 1200);
}

function fillShowCase(database, order = filterButton.dataset.order, searchingTitle = searchInput.value){

	if(database.length === 0){
		let item = document.createElement('h1');
		item.innerText = 'Игры не найдены';
		item.classList.add('search__error-title');
		showCase.appendChild(item);
		return;
	}

	if(searchingTitle){
		database = database.filter(item => {
			if(item.title.toLowerCase().includes(searchingTitle.toLowerCase())){
				return true;
			}
		});
		if(database.length === 0){
			let item = document.createElement('h1');
			item.innerText = 'Игра, соответствующая запросу не найдена';
			item.classList.add('search__error-title');
			showCase.appendChild(item);
			showCase.appendChild(returnButton());
			return;
		}
	}

	if(order === 'title'){
		database.sort((a, b) => {
			if(a.title.toLowerCase() > b.title.toLowerCase()){
				return 1;
			}
			if(a.title.toLowerCase() < b.title.toLowerCase()){
				return -1;
			}
			return 0;
		});
		if(filterButton.dataset.direction === 'down'){
			database.reverse();
		}
	}else{
		database.sort((a, b) => a[order] - b[order]);
		if(filterButton.dataset.direction === 'down'){
			database.reverse();
		}
	}

	let wrapper = document.createDocumentFragment();
	database.forEach(item => {
		let child = browserJSEngine(gamecardTemplate(item));
		if(child.classList.contains('gamecard__editable')){
			child.addEventListener('click', () => {
				showEditForm(child.dataset.id);
			})
		}else{
			child.addEventListener('click', () => {
				showOpenedGame(child.dataset.id);
			})
		}
		wrapper.appendChild(child);
	})
	showCase.appendChild(wrapper);
	if(searchingTitle){
		showCase.appendChild(returnButton());
	}
}

let blurWrapper = document.querySelector('.blur-wrapper');

function getGamecards(order, searchingTitle){
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'db/database.json', true);
	xhr.send();

	let loader = document.querySelector('.loader__wrapper');
	loader.classList.remove('hidden');
	blurWrapper.classList.add('blur-effect');

	xhr.onload = function(){
		if(xhr.status === 200){
			let database;
			try{
				database = JSON.parse(this.responseText);
			}catch(error){
				showError(loadErrorMessage);
				return;
			}
			showCase.innerHTML = '';
			fillShowCase(database, order, searchingTitle);
			setTimeout(function(){
				loader.classList.add('hidden');
				blurWrapper.classList.remove('blur-effect');
			}, 300);
		}else{
			showError(loadErrorMessage);
		}
	}

	xhr.onerror = function(){
		console.log('Error ' + this.status);
		showError(loadErrorMessage);
	}
}

window.addEventListener('DOMContentLoaded' , () => {
	getGamecards();
});

// Calculating scroll width

var scrollDiv = document.createElement('div');
scrollDiv.style.overflowY = 'scroll';
scrollDiv.style.width = '50px';
scrollDiv.style.height = '50px';
scrollDiv.style.visibility = 'hidden';
document.body.appendChild(scrollDiv);
var scrollWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
document.body.removeChild(scrollDiv);


//filter

let filterButton = document.querySelector('.filter__button');
let filterList = document.querySelector('.filter__list');

document.addEventListener('click', (event) => {
	event.stopPropagation();
	if(event.target != filterList && !filterList.contains(event.target)){
		filterList.classList.add('filter__list--hidden');
	}
});

filterButton.addEventListener('click', (event) => {
	event.stopPropagation();
	event.preventDefault();
	filterList.classList.toggle('filter__list--hidden');
})

filterList.addEventListener('click', (event) => {
	event.stopPropagation();
	filterList.classList.add('filter__list--hidden');
	[event.target.innerText , filterButton.innerText] = [filterButton.innerText ,event.target.innerText];
	[event.target.dataset.order , filterButton.dataset.order] = [filterButton.dataset.order ,event.target.dataset.order];
	[event.target.dataset.direction , filterButton.dataset.direction] = [filterButton.dataset.direction ,event.target.dataset.direction];
	getGamecards(filterButton.dataset.order);
})


//Search

let searchInput = document.querySelector('.main-header__search');
let searchButton = document.querySelector('.search__button');

searchInput.addEventListener('change', function(){
	getGamecards('title', this.value);
});

searchInput.addEventListener('focus', function(){
	searchButton.style.display = 'block';
	setTimeout(() => {
		searchButton.classList.remove('search__button--hidden');
	}, 10)
});

searchInput.addEventListener('blur', function(){
	searchButton.classList.add('search__button--hidden');
	setTimeout(() => {
		searchButton.style = '';
	}, 200)
});

searchButton.addEventListener('click', function(){
	if(!searchInput.value){
		return;
	}
	getGamecards('title', searchInput.value);
})

function returnButton(){
	let returnButton = document.createElement('button');
	returnButton.innerText = 'Вернуться';
	returnButton.classList.add('button');
	returnButton.classList.add('search__return-button');
	returnButton.addEventListener('click', () => {
		searchInput.value = '';
		getGamecards();
	});
	return returnButton;
}


function browserJSEngine(block) {
	if ((block === undefined) || (block === null) || (block === false)) {
		return document.createTextNode('');
	}
	if ((typeof block === 'string') || (typeof block === 'number') || (block === true)) {
		return document.createTextNode(block.toString());
	}
	if (Array.isArray(block)) {
		return block.reduce(function(f, elem) {
			f.appendChild(browserJSEngine(elem));

			return f;
		}, document.createDocumentFragment());
	}
	var element = document.createElement(block.tag || 'div');

	element.classList.add(
		...[].concat(block.cls).filter(Boolean)
	);

	if (block.attrs) {
		Object.keys(block.attrs).forEach(function(key) {
			if(block.attrs[key] === ''){
				element.setAttribute(key, true);
			}
			element.setAttribute(key, block.attrs[key]);
		});
	}

	if (block.content) {
		element.appendChild(browserJSEngine(block.content));
	}

	return element;
}