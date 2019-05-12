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

function openedGameTemplate(obj){
	let platformsClasses = {
		windows: 'gamecard__win',
		steamos: 'gamecard__steam',
		macos: 'gamecard__mac-os'
	}
	return {
		tag: 'div',
		cls: 'opened-game__wrapper',
		content: {
			tag: 'div',
			cls: ['opened-game', 'opened-game--hidden'],
			attrs: {"data-id": obj.id},
			content: [
				{
					tag: 'header',
					cls: 'opened-game__header',
					content: [
						{
							tag: 'h2',
							cls: ['opened-game__title', 'gamecard__title'],
							content: obj.title
						},
						{
							tag: 'button',
							cls: 'opened-game__close',
							content: 'Закрыть'
						}
					]
				},
				{
					tag: 'div',
					cls: 'opened-game__content',
					content: [
						{
							tag: 'div',
							cls: 'opened-game__video',
							content: {
								tag: 'iframe',
								attrs: {width: '711', height: '400', frameborder: '0', allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: '' , src: 'https://www.youtube.com/embed/' + obj.videoLink + '?rel=0'}
							}
						},
						{
							tag: 'div',
							cls: 'opened-game__image-wrapper',
							content: [
								{
									tag: 'img',
									cls: 'opened-game__image',
									attrs: {src: obj.image || 'img/gameImg/placeholder.png', alt: obj.title , width: '240', height: '240'}
								},
								{
									tag: 'div',
									cls: 'opened-game__rating-wrapper',
									content: [
										{
											tag: 'p',
											cls: 'opened-game__rating',
											content: 'Рейтинг:'
										},
										{
											tag: 'p',
											cls: 'opened-game__rating',
											content: obj.rating ? obj.rating.toFixed(1) : 0
										}
									]
								},
								{
									tag: 'div',
									cls: 'opened-game__votes-wrapper',
									content: [
										{
											tag: 'p',
											cls: 'opened-game__votes',
											content: 'Голоса:'
										},
										{
											tag: 'p',
											cls: 'opened-game__votes',
											content: obj.votes || 0
										}
									]
								},
								{
									tag: 'button',
									cls: ['button', 'opened-game__button--rate'],
									content: 'Оценить'
								},
								{
									tag: 'div',
									cls: ['opened-game__rate-container', 'opened-game__rate-container--hidden'],
									content: [
										{
											tag: 'input',
											cls: 'opened-game__rate-input',
											attrs: {type: 'range', name: 'rating', min: 0, max: 10}
										},
										{
											tag: 'button',
											cls: ['button', 'opened-game__rate-send'],
											content: '10'
										}
									]
								}
							]
						}
					]
				},
				{
					tag: 'div',
					cls: 'opened-game__info',
					content: [
						{
							tag: 'p',
							cls: 'opened-game__description',
							content: obj.description || 'Описание отсутствует'
						},
						{
							tag: 'div',
							cls: 'opened-game__buy-container',
							content: [
								{
									tag: 'p',
									cls: ['gamecard__price', 'opened-game__price'],
									content: obj.price == 0 ? 'Бесплатно' : obj.price + '₽'
								},
								{
									tag: 'div',
									cls: ['gamecard__platforms', 'opened-game__platforms'],
									content: obj.platform.reduce((acc, item) => {
										acc.push({
											tag: 'p',
											cls: ['gamecard__platform', 'opened-game__platform', platformsClasses[item.toLowerCase()]]
										});
										return acc;
									}, [])
								},
								{
									tag: 'a',
									cls: ['button', 'opened-game__button--buy'],
									content: obj.price == 0 ? 'Играть бесплатно' : 'Купить'
								}
							]
						}
					]
				}
			]
		}
	}
}

function showOpenedGame(id){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', `get?id=${id}`, true);
	xhr.send();
	xhr.onload = function(){
		if(xhr.status === 200){
			createOpenedGame(JSON.parse(xhr.responseText));
		}else{
			showError(loadErrorMessage);
		}
	}
	xhr.onerror = function(){
		showError(loadErrorMessage);
	}
}

function createOpenedGame(data){
	let openedGameWrap = browserJSEngine(openedGameTemplate(data));
	let openedGame = openedGameWrap.querySelector('.opened-game');
	document.body.appendChild(openedGameWrap);
	document.body.style.overflowY = 'hidden';
	document.body.style.marginRight = `${scrollWidth}px`;
	setTimeout(function(){
		openedGame.classList.remove('opened-game--hidden');
		blurWrapper.classList.add('blur-effect');
	}, 10);
	
	openedGameWrap.addEventListener('mousedown', function(event){
		let clickStart = event.target;
		if(event.target !== openedGame && !openedGame.contains(event.target)){
			event.target.addEventListener('mouseup', function(event){
				if(clickStart === event.target){
					hideOpenedGame(openedGame);
					getGamecards();					
				}
			})
		}
	});

	openedGame.querySelector('.opened-game__close').addEventListener('click', (event) => {
		hideOpenedGame(openedGame);
		getGamecards();
	});

	let rateButton = openedGame.querySelector('.opened-game__button--rate');
	let rateContainer = openedGame.querySelector('.opened-game__rate-container');
	let rateInput = rateContainer.querySelector('.opened-game__rate-input');
	let rateSend = rateContainer.querySelector('.opened-game__rate-send');

	openedGame.addEventListener('click', (event) => {
		if(event.target != rateContainer && !rateContainer.contains(event.target)){
			rateContainer.classList.add('opened-game__rate-container--hidden');
		}
	});

	rateInput.addEventListener('input', function(){
		rateSend.innerText = this.value;
	})

	rateButton.addEventListener('click', (event) => {
		event.stopPropagation();
		rateContainer.classList.toggle('opened-game__rate-container--hidden');
	})

	rateSend.addEventListener('click', (event) => {
		event.preventDefault();
		let rating = rateInput.value;
		voteForGame(openedGame.dataset.id, rating);
		rateContainer.classList.add('opened-game__rate-container--hidden');
		rateButton.disabled = true;
	})
}

function hideOpenedGame(openedGame){
	openedGame.classList.add('opened-game--hidden');
	blurWrapper.classList.remove('blur-effect');
	openedGame.addEventListener('transitionend', () => {
		openedGame.parentNode.remove();	
		document.body.style = '';
	})
}

function voteForGame(id, rating){
	let xhr = new XMLHttpRequest();
	let voteErrorMessage = document.querySelector('.error-message--vote');
	xhr.open('POST', '/vote', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	let body = 'id=' + id + '&rating=' + rating;
	xhr.send(body);
	xhr.onload = function(){
		if(xhr.status !== 200){
			showError(voteErrorMessage);
		}
	}
	xhr.onerror = function(){
		showError(voteErrorMessage);
	}
}