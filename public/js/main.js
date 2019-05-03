// function createGamecard(obj){
// 	let gamecard = document.createElement('div');
// 	let gamecardHeader = document.createElement('header');
// 	let gamecardInfo = document.createElement('div');
// 	let gamecardTitleWrapper = document.createElement('div');
// 	let gamecardTitle = document.createElement('h3');
// 	let gamecardRating = document.createElement('p');
// 	let gamecardDescription = document.createElement('p');
// 	let gamecardImage = document.createElement('img');
// 	let gamecardFooter = document.createElement('footer');
// 	let gamecardPrice = document.createElement('p');
// 	let gamecardPlatforms = document.createElement('div');
	
// 	gamecard.classList.add('showcase__card', 'gamecard');
// 	gamecardHeader.classList.add('gamecard__header');

// 	gamecardTitleWrapper.classList.add('gamecard__title-wrapper');
// 	gamecardTitle.classList.add('gamecard__title');
// 	gamecardRating.classList.add('gamecard__rating');
// 	gamecardDescription.classList.add('gamecard__description');
// 	gamecardImage.classList.add('gamecard__image');
// 	gamecardFooter.classList.add('gamecard__footer');
// 	gamecardPrice.classList.add('gamecard__price');
// 	gamecardPlatforms.classList.add('gamecard__platforms');

// 	gamecardImage.setAttribute('alt', obj.title);
// 	gamecardImage.setAttribute('src', obj.image || 'img/placeholder.png');
// 	gamecardImage.setAttribute('width', 170);
// 	gamecardImage.setAttribute('height', 170);
// 	gamecardTitle.innerText = obj.title;
// 	gamecardRating.innerText = obj.rating;
// 	gamecardDescription.innerText = obj.description || 'Описание отсутствует';
// 	gamecardPrice.innerText = obj.price === 0 ? 'Бесплатно' : obj.price + 'р';

// 	gamecard.appendChild(gamecardHeader);
// 	gamecardHeader.appendChild(gamecardInfo);
// 	gamecardInfo.appendChild(gamecardTitleWrapper);
// 	gamecardTitleWrapper.appendChild(gamecardTitle);
// 	gamecardTitleWrapper.appendChild(gamecardRating);
// 	gamecardInfo.appendChild(gamecardDescription);
// 	gamecardHeader.appendChild(gamecardImage);
// 	gamecard.appendChild(gamecardFooter);
// 	gamecardFooter.appendChild(gamecardPrice);
// 	gamecardFooter.appendChild(gamecardPlatforms);
	
// 	if(Array.isArray(obj.platform)){
// 		obj.platform.forEach(item => {
// 			let gamecardPlatform = document.createElement('p');
// 			gamecardPlatform.classList.add('gamecard__platform');
// 			if(item.toLowerCase() === 'windows'){
// 				gamecardPlatform.classList.add('gamecard__win');
// 			}else if(item.toLowerCase() === 'macos'){
// 				gamecardPlatform.classList.add('gamecard__mac-os');
// 			}else{
// 				gamecardPlatform.classList.add('gamecard__steam');
// 			}
// 			gamecardPlatforms.appendChild(gamecardPlatform);
// 		});
// 	}
// 	gamecardInfo.classList.add('gamecard__info');
// 	return gamecard;
// }

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
			element.setAttribute(key, block.attrs[key]);
		});
	}

	if (block.content) {
		element.appendChild(browserJSEngine(block.content));
	}

	return element;
}

let showCase = document.querySelector('.showcase');

function fillShowCase(database){
	
	let databaseParsed = JSON.parse(database);
	if(databaseParsed === 0){
		return;
	}
	let wrapper = document.createDocumentFragment();
	databaseParsed.forEach(item => {
		wrapper.appendChild(browserJSEngine(gamecardTemplate(item)));
	})
	showCase.appendChild(wrapper);
}

let blurWrapper = document.querySelector('.blur-wrapper');

window.addEventListener('DOMContentLoaded' , () => {
	let database;

	var xhr = new XMLHttpRequest();

	xhr.open('GET', 'api/database.json', true);

	xhr.send();

	xhr.onload = function(){
		database = this.responseText;
		fillShowCase(database);
		setTimeout(function(){
			document.querySelector('.loader__wrapper').classList.add('hidden');
			blurWrapper.classList.remove('blur-effect');
		}, 1000);
	}

	xhr.onerror = function(){
		console.log('Erroe ' + this.status);
	}
});

function gamecardTemplate(obj){
	let platformsClasses = {
		windows: 'gamecard__win',
		steamos: 'gamecard__steam',
		macos: 'gamecard__mac-os'
	}
	return {
		tag: 'div',
		cls: ['showcase__card', 'gamecard'],
		attrs: {"data-id": obj.id},
		content: [
			{
				tag: 'header',
				cls: 'gamecard__header',
				content: [
					{
						tag: 'div',
						cls: 'gamecard__info',
						content: [
							{
								tag: 'div',
								cls: 'gamecard__title-wrapper',
								content: [
									{
										tag: 'h3',
										cls: 'gamecard__title',
										content: obj.title
									},
									{
										tag: 'p',
										cls: 'gamecard__rating',
										content: obj.rating
									}
								]
							},
							{
								tag: 'p',
								cls: 'gamecard__description',
								content: obj.description || 'Описание отсутствует'
							}
						]
					},
					{
						tag: 'img',
						cls: 'gamecard__image',
						attrs: {src: obj.image || 'img/placeholder.png', alt: obj.title , width: '170', height: '170'}
					}
				]
			},
			{
				tag: 'footer',
				cls: 'gamecard__footer',
				content: [
					{
						tag: 'p',
						cls: 'gamecard__price',
						content: obj.price === 0 ? 'Бесплатно' : obj.price + 'р'
					},
					{
						tag: 'div',
						cls: 'gamecard__platforms',
						content: obj.platform.reduce((acc, item) => {
							acc.push({
								tag: 'p',
								cls: ['gamecard__platform', platformsClasses[item.toLowerCase()]]
							});
							return acc;
						}, [])
					}
				]
			}
		]
	}
}