// --- Wheel Data ---
// This array represents your WheelData!F2:F39 range in wheel order
// IMPORTANT: Make sure this exactly matches the order on your physical wheel (0, 00, 1-36)
// Use numbers for 1-36 and 0. Use string "00" if that's how you enter it.
const wheelData = [
   0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00", 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
];

const wheelSize = wheelData.length; // Should be 38 for double zero. If no 00, change to 37.

// --- History Storage ---
let spinHistory = []; // This array will store all entered spin results

// --- Get HTML Elements ---
const spinInput = document.getElementById('spinInput');
const addSpinButton = document.getElementById('addSpinButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const validationFeedback = document.getElementById('validationFeedback');

const lastSpinQuadrantOutput = document.getElementById('lastSpinQuadrantOutput');
const lastSpinHalfOutput = document.getElementById('lastSpinHalfOutput');
const sum4Output = document.getElementById('sum4Output');
const avg10Output = document.getElementById('avg10Output');
const suggestionOutput = document.getElementById('suggestionOutput');
const surroundingNumbersOutput = document.getElementById('surroundingNumbersOutput');
const last10SpinsList = document.getElementById('last10SpinsList');
const last10QuadrantsList = document.getElementById('last10QuadrantsList');
const last10HalvesList = document.getElementById('last10HalvesList');


// --- Helper Function: Get Quadrant (Equivalent to Column B logic) ---
function getQuadrant(number) {
    // Ensure input is a number for comparison, handle "00" and 0 appropriately
    if (number === "00") return "00"; // Return "00" specifically
    if (number === 0) return 0; // Return 0 specifically

    const num = parseFloat(number); // Try converting
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 36) {
         return null; // Not a valid number 1-36
    }

    if (num >= 1 && num <= 9) return 1;
    if (num >= 10 && num <= 18) return 2;
    if (num >= 19 && num <= 27) return 3;
    if (num >= 28 && num <= 36) return 4;

    return null; // Should not happen for 1-36, but as a fallback
}

// --- Helper Function: Get Half (Equivalent to Column C logic) ---
function getHalf(number) {
    // Handle "00" and 0 appropriately
     if (number === "00") return "00";
     if (number === 0) return 0;

    const num = parseFloat(number); // Try converting
     if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 36) {
         return null; // Not a valid number 1-36
     }

    if (num >= 1 && num <= 18) return "1-18";
    if (num >= 19 && num <= 36) return "19-36";

    return null; // Should not happen
}


// --- Helper Function: Calculate Sum of Last 4 Quadrants (Modified to include 0/00) ---
function calculateSumLast4Quads(historyArray) {
    // Need at least 4 total spins to attempt a sum of the last 4
    if (historyArray.length < 4) return null;

    const last4Spins = historyArray.slice(-4); // Get the last 4 total entries
    let sum = 0;

    // Iterate through the last 4 spins
    for (const spin of last4Spins) {
        const quad = getQuadrant(spin); // Get the quadrant (0, "00", 1, 2, 3, 4, or null)

        // Sum quadrants 1-4 directly
        if (typeof quad === 'number' && quad >= 1 && quad <= 4) {
            sum += quad;
        } else if (quad === 0) {
            // If the spin was 0, treat its contribution to the sum as 0
            sum += 0;
        }
        // If the spin was "00" or invalid input (resulting in quad "00" or null), it is skipped from the sum.
        // This treats "00" differently than 0 for the sum calculation, as "00" doesn't map easily to a numerical quadrant value.
    }

    // Always return a sum based on the last 4 spins if history has at least 4 entries.
    // The sum will reflect contributions from 1-4 quads and 0 quads.
    return sum;
}

// --- Helper Function: Calculate Avg of Last 10 Raw (Equivalent to E4 logic) ---
function calculateAvgLast10Raw(historyArray) {
    const last10Spins = historyArray.slice(-10); // Get the last up to 10 entries
     if (last10Spins.length < 10) return null; // Only calculate if there are at least 10 spins

    let sum = 0;
    let count = 0;

    for (const spin of last10Spins) {
         // Only include numbers 1-36 in the raw average
        const numberValue = parseFloat(spin); // Try converting

        if (!isNaN(numberValue) && typeof spin !== 'string' && spin >= 1 && spin <= 36) { // Check if it's a valid number 1-36
             sum += numberValue;
            count++;
        } else {
             // If any of the last 10 are not valid numbers (1-36), we cannot form an avg of 10 raw numbers
             return null; // Cannot calculate avg of 10 raw
        }
    }

     // We should only get here if all 10 spins had valid numbers (1-36)
    return count === 10 ? sum / count : null; // Ensure exactly 10 valid numbers were summed
}


// --- Helper Function: Classify Sum of 4 (Equivalent to F1 logic) ---
function classifyE3(sum4) {
    if (sum4 === null) return ""; // No sum data from 4 quads

    // Use ranges defined previously (Sum ranges from 4 to 16 for 4 quads)
    if (sum4 <= 4) return "E3_ExtremeLow"; // Only 4
    if (sum4 >= 16) return "E3_ExtremeHigh"; // Only 16
    if (sum4 >= 5 && sum4 <= 6) return "E3_Low";
    if (sum4 >= 14 && sum4 <= 15) return "E3_High";
    if (sum4 >= 7 && sum4 <= 8) return "E3_MidLow";
    if (sum4 >= 12 && sum4 <= 13) return "E3_MidHigh";
    if (sum4 >= 9 && sum4 <= 11) return "E3_Medium"; // Covers 9, 10, 11

     return ""; // Fallback - should cover 4-16
}

// --- Helper Function: Classify Avg of 10 (Equivalent to G1 logic) ---
function classifyE4(avg10) {
     if (avg10 === null) return ""; // No avg data from 10 numbers

    // Use ranges defined previously (Avg ranges roughly 1-36)
    // Make sure these match the H1 conditions exactly
    if (avg10 < 14) return "E4_ExtremeLow";
    if (avg10 > 23) return "E4_ExtremeHigh";
    if (avg10 >= 14 && avg10 < 16) return "E4_Low";
    if (avg10 > 21 && avg10 <= 23) return "E4_High";
    if (avg10 >= 17 && avg10 <= 20) return "E4_Medium"; // Covers 17-20 (near 18.5)
    if (avg10 >= 16 && avg10 < 17) return "E4_MidLow";
    if (avg10 > 20 && avg10 <= 21) return "E4_MidHigh";

     return ""; // Fallback
}


// --- Helper Function: Get Suggestion (V2 - Quadrant/Half/Zone Framing & Intricate Web) ---
// This function takes the classified states of E3 (Sum of 4 Quads) and E4 (Avg of 10 Raw)
// and outputs a detailed suggestion string based on their combination.
function getSuggestion(e3Class, e4Class) {
    // Need classifications from both E3 (sum of 4) and E4 (avg of 10) for a suggestion
     // **REMOVED specific "Needs data" message**
     if (e3Class === "" || e4Class === "") {
         // Display this message if there isn't enough history yet for classification
         return "Analyzing Pattern... Need 4+ Quads & 10+ Numbers..."; // Or "" if preferred
     }


    // --- Intricate Web: Mapping Classified States to Bet Possibilities ---
    // Order is important - more specific/extreme combinations first

    // Case 1: Extreme Low E3 & Extreme Low E4
    // Indicators are far below balance. Focus on the lowest numbers/zones.
    if (e3Class === "E3_ExtremeLow" && e4Class === "E4_ExtremeLow") {
        return "VERY Strong Suggest: Focus Low Quadrants (1 & 2), 1-18 Half. High Likeliness for numbers in Q1/Q2, especially near center of 1-18. Consider Corners/Splits in Q1/Q2 boundaries.";
    }

    // Case 2: Extreme High E3 & Extreme High E4
    // Indicators are far above balance. Focus on the highest numbers/zones.
    if (e3Class === "E3_ExtremeHigh" && e4Class === "E4_ExtremeHigh") {
        return "VERY Strong Suggest: Focus High Quadrants (3 & 4), 19-36 Half. High Likeliness for numbers in Q3/Q4, especially near center of 19-36. Consider Corners/Splits in Q3/Q4 boundaries.";
    }

    // Case 3: Strong Below Balance
    // Indicators are significantly below balance, but not extreme. Focus on lower halves/quadrants.
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
        return "Strong Suggest: Low Halves (1-18). Strong Likeliness for Q1/Q2 activity. Consider betting on Dozen 1 or lower half of Dozen 2.";
    }

    // Case 4: Strong Above Balance
    // Indicators are significantly above balance, but not extreme. Focus on higher halves/quadrants.
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_MidHigh")) {
         return "Strong Suggest: High Halves (19-36). Strong Likeliness for Q3/Q4 activity. Consider betting on Dozen 3 or upper half of Dozen 2.";
    }

    // Case 5: Very Near Balance (The Peak of the 4x4x4x4 Sum Distribution)
    // Indicators are close to the overall balance points. Focus on the middle zones.
    if (e3Class === "E3_Medium" && e4Class === "E4_Medium") {
        return "Suggest: Near Balance. Highest Likeliness for activity in middle zones (Dozen 2/Mid Quadrants 2 & 3). Consider Splits/Corners around 17-20.";
    }

    // Case 6: Leaning High (E3 High/Avg, E4 Near/Avg)
    // Sum of Quads is high, Avg is more central. Leaning high bias.
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) {
        return "Leaning Suggest: High Quadrants (3 & 4). Likeliness leans towards 19-36 Half. Consider betting Q3/Q4 or their boundary zones.";
    }

    // Case 7: Leaning High (E3 Near/Avg, E4 High)
    // Sum of Quads is central, Avg is high. Stronger overall high bias.
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) {
        return "Leaning Suggest: High Halves (19-36). Likeliness leans towards Q3/Q4 activity. Consider betting Dozen 3.";
    }
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidHigh")) { // Added MidHigh check
        return "Leaning Suggest: High Halves (19-36). Likeliness leans towards Q3/Q4 activity. Consider betting Dozen 3.";
    }


    // Case 8: Leaning Low (E3 Low/Avg, E4 Near/Avg)
    // Sum of Quads is low, Avg is more central. Leaning low bias.
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) {
        return "Leaning Suggest: Low Quadrants (1 & 2). Likeliness leans towards 1-18 Half. Consider betting Q1/Q2 or their boundary zones.";
    }

    // Case 9: Leaning Low (E3 Near/Avg, E4 Low)
    // Sum of Quads is central, Avg is low. Stronger overall low bias.
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
        return "Leaning Suggest: Low Halves (1-18). Likeliness leans towards Q1/Q2 activity. Consider betting Dozen 1.";
    }

    // Case 10: Conflict (High E3 vs Low E4)
    // Quadrant concentration high, but overall numbers low. Strong internal conflict.
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
         return "Conflict: High Quads vs Low Avg. Indicators oppose. Focus boundary zones: Q2/Q3 border (18/19), Q1/Q4 border (9/28). Consider Splits bridging halves/quads.";
    }

    // Case 11: Conflict (Low E3 vs High E4)
    // Quadrant concentration low, but overall numbers high. Strong internal conflict.
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_High" || e4Class === "E4_High")) {
         return "Conflict: Low Quads vs High Avg. Indicators oppose. Focus boundary zones: Q2/Q3 border (18/19), Q1/Q4 border (9/28). Consider Splits bridging halves/quads.";
    }
     if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidHigh")) { // Added MidHigh check
         return "Conflict: Low Quads vs High Avg. Indicators oppose. Focus boundary zones: Q2/Q3 border (18/19), Q1/Q4 border (9/28). Consider Splits bridging halves/quads.";
    }


    // Case 12: Pattern Breakdown / Zero Edge Signal (Default if none above match)
    // This covers remaining combinations and implies a state where the indicators don't fit
    // defined patterns. This is where the base 4 '2' signal might be strongest.
    return "Pattern Breakdown: Indicators Muddled. Zero Edge Signal ACTIVE. BET Doz 2/Doz 2 - 90% majority here.";

    // Optional: Add the Zero Edge Signal Trigger - This logic needs to go *before* returning the default suggestion
    // We can add a dedicated output for this Zero Signal Status separately in the display,
    // controlled by checking if the getSuggestion function returns a string containing "Zero Edge Signal ACTIVE".
}


// --- Helper Function: Get Surrounding Numbers String (Equivalent to E5 logic) ---
function getSurroundingNumbersString(spinResult) {
    // Handle blank or invalid input early
     if (spinResult === "" || spinResult === null || typeof spinResult === 'undefined') {
        return ""; // Return blank string
    }

    // Try to parse the input number, but keep "00" as string if needed
    let numberToMatch = (spinResult === "00") ? "00" : parseFloat(spinResult);
    if (spinResult === 0) numberToMatch = 0; // Ensure 0 is treated as number 0


    // Check if input is valid (a number or "00")
     if (isNaN(numberToMatch) && numberToMatch !== "00" && numberToMatch !== 0) {
         return "Error: Invalid input type"; // Or handle this error elsewhere
     }

    try {
        // Find the position of the spin result in the wheel data (using 0-based index for JS arrays)
        // Use a loop for matching to handle strict type matching (number 0 vs string "00")
        let spinMatchIndex = -1;
        for(let i = 0; i < wheelData.length; i++) {
            if (wheelData[i] === numberToMatch) {
                spinMatchIndex = i;
                break;
            }
        }


        if (spinMatchIndex === -1) {
            // Number not found in WheelData
            return "Error: Spin not found in WheelData";
        }

        // Calculate the position of the polar opposite (0-based index)
        const oppositeMatchIndex = (spinMatchIndex + 19) % wheelSize;

        let surroundingNumbers = [];

        // Around Self (5 before, self, 5 after)
        for (let i = -5; i <= 5; i++) {
            const position = (spinMatchIndex + i + wheelData.length) % wheelData.length; // Handles wrapping, use wheelData.length
            surroundingNumbers.push(wheelData[position]);
        }

        let oppositeNumbers = [];
         // Around Opposite (5 before, opposite, 5 after)
         for (let i = -5; i <= 5; i++) {
            const position = (oppositeMatchIndex + i + wheelData.length) % wheelData.length; // Handles wrapping, use wheelData.length
            oppositeNumbers.push(wheelData[position]);
        }

        // Build the final output string
        let outputString = "| " + surroundingNumbers.join(" | ") + " | ";
        outputString += " --- | "; // The separator you found
        outputString += oppositeNumbers.join(" | ") + " |";

        return outputString;


    } catch (error) {
        // Catch any errors during calculation
        return "Calculation Error: " + error.message;
    }
}


// --- Main Update Function ---
// This function is called when the Add Spin button is clicked
function updateAnalysisDisplay() {
    // 1. Get the current value from the input box
    const currentInputValue = spinInput.value.trim(); // Use trim to remove leading/trailing spaces

    // Clear previous outputs if the input is blank - Should not happen with button, but good practice
    if (currentInputValue === "") {
        // Clear display elements
        sum4Output.textContent = "";
        avg10Output.textContent = "";
        suggestionOutput.textContent = "";
        surroundingNumbersOutput.textContent = "";
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = ""; // Clear history display
        last10QuadrantsList.textContent = ""; // Clear Q history display
        last10HalvesList.textContent = ""; // Clear H history display
        validationFeedback.textContent = ""; // Clear validation message
        return; // Stop processing
    }

     // 2. Validate and parse the input (handle "0", "00", and numbers)
    let parsedSpin;
    if (currentInputValue === "00") {
        parsedSpin = "00"; // Keep "00" as string
    } else {
       const num = parseFloat(currentInputValue);
       if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 36) { // Includes 0 in valid numbers
           // Input is not a valid number 0-36 or "00"
            validationFeedback.textContent = "Invalid input. Enter 0-36 or 00."; // Show validation error
             // Clear display elements
             sum4Output.textContent = "";
             avg10Output.textContent = "";
             suggestionOutput.textContent = "";
             surroundingNumbersOutput.textContent = "";
             lastSpinQuadrantOutput.textContent = "";
             lastSpinHalfOutput.textContent = "";
             last10SpinsList.textContent = ""; // Clear history display
             last10QuadrantsList.textContent = ""; // Clear Q history display
             last10HalvesList.textContent = ""; // Clear H history display
            return; // Stop processing
       }
       parsedSpin = num; // Valid number (0-36)
    }

    // Input is valid - clear validation feedback
    validationFeedback.textContent = "";

    // 3. Add the validated input to the history array
    // **Corrected Logic: Always push valid input**
    spinHistory.push(parsedSpin);
    // Optional: Limit history size? spinHistory = spinHistory.slice(-100); // Keep last 100


    // --- Perform Calculations based on History ---
    // Get the most recent spin from history
    const lastSpinFromHistory = spinHistory.length > 0 ? spinHistory[spinHistory.length - 1] : null;

    // Only proceed if history is not empty (redundant check with above logic, but safe)
    if (lastSpinFromHistory === null) {
         // Clear display elements
         sum4Output.textContent = "";
        avg10Output.textContent = "";
        suggestionOutput.textContent = "";
        surroundingNumbersOutput.textContent = "";
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = "";
        last10QuadrantsList.textContent = "";
        last10HalvesList.textContent = "";
        return;
    }


    // Display Last Spin Quadrant and Half for the LAST spin added
     const lastSpinQuad = getQuadrant(lastSpinFromHistory);
     lastSpinQuadrantOutput.textContent = lastSpinQuad !== null ? lastSpinQuad : "N/A";

     const lastSpinHalf = getHalf(lastSpinFromHistory);
     lastSpinHalfOutput.textContent = lastSpinHalf !== null ? lastSpinHalf : "N/A";


    // Calculate Sum of Last 4 Quadrants
    const sum4 = calculateSumLast4Quads(spinHistory);
    sum4Output.textContent = sum4 !== null ? sum4 : "N/A (<4 quads)"; // Display Sum of 4

    // Calculate Avg of Last 10 Raw Results
    const avg10 = calculateAvgLast10Raw(spinHistory);
    avg10Output.textContent = avg10 !== null ? avg10.toFixed(2) : "N/A (<10 numbers)"; // Display Avg of 10 (formatted)

    // Classify indicators
    const e3Class = classifyE3(sum4);
    const e4Class = classifyE4(avg10);

    // Get Suggestion (H1)
    const suggestion = getSuggestion(e3Class, e4Class);
    suggestionOutput.textContent = suggestion;

// Check if the suggestion contains specific phrases related to Dozen 2 (case-insensitive)
    const lowerCaseSuggestion = suggestion.toLowerCase();
    if (lowerCaseSuggestion.includes("upper half of dozen 2") || lowerCaseSuggestion.includes("dozen 2")) {
        suggestionOutput.textContent += " BET w/+ Doz 2 HERE";
    }

// Check for High/Q3/Q4 suggestion combined with Sum of 4 >= 12
    if (sum4 !== null && sum4 >= 12 &&
        (lowerCaseSuggestion.includes("high") ||
         lowerCaseSuggestion.includes("q3") ||
         lowerCaseSuggestion.includes("q4") ||
         lowerCaseSuggestion.includes("19-36") ||
         lowerCaseSuggestion.includes("dozen 3"))) {
         suggestionOutput.textContent += " SPLIT BET 1st Doz/3rd Doz HERE";
    }

// Check for the specific 17-20 split suggestion (flexible match)
    if (lowerCaseSuggestion.includes("mid quadrants 2 & 3") && lowerCaseSuggestion.includes("17-20")) {
        suggestionOutput.textContent += " THIS MEANS 7-30";
    }

// Check if Sum of Last 4 Quadrants is exactly 10
    if (sum4 !== null && sum4 === 10) {
        suggestionOutput.textContent += " !SUM Balanced!";
    }


    // --- Get & Display Surrounding Numbers for the LAST spin ---
     const surroundingString = getSurroundingNumbersString(lastSpinFromHistory);
     surroundingNumbersOutput.textContent = surroundingString;

     // --- Display History Lists ---
     // Get the last 10 spins (or fewer)
     const last10Spins = spinHistory.slice(-10);

     // Calculate Quadrants and Halves for the last 10 spins
     const last10Quads = last10Spins.map(spin => {
         const quad = getQuadrant(spin);
         // Display 0, 00, or N/A if not a 1-4 quadrant
         if (quad === 0) return 0;
         if (quad === "00") return "00";
         if (quad === null) return "N/A";
         return quad; // Return 1, 2, 3, or 4
     });

     const last10Halves = last10Spins.map(spin => {
         const half = getHalf(spin);
          // Display 0, 00, or N/A if not a 1-18/19-36 half
         if (half === 0) return 0;
         if (half === "00") return "00";
         if (half === null) return "N/A";
         return half; // Return "1-18" or "19-36"
     });


     // **Display the History Lists (Most recent FIRST)**
     // Need to reverse the slices *before* joining them for display
     const displayedSpins = last10Spins.slice().reverse(); // Create copy before reversing
     const displayedQuads = last10Quads.slice().reverse(); // Create copy before reversing
     const displayedHalves = last10Halves.slice().reverse(); // Create copy before reversing


     last10SpinsList.textContent = displayedSpins.join(", ");
     last10QuadrantsList.textContent = displayedQuads.join(", ");
     last10HalvesList.textContent = displayedHalves.join(", ");


     // Clear input field after adding to history
     spinInput.value = ""; // Clear input for next entry
     // Keep focus on input for rapid entry (optional)
     // spinInput.focus(); // This might cause issues on some mobile keyboards

}


// --- Event Listener ---
// **Trigger updateAnalysisDisplay when the Add Spin button is clicked**
addSpinButton.addEventListener('click', updateAnalysisDisplay);

// Optional: Also trigger on Enter key press in the input field
spinInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if any
        updateAnalysisDisplay(); // Trigger update
    }
});


// --- Initial Call ---
// No initial call needed as user will press button
// updateAnalysisDisplay();

/*
// Optional: Add a button to clear history
// Add button in HTML: <button id="clearHistoryButton">Clear History</button>
// **This code IS now active in the main script block provided above**
*/

// Clear History Button Listener (Active in the main script block)
clearHistoryButton.addEventListener('click', () => {
    spinHistory = [];
    spinInput.value = ""; // Clear input too
    // Clear all display elements
    sum4Output.textContent = "";
    avg10Output.textContent = "";
    suggestionOutput.textContent = "";
    surroundingNumbersOutput.textContent = "";
    lastSpinQuadrantOutput.textContent = "";
    lastSpinHalfOutput.textContent = "";
    last10SpinsList.textContent = "";
    last10QuadrantsList.textContent = "";
    last10HalvesList.textContent = "";
    validationFeedback.textContent = "";
     // spinInput.focus(); // Return focus - This might cause issues on some mobile keyboards
});


/*
// Optional: Function to save/load history to browser's local storage (more advanced)
// This allows history to persist if you close and reopen the browser page
*/