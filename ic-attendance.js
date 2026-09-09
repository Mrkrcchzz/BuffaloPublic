(async function() {
  // 1. Your Google Sheet CSV export URL
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1TfwCSGBMi6-6NZfP5vWAKbkrWlDjEsSeZTEr-4_5yRE/export?format=csv';

  try {
    // 2. Fetch Google Sheet Data
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error('Could not fetch sheet data. Verify Google Sheet sharing settings.');
    const text = await response.text();

    // 3. Parse IDs from Column A into a Set
    const scannedIDs = new Set(
      text.split('\n')
          .map(row => row.split(',')[0].trim().replace(/["\r]/g, ''))
          .filter(Boolean)
    );

    // 4. Find Infinite Campus Student Elements
    // Adjust 'tr.roster-row' if your IC page layout uses a different class
    const studentElements = document.querySelectorAll('tr.roster-row, div.student-row, tr[id*="student"], tr.gridRow');

    if (studentElements.length === 0) {
      console.warn('IC Tracker: No student elements matched the current selector.');
      return;
    }

    studentElements.forEach(el => {
      // Extract ID from attribute or row text
      const studentID = el.getAttribute('data-studentid') || el.innerText.match(/\b\d{5,10}\b/)?.[0];
      if (!studentID) return;

      // Create or update status dot
      let dot = el.querySelector('.ic-status-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'ic-status-dot';
        dot.style.display = 'inline-block';
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = '50%';
        dot.style.marginLeft = '8px';
        dot.style.verticalAlign = 'middle';
        dot.style.boxShadow = '0 0 2px rgba(0,0,0,0.3)';

        const targetCell = el.querySelector('.student-name, td:nth-child(2)') || el;
        targetCell.appendChild(dot);
      }

      // Apply status color
      if (scannedIDs.has(studentID)) {
        dot.style.backgroundColor = '#22c55e'; // Green
        dot.title = `ID ${studentID} found in sheet`;
      } else {
        dot.style.backgroundColor = '#ef4444'; // Red
        dot.title = `ID ${studentID} NOT found in sheet`;
      }
    });

  } catch (err) {
    alert('IC Tracker Error: ' + err.message);
  }
})();
