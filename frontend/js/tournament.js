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
		tournamentTable.classList.add("w-100", "container", "mt-5")
		let participants = event.data;
		let i = 0;
		console.log("participantes: " + participants);
		tournamentTable.innerHTML = "";
        let tournament = {
            name: "",
            size: 0,
            competitors: []
        }
		while (i < participants && i < 8)
		{
			createCompetitorNode(i, tournamentTable);
			i++;
		}
		if (i > 0)
		{
			let confirm = document.createElement("button");
			confirm.classList.add("vapor-btn");
			confirm.textContent = "Start Tournament";
            confirm.addEventListener("click", createTournament.bind(tournament))
			tournamentTable.appendChild(confirm);
		}
	})




};

function createCompetitorNode(i, tournamentTable){
	let row = document.createElement("row");
	row.classList.add("competitor-row", "row", "justify-content-start", "mb-1")
	let label = document.createElement("label");
	label.classList.add("competitor-label", "col-4", "w-25");
	label.innerHTML = `P${i + 1}`;
	let input = document.createElement("input");
	input.classList.add("col-8");
	input.setAttribute("placeholder", `Player ${i + 1}`);
	input.value = `Player ${i + 1}`;
	row.appendChild(label);
	row.appendChild(input);
	tournamentTable.appendChild(row);
}

function createTournament(e) {
    console.log(e);
}




// ESC to close modals;

document.addEventListener('keydown', function (e) {
	// console.log(e.key);
  
	if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
	  closeModal();
	}
  });