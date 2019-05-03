function showEditForm(id){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', `api/get.php?id=${id}`, true);
	let result;
	xhr.send();
	xhr.onload = function(){
		result = JSON.parse(xhr.responseText);
		createForm(result, 'api/edit.php', true, id);
	}
	xhr.onerror = function(){
		console.log('Ошибка');
	}
}

function sendEditForm(form, url){
	let platforms = form.querySelectorAll('.edit-form__platform-checkbox');
	let platformsArr = [];
	platforms.forEach(item => {
		if(item.checked){
			platformsArr.push(item.name);
		}
	});
	let platformsJson = JSON.stringify(platformsArr);
	let gameId = form.dataset.id;
	let gameTitle = form.querySelector('.edit-form__title-input').value;
	let gamePrice = form.querySelector('.edit-form__price-input').value;
	let gameDescription = form.querySelector('.edit-form__description').value;

	let body = `id=${gameId}&title=${encodeURIComponent(gameTitle)}&platform=${encodeURIComponent(platformsJson)}&price=${gamePrice}&description=${encodeURIComponent(gameDescription)}`;
	
	// let data = {
	// 	gameId: form.dataset.id,
	// 	gameTitle: form.querySelector('.edit-form__title-input').value,
	// 	gamePrice: form.querySelector('.edit-form__price-input').value,
	// 	gameDescription: form.querySelector('.edit-form__description').value
	// 	// platforms: platformsJson 
	// }

	// let boundary = String(Math.random()).slice(2);
	// let boundaryMiddle = '--' + boundary + '\r\n';
	// let boundaryLast = '--' + boundary + '--\r\n';

	// let body = ['\r\n'];
	// for(let key in data){
	// 	body.push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + data[key] + '\r\n')
	// }

	// body = body.join(boundaryMiddle) + boundaryLast;

	// console.log(body);

	let xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	// xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
	xhr.send(body);
	xhr.onload = function(){
		console.log('Все хорошо: ' + xhr.responseText);
		hideForm(form);
		getGamecards();
	}
	
	xhr.onerror = function(){
		console.log('Ошибка: ' + xhr.statusText);
	}
}

document.querySelector('.add__button').addEventListener('click', (event) => {
	event.preventDefault();
	createForm({}, 'api/add.php');
});

function createForm(data, sendUrl, edit, id){
	let formWrap = browserJSEngine(editFormTemplate(data));
	let form = formWrap.querySelector('form');
	if(edit){
		let platforms = {
			windows: 'input[name="Windows"]',
			macos: 'input[name="MacOs"]',
			steamos: 'input[name="SteamOs"]'
		}
		data.platform.forEach(item => {
			form.querySelector(platforms[item.toLowerCase()]).checked = true;
		});
		form.setAttribute('data-id', id);
		form.querySelector('.edit-form__button--delete').addEventListener('click', (event) => {
			event.preventDefault();
			document.removeEventListener('click', documentRemove);
			deleteGame(form.dataset.id, form);
		});
	}else{
		form.querySelector('.edit-form__button--delete').remove();
	}
	document.body.appendChild(formWrap);
	document.body.style.overflowY = 'hidden';
	document.body.style.marginRight = `${scrollWidth}px`;
	setTimeout(function(){
		form.classList.remove('edit-form__hidden');
		blurWrapper.classList.add('blur-effect');
	}, 10);
	
	formWrap.addEventListener('mousedown', function(event){
		let clickStart = event.target;
		if(event.target != form && !form.contains(event.target)){
			event.target.addEventListener('mouseup', function(event){
					if(clickStart == event.target){
					hideForm(form);
					getGamecards();
				}
			})
		}
	});

	form.querySelector('.edit-form__button--decline').addEventListener('click', (event) => {
		event.preventDefault();
		hideForm(form);
		getGamecards();
	});
	form.querySelector('.edit-form__button--accept').addEventListener('click', (event) => {
		event.preventDefault();
		sendEditForm(form, sendUrl);
	});
	
	let dropArea = form.querySelector('.edit-form__image');

	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		dropArea.addEventListener(eventName, preventDefaults, false);
	});
	function preventDefaults (event) {
		event.preventDefault();
		event.stopPropagation();
	}
	form.querySelector('.edit-form__image-input').addEventListener('change', function(){
		previewFile(this.files[0], dropArea);
	});
	dropArea.addEventListener('drop', (event) => {
		previewFile(event.dataTransfer.files[0], dropArea);
	});
}

function hideForm(form){
	form.classList.add('edit-form__hidden');
	blurWrapper.classList.remove('blur-effect');
	setTimeout(function(){
		form.parentNode.remove();	
		document.body.style = '';
	}, 400);
	// setTimeout(getGamecards(),200);
}

function previewFile(file, container){
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onloadend = function(){
		container.src = reader.result;
	}
}

function deleteGame(id, form){
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/delete.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	let body = 'id=' + id;
	xhr.send(body);
	xhr.onload = function(){
		console.log('Игра ' + id + ' удалена');
		hideForm(form);
		getGamecards();
	}
	xhr.onerror = function(){
		console.log('Ошибка');
	}
}

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

function editFormTemplate(obj = {}) {
	return {
		tag: 'div',
		cls: 'edit-form__wrapper',
		content: {
		tag: 'form',
		cls: ['edit-form', 'edit-form__hidden'],
		attrs: { action: ``, name: 'editform'},
		content: [
			{
				tag: 'header',
				cls: 'edit-form__header',
				content: [
					{
						tag: 'div',
						cls: 'edit-form__info',
						content: [
							{
								tag: 'div',
								cls: 'edit-form__title-wrapper',
								content: [
									{
										tag: 'input',
										cls: 'edit-form__title-input',
										attrs: {type: 'text', name: 'title', value: obj.title || 'Введите название'}
									},
									{
										tag: 'p',
										cls: ['edit-form__rating', 'gamecard__rating'],
										content: obj.rating || '0'
									}
								]
							},
							{
								tag: 'textarea',
								cls: 'edit-form__description',
								attrs: {name: 'description'},
								content: obj.description || 'Введите описание'
							}
						]
					},
					{
						tag: 'div',
						cls: 'edit-form__image-wrapper',
						content: [
							{
								tag: 'label',
								attrs: {for: 'image-upload'},
								cls: 'edit-form__image-label',
								content:{
									tag: 'img',
									cls: 'edit-form__image',
									attrs: {src: obj.image || 'img/placeholder.png', alt: '', width: '170', height: '170'}
								}
							},
							{
								tag: 'input',
								cls: 'edit-form__image-input',
								attrs: {type: 'file', name: 'image', id: 'image-upload'}
							}
						]
					}
				]
			},
			{
				tag: 'footer',
				cls: 'edit-form__footer',
				content: [
					{
						tag: 'input',
						cls: 'edit-form__price-input',
						attrs: {type: 'text', name: 'price', value: obj.price || 'Цена'}
					},
					{
						tag: 'div',
						cls: 'edit-form__platforms',
						content: [
							{
								tag: 'input',
								cls: 'edit-form__platform-checkbox',
								attrs: {type: 'checkbox', name: 'Windows', id: 'windows'}
							},
							{
								tag: 'label',
								cls: ['edit-form__platform-label', 'edit-form__windows-label'],
								attrs: {for: 'windows'}
							},
							{
								tag: 'input',
								cls: 'edit-form__platform-checkbox',
								attrs: {type: 'checkbox', name: 'MacOs', id: 'mac'}
							},
							{
								tag: 'label',
								cls: ['edit-form__platform-label', 'edit-form__mac-label'],
								attrs: {for: 'mac'}
							},
							{
								tag: 'input',
								cls: 'edit-form__platform-checkbox',
								attrs: {type: 'checkbox', name: 'SteamOs', id: 'steamos'}
							},
							{
								tag: 'label',
								cls: ['edit-form__platform-label', 'edit-form__steamos-label'],
								attrs: {for: 'steamos'}
							}
						]
					}
				]
			},
			{
				tag: 'div',
				cls: 'edit-form__submit-wrapper',
				content: [
					{
						tag: 'button',
						cls: ['edit-form__button', 'edit-form__button--accept'],
						attrs: {type: 'submit'},
						content: 'Сохранить'
					},
					{
						tag: 'button',
						cls: ['edit-form__button', 'edit-form__button--decline'],
						content: 'Отменить'
					},
					{
						tag: 'button',
						cls: ['edit-form__button', 'edit-form__button--delete'],
						content: 'Удалить'
					}
				]
			}
		]
	}
}
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

let showCase = document.querySelector('.showcase');

function fillShowCase(database){
	
	let databaseParsed = JSON.parse(database);
	if(databaseParsed === 0){
		return;
	}
	let wrapper = document.createDocumentFragment();
	databaseParsed.forEach(item => {
		let child = browserJSEngine(gamecardTemplate(item));
		child.addEventListener('click', () => {
			showEditForm(child.dataset.id);
		})
		wrapper.appendChild(child);
	})
	showCase.appendChild(wrapper);
	// document.querySelector('.loader__wrapper').classList.add('hidden');
	// blurWrapper.classList.remove('blur-effect');
}

let blurWrapper = document.querySelector('.blur-wrapper');

function getGamecards(){
	let database;

	var xhr = new XMLHttpRequest();

	xhr.open('GET', 'api/database.json', true);

	xhr.send();

	document.querySelector('.loader__wrapper').classList.remove('hidden');
	blurWrapper.classList.add('blur-effect');

	xhr.onload = function(){
		database = this.responseText;
		showCase.innerHTML = '';
		fillShowCase(database);
		setTimeout(function(){
			document.querySelector('.loader__wrapper').classList.add('hidden');
			blurWrapper.classList.remove('blur-effect');
		}, 300);
	}

	xhr.onerror = function(){
		console.log('Erroe ' + this.status);
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