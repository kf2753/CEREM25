// Create mappings for quick lookup
const internatMap = {};
const promoMap = {};
const allAttendees = [];

// Initialize data
internatData.forEach(person => {
    internatMap[person.seat] = person;
    allAttendees.push({...person, section: 'INT'});
});

promoData.forEach(person => {
    promoMap[person.seat] = person;
    allAttendees.push({...person, section: 'PROMO 2025'});
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set CSS variable for seat size
    document.documentElement.style.setProperty('--seat-size', '62px');
    
    generateSeating();
    
    // Add event listener to search button
    document.getElementById('searchButton').addEventListener('click', searchPerson);
    
    // Add event listener for Enter key in search input
    document.getElementById('searchInput').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchPerson();
        }
    });
});

// Generate seating layout
function generateSeating() {
    const seatingArea = document.getElementById('seating-area');
    
    // Clear previous content
    seatingArea.innerHTML = '';
    
    // Generate all 12 rows
    for (let r = 1; r <= 12; r++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        
        const rowLabel = document.createElement('div');
        rowLabel.className = 'row-label';
        rowLabel.textContent = `R ${r}`;
        rowElement.appendChild(rowLabel);
        
        // Left block (INT)
        const leftBlockDiv = document.createElement('div');
        leftBlockDiv.className = 'side-block';
        
        // Aisle
        const aisleDiv = document.createElement('div');
        aisleDiv.className = 'aisle';
        aisleDiv.textContent = 'Allée';
        
        // Right block (PROMO 2025)
        const rightBlockDiv = document.createElement('div');
        rightBlockDiv.className = 'side-block';
        
        // Fill left side (10 seats)
        for (let c = 1; c <= 10; c++) {
            let seatId;
            if (r <= 3) {
                seatId = (r - 1) * 10 * 2 + c; // left seats
            } else {
                const rowLetter = String.fromCharCode(64 + (r - 3));
                seatId = `${rowLetter}${c}`;
            }
            leftBlockDiv.appendChild(createSeat(seatId, 'left'));
        }
        
        // Fill right side (10 seats)
        for (let c = 1; c <= 10; c++) {
            let seatId;
            if (r <= 3) {
                seatId = (r - 1) * 10 * 2 + 10 + c; // right seats
            } else {
                const rowLetter = String.fromCharCode(64 + (r - 3));
                seatId = `${rowLetter}${c}`;
            }
            rightBlockDiv.appendChild(createSeat(seatId, 'right'));
        }
        
        // Add spacer at the end of the right side
        const rightSpacer = document.createElement('div');
        rightSpacer.className = 'right-spacer';
        rightBlockDiv.appendChild(rightSpacer);
        
        rowElement.appendChild(leftBlockDiv);
        rowElement.appendChild(aisleDiv);
        rowElement.appendChild(rightBlockDiv);
        seatingArea.appendChild(rowElement);
    }
}

// Create a seat element
function createSeat(seatId, side) {
    const seatElement = document.createElement('div');
    seatElement.className = 'seat';
    seatElement.dataset.seat = seatId;
    seatElement.dataset.side = side;

    const seatNumber = document.createElement('div');
    seatNumber.className = 'seat-label';
    seatNumber.textContent = seatId;
    
    const seatName = document.createElement('div');
    seatName.className = 'seat-name';
    
    let person;
    if (side === 'left') {
        person = internatMap[seatId];
        if (person) seatElement.classList.add('int');
    } else {
        person = promoMap[seatId];
        if (person) seatElement.classList.add('promo');
    }
    
    if (person) {
        seatName.textContent = `${person.nom} ${person.prenom}`;
        seatElement.title = `${person.nom} ${person.prenom}`;
    } else {
        seatName.textContent = 'Libre';
    }
    
    seatElement.appendChild(seatNumber);
    seatElement.appendChild(seatName);
    
    // Add click event to show details
    seatElement.addEventListener('click', function() {
        showSeatDetails(this);
    });
    
    return seatElement;
}

// Show seat details when clicked
function showSeatDetails(seatElement) {
    const seatId = seatElement.dataset.seat;
    const side = seatElement.dataset.side;
    const searchResults = document.getElementById('searchResults');
    
    let person;
    if (side === 'left') {
        person = internatMap[seatId];
    } else {
        person = promoMap[seatId];
    }
    
    if (person) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 10px; background: #ebf8ff; border-radius: 8px;">
                <div style="font-weight: 600; color: #2d3748;">${person.nom} ${person.prenom}</div>
                <div style="color: #4a5568;">Siège: ${seatId} | Section: ${side === 'left' ? 'INT' : 'PROMO 2025'}</div>
            </div>
        `;
        
        // Highlight the seat
        removeHighlights();
        seatElement.classList.add('highlighted');
    } else {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px;">
                <div style="color: #4a5568;">Siège ${seatId} est actuellement libre.</div>
            </div>
        `;
        
        // Highlight the empty seat
        removeHighlights();
        seatElement.classList.add('highlighted');
    }
}

// Remove all highlights
function removeHighlights() {
    const highlightedSeats = document.querySelectorAll('.seat.highlighted');
    highlightedSeats.forEach(seat => {
        seat.classList.remove('highlighted');
    });
    
    const highlightedResults = document.querySelectorAll('.result-item.highlighted-result');
    highlightedResults.forEach(result => {
        result.classList.remove('highlighted-result');
    });
}

// Search for a person
function searchPerson() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    if (!searchTerm) {
        searchResults.innerHTML = '<div style="text-align: center; color: #718096;">Veuillez entrer un nom à rechercher.</div>';
        removeHighlights();
        return;
    }
    
    // Find matches
    const matches = allAttendees.filter(person => 
        person.nom.toLowerCase().includes(searchTerm) || 
        person.prenom.toLowerCase().includes(searchTerm)
    );
    
    if (matches.length === 0) {
        searchResults.innerHTML = `<div style="text-align: center; color: #718096;">Aucune personne trouvée pour "${searchTerm}".</div>`;
        removeHighlights();
        return;
    }
    
    // Remove previous highlights
    removeHighlights();
    
    // Display results
    searchResults.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; font-weight: 600; color: #2d3748;">
            ${matches.length} personne(s) trouvée(s)
        </div>
        <div class="results-list" id="resultsList">
            ${matches.map((person, index) => `
                <div class="result-item ${person.section === 'INT' ? 'int' : 'promo'}" 
                     data-seat="${person.seat}" 
                     data-side="${person.section === 'INT' ? 'left' : 'right'}"
                     data-index="${index}">
                    <div class="person-name">${person.nom} ${person.prenom}</div>
                    <div class="person-seat">Siège: ${person.seat}</div>
                    <div class="person-section">Section: ${person.section}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add click events to result items
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach(item => {
        item.addEventListener('click', function() {
            const seatId = this.dataset.seat;
            const side = this.dataset.side;
            
            // Remove all highlights first
            removeHighlights();
            
            // Highlight the selected seat
            const seatElement = document.querySelector(`.seat[data-seat="${seatId}"][data-side="${side}"]`);
            if (seatElement) {
                seatElement.classList.add('highlighted');
                seatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Highlight the selected result item
            this.classList.add('highlighted-result');
        });
    });
    
    // Auto-highlight and scroll to first result
    if (matches.length > 0) {
        const firstPerson = matches[0];
        const seatElement = document.querySelector(`.seat[data-seat="${firstPerson.seat}"][data-side="${firstPerson.section === 'INT' ? 'left' : 'right'}"]`);
        if (seatElement) {
            seatElement.classList.add('highlighted');
            seatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Highlight first result item
        const firstResult = document.querySelector('.result-item[data-index="0"]');
        if (firstResult) {
            firstResult.classList.add('highlighted-result');
        }
    }
}