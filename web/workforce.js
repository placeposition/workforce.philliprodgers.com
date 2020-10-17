window.workforce = (function(window, moment){

	'use strict';

	var localStorage = window.localStorage;
	var document = window.document;
	var Promise = window.Promise;
	var console = window.console;

	var months = [
		{month: 0, label: 'january'},
		{month: 1, label: 'february'},
		{month: 2, label: 'march'},
		{month: 3, label: 'april'},
		{month: 4, label: 'may'},
		{month: 5, label: 'june'},
		{month: 6, label: 'july'},
		{month: 7, label: 'august'},
		{month: 8, label: 'september'},
		{month: 9, label: 'october'},
		{month: 10, label: 'november'},
		{month: 11, label: 'december'},
	];

	var fname = null;
	var birth = null;

	var intInputs = {
		date: function (i) { birth.date(i); },
		month: function (i) { birth.month(i); },
		year: function (i) { birth.year(i);},
		hours: function (i) { birth.hours(i);},
		minutes: function (i) { birth.minutes(i);}
	};

	var incrementInputs = {
		date: function (i) { birth.add({days: i}); },
		year: function (i) { birth.add({years: i}); },
		hours: function (i) { birth.add({hours: i}); },
		minutes: function (i) { birth.add({minutes: i}); }
	};

	var debounce = function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	var numOnly = function numOnly(evt) {
		var theEvent = evt || window.event;
		var key = theEvent.keyCode || theEvent.which;
		//handle backspace/tab in firefox (IE/chrome do not call onKeypress for BS/tab)
		//FF/IE/Chrome - also pass carriage return through so form submission via CR can be handled consistently
		//home/end/delete and the 4 arrow keys are also caught and passed through
		if( [8, 9, 13, 35, 36, 37, 38, 39, 40, 46].indexOf(key) !== -1) {return;}
		key = String.fromCharCode( key );
		//var regex = /[0-9 +]|\./;
		var regex = /^[0-9.:]+$/;
		if(!regex.test(key)) {
			theEvent.returnValue = false;
			if(theEvent.preventDefault) {theEvent.preventDefault();}
		}
	};

	var setIntNow = function setIntNow(e) {

		var i = parseInt(e.value, 10);

		if(isNaN(i)) {

			e.classList.add('invalid');
			return false;
		
		} else {
			e.classList.remove('invalid');
		}

		var dob = document.querySelector('input[name="dob"]');
		
		if (dob) {

			intInputs[e.name](i);

			dob.value = birth.format('YYYY-MM-DDTHH:mm');
			dob.dispatchEvent(new Event('change'));
		}
	};

	var setInt = debounce(setIntNow, 2000);

	var increment = function increment(input, i) {

		var _date = parseInt(document.querySelector('input[name="' + input + '"]').value, 10);

		if (!isNaN(_date)) {

			var dob = document.querySelector('input[name="dob"]');

			if (dob) {

				incrementInputs[input](i);

				dob.value = birth.format('YYYY-MM-DDTHH:mm');
				dob.dispatchEvent(new Event('change'));
			}
		}
	};

	var incrementMonth = function incrementMonth(i) {

		var dob = document.querySelector('input[name="dob"]');

		if (dob) {

			birth.add({months: i});

			dob.value = birth.format('YYYY-MM-DDTHH:mm');
			dob.dispatchEvent(new Event('change'));
		}
	};

	var monthInt = function monthInt() {

		var dob = document.querySelector('input[name="dob"]');
		var month = document.querySelector('input[name="month"]');

		var i = parseInt(month.value, 10);

		if(!isNaN(i)) {

			birth.month(i - 1);
	
			dob.value = birth.format('YYYY-MM-DDTHH:mm');
			dob.dispatchEvent(new Event('change'));

			return true;
		}

		return false;
	};

	var setMonthNow = function setMonthNow(e) {

		var i = parseInt(e.value, 10);

		if(!isNaN(i)) {
			return monthInt();
		}

		var v = e.value.toLowerCase();

		if (e.value.length > 0) {
			
			var month = months.find(function(m) {
				return m.label.startsWith(v); // m.label.includes(v);
			});

			if (month) {

				var dob = document.querySelector('input[name="dob"]');

				birth.month(month.month);

				dob.value = birth.format('YYYY-MM-DDTHH:mm');
				dob.dispatchEvent(new Event('change'));

				e.blur();
			}
		}
	};

	var setMonth = debounce(setMonthNow, 2000);

	var init = function init() {

		// 32% of internet users are aged 25-35
		birth = moment().subtract({years: 29, months: 6}).hours(0).minutes(0).seconds(0);

		var dob = document.querySelector('input[name="dob"]');	
		dob.value = birth.format('YYYY-MM-DDTHH:mm');
		dob.dispatchEvent(new Event('change'));
	};

	var begin = function begin() {

		var el = document.querySelector('input[name="fname"]');
		fname = el.value;

		if (!fname.length) {
			
			el.classList.add('invalid');
			return false;
		}

		var ele = document.querySelectorAll('.begin');
		for (var i = 0; i < ele.length; i++) {
			ele[i].classList.toggle('d-none');
		}
	};

	var age = function age(d) {

		var now = moment();
		var _birth = d.clone();

		var years = now.diff(_birth, 'year');
		_birth.add({years: years});

		var months = now.diff(_birth, 'months');
		_birth.add({months: months});

		var days = now.diff(_birth, 'days');
		_birth.add({days: days});

		var hours = now.diff(_birth, 'hours');
		_birth.add({hours: hours});

		return {
			years: years,
			months: months,
			days: days,
			hours: hours
		};
	};

	var updateAge = function updateAge() {

		var _age = age(birth);

		document.querySelector('span.years').innerHTML = _age.years;
		document.querySelector('span.months').innerHTML = _age.months;
		document.querySelector('span.days').innerHTML = _age.days;
		document.querySelector('span.hours').innerHTML = _age.hours;

	};

	var updateJumbo = function updateJumbo(e) {

		var input = moment(e.value);
		
		document.querySelector('input[name="date"]').value = input.date();
		document.querySelector('input[name="month"]').value = input.format('MMMM');
		document.querySelector('input[name="year"]').value = input.year();
		document.querySelector('input[name="hours"]').value = input.format('HH');
		document.querySelector('input[name="minutes"]').value = input.format('mm');

		updateAge();
	};

	var resultTransform = function resultTransform(result) {

		var row = [];
		var dob = moment(result.dob);
		var _age = age(dob);
		
		row.push('<tr>');

		row.push('<td>' + result.name + '</td>');

		row.push('<td>' + dob.format('DD MMM YYYY HH:mm') + '</td>');

		row.push('<td>' + String(_age.years) + ' years, ' + String(_age.months) + ' months, ' + String(_age.days) + ' days, ' + String(_age.hours) + ' hours</td>');

		row.push('</tr>');

		return row.reduce(function(results, item){
			return results + item;
		}, '');

	};

	var drawResults = function drawResults(results) {

		var table = results.reduce(function(results, item){
			return results + resultTransform(item);
		}, '');

		var el = document.querySelector('.results-table');

		if (el) {

			var elTable = el.querySelector('table > tbody');

			el.classList.remove('d-none');
			elTable.innerHTML = table;
		}
	};

	var save = function save() {

		var result = {
			name: fname,
			dob: document.querySelector('input[name="dob"]').value,
		};

		var results = new Array(0);

		var storageItem = localStorage.getItem('workforce-results');

		if (storageItem) {
			results = JSON.parse(storageItem);
		}

		results.push(result);

		window.localStorage.setItem('workforce-results',  JSON.stringify(results));

		drawResults(results);
	};

	var restart = function restart() {

		var el = document.querySelector('.results-table');

		if (el) {

			var elTable = el.querySelector('table > tbody');

			el.classList.add('d-none');
			elTable.innerHTML = '';

			document.querySelector('input[name="fname"]').value = '';
		
			var ele = document.querySelectorAll('.begin');

			for (var i = 0; i < ele.length; i++) {
				ele[i].classList.toggle('d-none');
			}
		}
	};

	var clearResults = function clearResults() {

		localStorage.removeItem('workforce-results');

		restart();
	};

	var Workforce = function Workforce() {

		var _self = this;

		_self.init = init.bind(_self);
		_self.begin = begin.bind(_self);
		
		_self.numOnly = numOnly.bind(_self);

		_self.increment = increment.bind(_self);
		_self.incrementMonth = incrementMonth.bind(_self);
		
		_self.setInt = setInt.bind(_self);
		_self.setIntNow = setIntNow.bind(_self);
		
		_self.setMonth = setMonth.bind(_self);
		_self.setMonthNow = setMonthNow.bind(_self);

		_self.updateJumbo = updateJumbo.bind(_self);

		_self.save = save.bind(_self);
		_self.clearResults = clearResults.bind(_self);
		_self.restart = restart.bind(_self);
	
    };

	return new Workforce();

}(window, window.moment));
