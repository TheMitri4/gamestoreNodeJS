function showEditForm(id){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', `getEdit?id=${id}`, true);
	xhr.send();
	xhr.onload = function(){
		if(xhr.status === 200){
			let result;
			try{
				result = JSON.parse(xhr.responseText);
			}catch(error){
				showError(loadErrorMessage);
				unlockGame(id);
				return;
			}
			createForm(result, '/edit', true, id);
		}else if(xhr.status === 423){
			let errorBlock = document.querySelector('.edit-form__error-locked');
			errorBlock.classList.remove('edit-form__error-locked--hidden');
			setTimeout(() => {
				errorBlock.style.opacity = 1;
			},10);
			function removeErrorBlock(){
				errorBlock.classList.add('edit-form__error-locked--hidden');
				errorBlock.removeEventListener('transitionend', removeErrorBlock);
			}
			setTimeout(() => {
				errorBlock.style.opacity = 0;
				errorBlock.addEventListener('transitionend', removeErrorBlock);
			}, 1200);
		}else{
			showError(loadErrorMessage);
		}
	}
	xhr.onerror = function(){
		showError(loadErrorMessage);
	}
}

function sendEditForm(form, url, image){
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
	let gameVideoLink = youtubeParser(form.querySelector('.edit-form__video-input').value);
	let gameDescription = form.querySelector('.edit-form__description').value;

	let formData = new FormData();
	formData.append('id', gameId);
	formData.append('title', gameTitle);
	formData.append('description', gameDescription);
	formData.append('platform', platformsJson);
	formData.append('price', gamePrice);
	formData.append('videoLink', gameVideoLink);
	formData.append('image', image);
	
	let xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.send(formData);

	xhr.onload = function(){
		if(xhr.status === 200){
			console.log('Все хорошо: ' + xhr.responseText);
			hideForm(form);
			getGamecards();
		}else{
			showError(saveErrorMessage);
			form.querySelector('.edit-form__button--accept').disabled = false;
		}	
	}
	xhr.onerror = function(){
		console.log('Ошибка: ' + xhr.statusText);
		showError(saveErrorMessage);
		form.querySelector('.edit-form__button--accept').disabled = false;
	}
}

document.querySelector('.add__button').addEventListener('click', (event) => {
	event.preventDefault();
	createForm({}, '/add');
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

		let deleteModal = form.querySelector('.edit-form__delete-modal');
		function showDeleteModal(){
			deleteModal.classList.remove('edit-form__delete-modal--hidden');
		}

		function hideDeleteModal(){
			deleteModal.classList.add('edit-form__delete-modal--hidden');
		}

		form.querySelector('.edit-form__button--delete').addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			showDeleteModal();
		});
		form.addEventListener('click', (event) => {
			if(event.target != deleteModal && !deleteModal.contains(event.target)){
				hideDeleteModal();
			}
		});
		deleteModal.querySelector('.delete-modal__button--confirm').addEventListener('click', (event) => {
			event.preventDefault();
			deleteGame(form.dataset.id, form);
		});
		deleteModal.querySelector('.delete-modal__button--decline').addEventListener('click', (event) => {
			event.preventDefault();
			hideDeleteModal();
		})
	}else{
		form.querySelector('.edit-form__button--delete').remove();
		form.querySelector('.edit-form__delete-modal').remove();
		form.querySelector('.edit-form__rating').remove();
		form.querySelector('.edit-form__title-input').classList.add('edit-form__title-input--add');
		form.querySelector('.edit-form__submit-wrapper').classList.add('edit-form__submit-wrapper--add');
	}
	document.body.appendChild(formWrap);
	document.body.style.overflowY = 'hidden';
	document.body.style.marginRight = `${scrollWidth}px`;
	setTimeout(function(){
		form.classList.remove('edit-form--hidden');
		blurWrapper.classList.add('blur-effect');
	}, 10);
	
	formWrap.addEventListener('mousedown', function(event){
		let clickStart = event.target;
		if(event.target != form && !form.contains(event.target)){
			event.target.addEventListener('mouseup', function(event){
				if(clickStart == event.target){
					unlockGame(id, getGamecards);
					hideForm(form);			
				}
			})
		}
	});

	form.querySelector('.edit-form__button--decline').addEventListener('click', (event) => {
		event.preventDefault();
		unlockGame(id, getGamecards);
		hideForm(form);
	});
	form.querySelector('.edit-form__button--accept').addEventListener('click', function(event){
		event.preventDefault();
		if(validateForm(form)){
			sendEditForm(form, sendUrl, newImage);
			this.disabled = true;
		}
	});
	
	let dropArea = form.querySelector('.edit-form__image-label');
	let dropAreaImage = form.querySelector('.edit-form__image');

	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		dropAreaImage.addEventListener(eventName, preventDefaults, false);
	});
	function preventDefaults (event) {
		event.preventDefault();
		event.stopPropagation();
	}

	let newImage;

	form.querySelector('.edit-form__image-input').addEventListener('change', function(){
		previewFile(this.files[0], dropAreaImage);
		newImage = this.files[0];
	});
	dropAreaImage.addEventListener('drop', (event) => {
		previewFile(event.dataTransfer.files[0], dropAreaImage);
		newImage = event.dataTransfer.files[0];
		dropArea.classList.remove('edit-form__image-label--dragenter');
	});
	dropAreaImage.addEventListener('dragenter', (event) => {
		dropArea.classList.add('edit-form__image-label--dragenter');
	});
	dropAreaImage.addEventListener('dragleave', (event) => {
		dropArea.classList.remove('edit-form__image-label--dragenter');
	});
}

function validateForm(form){
	let gameTitle = form.querySelector('.edit-form__title-input');
	let gameDescription = form.querySelector('.edit-form__description');
	let gamePrice = form.querySelector('.edit-form__price-input');
	let gameVideoLink = form.querySelector('.edit-form__video-input');
	let platformsContainer = form.querySelector('.edit-form__platforms');
	let platforms = platformsContainer.querySelectorAll('.edit-form__platform-checkbox');
	console.log(platforms);
	let platformsArr = [];
	platforms.forEach(item => {
		if(item.checked){
			platformsArr.push(true);
		}
	});

	let results = [];

	if(!gameTitle.value){
		results.push(false);
		gameTitle.classList.add('edit-form__input--invalid');
		setTimeout(() => {
			gameTitle.classList.remove('edit-form__input--invalid');
		}, 1000);
	}
	if(!gameDescription.value){
		results.push(false);
		gameDescription.classList.add('edit-form__input--invalid');
		setTimeout(() => {
			gameDescription.classList.remove('edit-form__input--invalid');
		}, 1000);
	}
	if(!gamePrice.value || gamePrice.value < 0){
		results.push(false);
		gamePrice.classList.add('edit-form__input--invalid');
		setTimeout(() => {
			gamePrice.classList.remove('edit-form__input--invalid');
		}, 1000);
	}
	if(platformsArr.length === 0){
		results.push(false);
		platformsContainer.classList.add('edit-form__input--invalid');
		setTimeout(() => {
			platformsContainer.classList.remove('edit-form__input--invalid');
		}, 1000);
	}
	if(!gameVideoLink.value || !youtubeParser(gameVideoLink.value)){
		results.push(false);
		gameVideoLink.classList.add('edit-form__input--invalid');
		setTimeout(() => {
			gameVideoLink.classList.remove('edit-form__input--invalid');
		}, 1000);
	}

	if(results.length === 0){
		return true;
	}
	return false;
}

function unlockGame(id, fn){
	if(!id){
		return;
	}	
	let xhr = new XMLHttpRequest();
	xhr.open('POST', '/unlock', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	let body = 'id=' + id;
	xhr.send(body);
	xhr.onload = function(){
		fn();
	}
}

function hideForm(form){
	form.classList.add('edit-form--hidden');
	blurWrapper.classList.remove('blur-effect');
	form.addEventListener('transitionend', () => {
		form.parentNode.remove();	
		document.body.style = '';
	})
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
	xhr.open('POST', '/delete', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	let body = 'id=' + id;
	xhr.send(body);
	xhr.onload = function(){
		if(xhr.status === 200){
			hideForm(form);
			getGamecards();
		}else{
			showError(saveErrorMessage);
		}
	}
	xhr.onerror = function(){
		showError(saveErrorMessage);
	}
}

function editFormTemplate(obj = {}) {
	return {
		tag: 'div',
		cls: 'edit-form__wrapper',
		content: {
			tag: 'form',
			cls: ['edit-form', 'edit-form--hidden'],
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
											attrs: {autocomplete: 'off',type: 'text', name: 'title', value: obj.title || '', placeholder: 'Введите название'}
										},
										{
											tag: 'p',
											cls: ['edit-form__rating', 'gamecard__rating'],
											content: obj.rating ? obj.rating.toFixed(1) : '0'
										}
									]
								},
								{
									tag: 'textarea',
									cls: 'edit-form__description',
									attrs: {name: 'description', placeholder: 'Введите описание'},
									content: obj.description || ''
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
										attrs: {src: obj.image || 'img/gameImg/placeholder.png', alt: obj.title || 'Загрузите картинку', width: '170', height: '170'}
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
							attrs: {autocomplete: 'off', min: 0, type: 'number', name: 'price', value: obj.price + '' || '', placeholder: 'Введите цену'}
						},
						{
							tag: 'input',
							cls: 'edit-form__video-input',
							attrs: {autocomplete: 'off',
									type: 'text', 
									name: 'videoLink', 
									value: obj.videoLink ? 'https://www.youtube.com/watch?v=' + obj.videoLink : '', 
									placeholder: 'Ссылка на видео'}
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
				},
				{
					tag: 'div',
					cls: ['edit-form__delete-modal', 'delete-modal', 'edit-form__delete-modal--hidden'],
					content: [
						{
							tag: 'p',
							cls: 'delete-modal__text',
							content: 'Вы действительно хотите удалить данную игры?'
						},
						{
							tag: 'div',
							cls: 'delete-modal__button-wrapper',
							content: [
								{
									tag: 'button',
									cls: ['edit-form__button', 'edit-form__button--delete', 'delete-modal__button', 'delete-modal__button--confirm'],
									content: 'Да'
								},
								{
									tag: 'button',
									cls: ['edit-form__button', 'delete-modal__button', 'delete-modal__button--decline'],
									content: 'Нет'
								}
							]
						}
					]
				}
			]
		}
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
		cls: ['showcase__card', 'gamecard', 'gamecard__editable'],
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
										content: obj.rating.toFixed(1) || 0
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
						attrs: {src: obj.image || 'img/gameImg/placeholder.png', alt: obj.title , width: '170', height: '170'}
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
						content: obj.price == 0 ? 'Бесплатно' : obj.price + '₽'
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

//YouTube

function youtubeParser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}