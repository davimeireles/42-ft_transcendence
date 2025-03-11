'use strict'

const randomInt = function(max) {
	return (Math.floor(Math.random() * max));
}

let tournamentButton = document.getElementById("tournament-button");

const tournamentOrder = function(size) {
	let i = 0;
	let order = Array(size);

	while (i < size) {
		order[i] = randomInt(size);
		i++;
	}
	return (order);
}

class Tournament {
	constructor(name, size, competitors) {
		this._name = name;
		this._size = size;
		this._competitors = competitors;
		this._order = this.tournamentOrder(size);
		this._currentMatch = {
			player1: this._competitors[_order[0]],
			player2: this._competitors[_order[1]]
		}
		this._winner = undefined;
	};
	tournamentOrder = function(size) {
		let i = 0;
		let order = Array(size);
	
		while (i < size) {
			order[i] = randomInt(size);
			i++;
		}
		return (order);
	}
}

function renderTournament() {
  console.log("calling tournament button");
}