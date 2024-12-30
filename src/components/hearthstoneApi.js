async function fetchRandomCard() {
    try {
        // Fetch the full cards list
        const response = await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cards = await response.json();

        // Generate a random index
        const randomIndex = Math.floor(Math.random() * cards.length);

        // Select the random card
        const randomCard = cards[randomIndex];

        // Log or return the card details
        const container = document.getElementById('data-container');
        const container.innerHTML = '<h2>Card name:</h2>';
        
        console.log('Random Card:', {
            name: randomCard.name,
            text: randomCard.text,
            flavor: randomCard.flavor,
            artist: randomCard.artist,
        });

        return randomCard;
    } catch (error) {
        console.error('There was a problem fetching a random card:', error);
    }
}

fetchRandomCard();