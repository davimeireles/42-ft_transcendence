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

    tournamentCreator();
};

function tournamentCreator() {
    let tournamentModal = document.getElementById("tournament-modal");

    let createTournament = document.createElement("div");
    createTournament.classList.add("semi-transparent", "col", "w-75", "m-3");
    createTournament.id = "create-tournament";
    tournamentModal.append(createTournament);
    
    let tournamentForm = document.createElement("form");
    tournamentForm.id = "tournament-form";
    createTournament.append(tournamentForm);
    
    let titleLabel = document.createElement("label");
    titleLabel.classList.add("form-label-username", "pt-3");
    titleLabel.for = "tournament-title";
    titleLabel.dataset.translateKey = "Title";
    titleLabel.textContent = "Title";
    tournamentForm.append(titleLabel);

    let tournamentTitle = document.createElement("input");
    tournamentTitle.id = "tournament-title";
    tournamentTitle.type = "text";
    tournamentTitle.maxlength = "20";
    titleLabel.after(tournamentTitle);
    
    let sizeLabel = document.createElement("label");
    sizeLabel.classList.add("form-label-username", "pt-3");
    sizeLabel.for = "tournament-size";
    sizeLabel.dataset.translateKey = "Size";
    sizeLabel.textContent = "Size";
    tournamentTitle.after(sizeLabel);
    
    let tournamentSize = document.createElement("input");
    tournamentSize.id = "tournament-size";
    tournamentSize.type = "number";
    tournamentSize.min = "1";
    tournamentSize.max = "8";
    sizeLabel.after(tournamentSize);
    
    let tournamentTable = document.createElement("table");
    tournamentTable.classList.add("w-100", "container", "mt-5")
    tournamentTable.id = "tournament-table";
    tournamentForm.after(tournamentTable);

	tournamentSize.addEventListener("input", function(event) {
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
            confirm.addEventListener("click", ft_createTournament);
			tournamentTable.appendChild(confirm);
		}
	})
}


function createCompetitorNode(i, tournamentTable){
	let row = document.createElement("row");
	row.classList.add("competitor-row", "row", "justify-content-start", "mb-1")
	let label = document.createElement("label");
	label.classList.add("competitor-label", "col-4", "w-25");
	label.innerHTML = `P${i + 1}`;
	let input = document.createElement("input");
	input.classList.add("competitor-input", "col-8");
	input.placeholder = `Player ${i + 1}`;
	input.value = `Player ${i + 1}`;
    input.id = `player-${i}`;
	row.appendChild(label);
	row.appendChild(input);
	tournamentTable.appendChild(row);
}

function ft_createTournament(e) {
    let competitors = document.querySelectorAll(".competitor-input")
}




// ESC to close modals;

document.addEventListener('keydown', function (e) {
	// console.log(e.key);
  
	if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
	  closeModal();
	}
});