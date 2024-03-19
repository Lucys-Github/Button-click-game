/* Start the server for highscores:
1. run "npm i" in terminal
2. run "json-server db.json" in terminal */

/* Table of contents */
/* 1. variables storing HTML elements*/
/* 1.1 for index.html */
/* 1.2 for poänglista.html */

/* 2. Other variable declarations */

/* 3. Function declarations */
/* 3.1 displayCurrentPlayer */
/* 3.2. saveCurrentPlayer */
/* 3.3. updateSavedPlayers*/
/* 3.4 updatePoints */
/* 3.5 updateTimer */

/* 4 Fetch API functions */
/* 4.1 POST*/
/* 4.2 GET*/
/* 4.3 DELETE*/

/* 5. Eventlisteners/function calls */

/* End of table of ocontents */


/* 1. variables storing HTML elements */
/* 1.1. for index.html */
const currentPointsDisplay = document.getElementById("current-points-display");
const timer = document.getElementById("timer");
const showCurrentPlayer = document.getElementById("show-current-player");
const gameButton = document.getElementById("game-button");
const playerNameForm = document.getElementById('player-name-form');
const playerNameInput = document.getElementById('player-name-input');
const savedPlayersButtons = document.getElementById('choose-a-saved-player-buttons');
/* 1.2 for poänglista.html */
const clearAllHighScoresBtn = document.getElementById('clear-all-highscores-button');
const highscoreDisplayElement = document.getElementById('highscores-display');

/* 2. Other variable declarations */
let spelarData = { spelare: "", poäng: 0 }; //json object to send to API
let användarnamn = "";
let localStorageKey = "";
let seconds = 10;
let points = 0;
let playing = false;

/* 3. Function declarations */
/* 3.1 displayCurrentPlayer */
const displayCurrentPlayer = function () {
    användarnamn = playerNameInput.value;
    showCurrentPlayer.innerHTML = `Spelare: ${användarnamn}`
};

/* 3.2. saveCurrentPlayer */
const saveCurrentPlayer = function () {
    localStorageKey = `spelare_${användarnamn}`
    localStorage.setItem(localStorageKey, användarnamn);
    updateSavedPlayers();
    alert("sparat användare")
};

/* 3.3. updateSavedPlayers*/
const updateSavedPlayers = function () {
    if (savedPlayersButtons) {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(localStorageKey => {
            const playerName = localStorage.getItem(localStorageKey);
            const finnsNamnet = Array.from(savedPlayersButtons.children).find(button => button.textContent === playerName)
            if (!finnsNamnet) {
                const button = document.createElement('button');
                button.textContent = playerName;
                button.addEventListener('click', function () {
                    playerNameInput.value = playerName;
                    showCurrentPlayer.innerHTML = `Spelare ${playerName}`
                });
                //Doubleclick button to remove a saved player
                button.addEventListener('dblclick', function () {
                    savedPlayersButtons.removeChild(button);
                    localStorage.removeItem(`spelare_${playerName}`);
                });
                savedPlayersButtons.appendChild(button)
            }
        })
    }
};

/* 3.4 updatePoints */
const updatePoints = function () {
    if (playing === true) {
        points++;
        currentPointsDisplay.innerHTML = points + "poäng";
    }
};

/* 3.5 updateTimer */
const updateTimer = function () {
    if (seconds > -1) {
        timer.textContent = seconds--;
        setTimeout(updateTimer, 1000);
    } else {
        playing = false;
        spelarData.poäng = points;
        skickaPoängTillJSON(spelarData);
    }
};

/* 3.5 startGame*/
const startGame = function () {
    användarnamn = playerNameInput.value;
    playing = true;
    seconds = 10;
    points = 0;
    spelarData.spelare = användarnamn;
    updateTimer();
};

/*4. Fetch API functions  */
/*4.1 POST */
const skickaPoängTillJSON = function (data) {
    fetch('http://localhost:3000/scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spelare: data.spelare, poäng: data.poäng })
    })
        .then(response => response.json())
        .then(result => {
            console.log('poäng skickade', result)
        })
        .catch(error => {
            console.error('error', error)
        })
};

/* 4.2 GET */
const hämtaPoängFrånJSON = function () {
    fetch('http://localhost:3000/scores', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(scores => {
            console.log('Poäng hämtade', scores);
            if (scores.length === 0) {
                highscoreDisplayElement.innerHTML = 'Inga highscores';
            } else {
                highscoreDisplayElement.innerHTML = scores.map(score => `<p>${score.spelare}: ${score.poäng} poäng</p>`).join('');
            }
        })
        .catch(error => {
            console.error('Error', error);
        });
};

/* 4.1 DELETE */
const taBortPoängfrånJSON = function () {
    fetch('http://localhost:3000/scores')
        .then(response => response.json())
        .then(scores => {
            scores.forEach(score => {
                fetch(`http://localhost:3000/scores/${score.id}`, {
                    method: 'DELETE'
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(response.statusText);
                        }
                    })
                    .catch(error => {
                        console.error(`Kunde inte ta bort ${score.id}:`, error);
                    });
            });
        })
        .catch(error => {
            console.error('error', error);
        });
};

/* 5. Eventlisteners/function calls */
//if () to check if element is available in html.
if (playerNameInput) {
    playerNameInput.addEventListener('input', displayCurrentPlayer)
};

if (playerNameForm) {
    playerNameForm.addEventListener('submit', saveCurrentPlayer)
};

if (gameButton) {
    gameButton.addEventListener('click', updatePoints)
};

if (timer) {
    timer.addEventListener('click', startGame
    )
};

if (clearAllHighScoresBtn) {
    clearAllHighScoresBtn.addEventListener('click', taBortPoängfrånJSON)
};

if (highscoreDisplayElement) {
    hämtaPoängFrånJSON();
}

updateSavedPlayers(); //creating saved player buttons upon initial page load

