
			let playerBalance = 100;
			let deck = [];
			let cards = [2, 3, 4, 5, 6, 7, 8, 9, 10 ,"J", "Q", "K", "A"];
			let playerHand = [];
			let dealerHand = [];
			let consecutiveWins = 0;
			
			let intervalID = null;

			const audioFiles = [
				'assets/audio/ambience.mp3',
				'assets/audio/laugh.mp3',
				'assets/audio/intensity-2.mp3',
				'assets/audio/intensity-3.mp3'
			];
			
			let audioLayers = [];
			
			for (let i = 0; i < 4; i++){
				for (let rank of cards){
						if(rank == "J" || rank == "Q" || rank == "K"){
							deck.push(10);
						} else if (rank == "A"){
							deck.push(11);
						} else {
							deck.push(rank);
						}
				}
			}
			function drawCard(){
				if(deck.length == 0){
					reShuffle();
				}
				let cardIndex = Math.floor(Math.random() * deck.length);
				let card = deck[cardIndex];
				deck.splice(cardIndex, 1);
				return card;
			}
			
			function calculateValue(hand){
				let value = 0;
				let numAces = 0
				for (let card of hand)
				{
					value += card;
					if(card == 11)
					{
						numAces++;
					}
				}
				while (value > 21 && numAces > 0){
					value -= 10;
					numAces--;
				}
				return value;
			}
			
			function updateDisplay(){
				document.getElementById('dealerHand').innerHTML = "Dealer: " + dealerHand.join(" ") + " (Score: " + calculateValue(dealerHand) + ")";
				document.getElementById('playerHand').innerHTML = "Player: " + playerHand.join(" ") + " (Score: " + calculateValue(playerHand) + ")";
				document.getElementById('displayBalance').innerHTML = "Balance: " + playerBalance;
			}
			
			function deal(){
				initializeAudio();
				
			let betAmount = parseInt(document.getElementById('bet').value);
			if(betAmount > playerBalance || betAmount <= 0)
			{
				alert("Invalid Bet");
				endGame();
			}
			playerBalance -= betAmount;
			document.getElementById('displayBalance').innerHTML = "Balance: " + playerBalance;
				reShuffle();
				playerHand = [];
				dealerHand = [];
				playerHand.push(drawCard());
				dealerHand.push(drawCard());
				playerHand.push(drawCard());
				dealerHand.push(drawCard());
				updateDisplay();
				document.getElementById('dealButton').style.display = 'none';
				document.getElementById('hitButton').hidden = false;
				document.getElementById('standButton').hidden = false;
				document.getElementById('bet').disabled = true;
			}
			
			function endGame() {
				document.getElementById('dealButton').style.display = 'inline-block';
				document.getElementById('hitButton').hidden = true;
				document.getElementById('standButton').hidden = true;
				document.getElementById('bet').disabled = false;
				document.getElementById('displayBalance').innerHTML = "Balance: " + playerBalance;
			}
			
			function hit(){
				playerHand.push(drawCard());
				updateDisplay();
				let playerValue = calculateValue(playerHand);
				if(playerValue > 21){
					alert("Player Busts, Dealer Wins");
					updateGameIntensity(consecutiveWins);
					endGame();
				}
			}
			
			function stand(){
				let betAmount = parseInt(document.getElementById('bet').value);
				document.getElementById('hitButton').hidden = true;
				document.getElementById('standButton').hidden = true;
				
				while(calculateValue(dealerHand) < 17){
					dealerHand.push(drawCard());
				}
				
				updateDisplay();
				let playerValue = calculateValue(playerHand);
				let dealerValue = calculateValue(dealerHand);
				
				let win = false;
				
				if (playerValue == 21 && playerHand.length == 2){
					alert("Blackjack, Player Wins");
					playerBalance += betAmount * 2.5;
					win = true;
				}else if (dealerValue > 21){
					alert("Dealer Busts, Player Wins");
					playerBalance += betAmount*2;
					win = true;
				} else if (playerValue > dealerValue){
					alert("Player Wins");
					playerBalance += betAmount*2;
					win = true;
				} else if (dealerValue > playerValue){
					alert("Dealer Wins");
					win = false;
				} else {
					alert("Push");
					win = false;
					playerBalance += betAmount;
				}
				
				if (win) {
					consecutiveWins++;
				} else {
					if (consecutiveWins >= 3) {
						clearInterval(intervalID);
						intervalID = null;
						document.body.style.backgroundColor = '';
					}
				}
				
				updateGameIntensity(consecutiveWins);
				
				endGame();
			}
			
			function reShuffle(){
				deck = [];
				cards = [2, 3, 4, 5, 6, 7, 8, 9, 10 ,"J", "Q", "K", "A"];
				for (let i = 0; i < 4; i++){
					for (let rank of cards){
						if(rank === "J" || rank === "Q" || rank === "K"){
							deck.push(10);
						} else if (rank === "A"){
							deck.push(11);
						} else {
							deck.push(rank);
						}
					}
				}
			}
			reShuffle();
			

			function initializeAudio(){
				stopAllAudioLayers();
				audioLayers = [];
	
				audioFiles.slice(0,3).forEach((src) => {
					const audio = new Audio(src);
					audio.loop = true;
					audio.volume = 0;
					audioLayers.push(audio);
				});
			}
			
			function stopAllAudioLayers(){
				audioLayers.forEach(audio => {
					audio.pause();
					audio.currentTime = 0;
				});
			}

			function updateGameIntensity(count){
				if (count == 4) {
					
					$message.textContent = "uh oh";
					$body.style.backgroundColor = 'black';
					$message.style.color = 'red';
				
					stopAllAudioLayers();
					clearInterval(intervalID);
					intervalID = null;
		
					setTimeout(() => {
						window.location.reload();
					}, 4000);
					return;
				}
				
				if (count > 0 && audioLayers[count - 1] && audioLayers[count - 1].paused) {
				    stopAllAudioLayers();
				}
	
				for (i = 0; i < count; i++) {
					if (i < audioLayers.length){
						const audio = audioLayers[i];
						if (audio) {
							audio.play().catch(e => console.error('Error playing audio layer'));
							audio.volume = 0.8;
						}
					}
				}
	
				if (count >= 3){
					if(!intervalID) {
						let minuteCount = 0;
		
						intervalID = setInterval(() => {
							minuteCount++;
			
							const timeAudio = new Audio(audioFiles[3]);
							timeAudio.volume = 0.5;
							timeAudio.play().catch(e => console.error('Error playing time Audio.'));
			
							const intensity = minuteCount*20;
							const red = Math.min(intensity + 10, 255);
							const green = 15;
							const blue = Math.min(intensity, 150);
			
							document.body.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
							
						}, 60000);
					}
				}
	
	
	
}
