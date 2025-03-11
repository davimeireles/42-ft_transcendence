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
  let profile = document.getElementById("profile-button");
  profile.addEventListener("click", function() {renderPage("profile");});
  let setting = document.getElementById("setting-button");
  setting.addEventListener("click", function() {renderPage("edit");});
  let home = document.getElementById("btn-home");
  home.addEventListener("click", function() {renderPage("home");});




  let sizeInput = document.getElementById("tournament-size");
  sizeInput.addEventListener("input", function(event) {
    let tournamentTable = document.getElementById("tournament-table");
    let participants = event.data;
    let i = 0;
    console.log("participantes: " + participants);
    tournamentTable.innerHTML = "";
    
    while (i < participants)
    {
      let row = document.createElement("row");
      row.innerHTML = `<p class="text-primary">Participant ${i + 1}</p>`;
      tournamentTable.appendChild(row);
      i++;
    }
  })




};