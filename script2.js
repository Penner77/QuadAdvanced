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
const cornerBetsOutput = document.getElementById('cornerBetsOutput'); // Get reference to the new element
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

// --- Helper Function: Calculate Avg of Last 10 Raw (Modified to include 0/00) ---
function calculateAvgLast10Raw(historyArray) {
    // Need at least 10 total spins to attempt an average of the last 10
    if (historyArray.length < 10) return null;

    const last10Spins = historyArray.slice(-10); // Get the last 10 total entries
    let sum = 0;
    let count = 0; // Count entries that contribute (0, "00", 1-36)

    // Iterate through the last 10 spins
    for (const spin of last10Spins) {
        const numberValue = parseFloat(spin); // Handles 0, 1-36

        // Check for valid numbers (0-36)
        if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 36 && typeof spin !== 'string') {
            sum += numberValue; // Add the number value (0-36)
            count++; // Count this valid number
        } else if (spin === "00") {
            // Treat "00" as 0 for the average calculation
            sum += 0;
            count++; // Count "00" as one entry in the average calculation
        }
        // Invalid input (not 0-36 or "00") is skipped and does not increment count
    }

    // Only return the average if exactly 10 entries contributed (0, "00", 1-36)
    return count === 10 ? sum / count : null;
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
        return "Strong Suggest: Low Halves (1-18). Strong Likeliness for Q1/Q2 activity. BEST Doz 1 & Doz 2";
    }

    // Case 4: Strong Above Balance
    // Indicators are significantly above balance, but not extreme. Focus on higher halves/quadrants.
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_MidHigh")) {
        return "Strong Suggest: High (19-36). Strong Likeliness for Q3/Q4. Consider Dozen 3 or upper half of Dozen 2.";
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
        return "Leaning Suggest: Low Halves (1-18). Likeliness leans towards Q1/Q2 activity. Consider betting 1st Dozen.";
    }

    // Case 10: Conflict (High E3 vs Low E4)
    // Quadrant concentration high, but overall numbers low. Strong internal conflict.
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
        return "Conflict: High Quads vs Low Avg. Indicators oppose. Focus boundary zones: Q2/Q3 border (18/19), Q1/Q4 border (9/28). Consider Splits bridging halves/quads or 7-30.";
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
        return "Pattern Breakdown: Muddled. ZERO Signal ACTIVE. Consider Doz 1/Doz 2 - 90% majority here";

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

// --- Helper Function: Parse Surrounding Numbers String into a List ---
function parseSurroundingNumbersString(surroundingString) {
    if (!surroundingString || surroundingString.includes("Error")) {
        return []; // Return empty array if string is empty or an error message
    }

    const parts = surroundingString.split(" --- ");
    if (parts.length !== 2) {
        // console.error("Unexpected surrounding string format:", surroundingString); // Optional logging
        return []; // Unexpected format
    }

    const allNumbers = [];

    parts.forEach(part => {
        // Remove leading/trailing '|' and spaces, then split by '|'
        const numberStrings = part.replace(/^\|\s*|\s*\|$/g, '').split('|');

        numberStrings.forEach(numStr => {
            const trimmedNumStr = numStr.trim();
            if (trimmedNumStr === "") return; // Skip empty strings from split

            if (trimmedNumStr === "00") {
                allNumbers.push("00"); // Keep "00" as string
            } else {
                const num = parseFloat(trimmedNumStr);
                if (!isNaN(num) && Number.isInteger(num) && num >= 0 && num <= 36) { // Add validation
                    allNumbers.push(num); // Add valid numbers (0-36)
                }
                // Invalid strings are skipped
            }
        });
    });

    return allNumbers; // Return array like [32, 15, 3, ..., "00", ..., 24]
}

// --- Helper Function: Find Corner Bets in a List of Numbers ---
function findCornerBetsInSurrounding(numbersList) {
    // Define all standard 4-number corner bets on American Roulette felt layout
    // These are numbers that meet at a single intersection point on the grid.
    const allCornerBets = [
        [1, 2, 4, 5], [2, 3, 5, 6], [4, 5, 7, 8], [5, 6, 8, 9],
        [7, 8, 10, 11], [8, 9, 11, 12], [10, 11, 13, 14], [11, 12, 14, 15],
        [13, 14, 16, 17], [14, 15, 17, 18], [16, 17, 19, 20], [17, 18, 20, 21],
        [19, 20, 22, 23], [20, 21, 23, 24], [22, 23, 25, 26], [23, 24, 26, 27],
        [25, 26, 28, 29], [26, 27, 29, 30], [28, 29, 31, 32], [29, 30, 32, 33],
        [31, 32, 34, 35], [32, 33, 35, 36],
        // Standard 4-number corner involving 0 and 00 (geometrically a square on the felt)
        [0, "00", 2, 3] // Numbers as they appear in wheelData / history
    ];

    const fullCornersFound = [];
    const partialCornersFound = []; // Store partial corners as objects { corner: [...], found: [...] }

    // Convert the input list of numbers to strings for easier comparison with "00"
    const numbersListStrings = numbersList.map(String);

    // Check each defined standard corner bet
    for (const corner of allCornerBets) {
        let foundCount = 0;
        const foundNumbersInThisCorner = [];

        // Convert corner numbers to strings for comparison
        const cornerStrings = corner.map(String);

        // Check how many numbers of the current corner bet are in the input list
        for (const cornerNumStr of cornerStrings) {
            if (numbersListStrings.includes(cornerNumStr)) {
                foundCount++;
                // Find the original number/string from the input list to add to 'found' list
                const originalFound = numbersList.find(num => String(num) === cornerNumStr);
                 if (originalFound !== undefined) {
                     foundNumbersInThisCorner.push(originalFound);
                 }
            }
        }

        if (foundCount === 4) {
            // Found all 4 numbers of this corner bet in the list
            fullCornersFound.push(corner); // Add the original corner bet array to full list
        } else if (foundCount === 3) {
            // Found exactly 3 out of 4 numbers
            // Store the original corner bet numbers AND the numbers from the list that were found
            partialCornersFound.push({
                corner: corner, // The definition of the full corner bet
                found: foundNumbersInThisCorner // The 3 numbers found from the list
            });
        }
    }

    return {
        full: fullCornersFound,
        partial: partialCornersFound
    };
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
        cornerBetsOutput.textContent = ""; // Clear new output too
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
             cornerBetsOutput.textContent = ""; // Clear new output too
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
        cornerBetsOutput.textContent = ""; // Clear new output too
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = "";
        last10QuadrantsList.textContent = ""; // Clear Q history display
        last10HalvesList.textContent = ""; // Clear H history display
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


    // Classify indicators (Needed for getSuggestion and new Heads-up logic)
    const e3Class = classifyE3(sum4);
    const e4Class = classifyE4(avg10);


// --- Determine Suggestion ---
    let finalSuggestion = ""; // Variable to hold the suggestion text

    // Check for the "Potential Correct Imminent" condition first (Sum > 11 and Avg >= 20)
    // Note: This logic was based on a previous request and can be modified based on your clarified needs.
    if (sum4 !== null && avg10 !== null && sum4 > 11 && avg10 >= 20) {
        finalSuggestion = "Potential Correct Imminent: Sum > 11, Avg >= 20. Focus High Regions!";
    } else {
        // If the imminent condition is not met, proceed with standard suggestion logic
        // Get Suggestion based on classifications
        finalSuggestion = getSuggestion(e3Class, e4Class);
    }

    // Display the determined suggestion
    suggestionOutput.textContent = finalSuggestion; // <--- Now uses finalSuggestion variable

    // Append additional messages based on conditions (from previous steps and new requests)

    // Append: BET w/+ Doz 2 HERE (from Step 2)
    const lowerCaseSuggestion = finalSuggestion.toLowerCase();
    if (lowerCaseSuggestion.includes("upper half of dozen 2") || lowerCaseSuggestion.includes("dozen 2")) {
        suggestionOutput.textContent += " BET w/+ Doz 2 HERE";
    }

    // Append: SPLIT BET 1st Doz/3rd Doz HERE (from Step 3)
    if (sum4 !== null && sum4 >= 12 &&
        (lowerCaseSuggestion.includes("high") ||
         lowerCaseSuggestion.includes("q3") ||
         lowerCaseSuggestion.includes("q4") ||
         lowerCaseSuggestion.includes("19-36") ||
         lowerCaseSuggestion.includes("dozen 3"))) {
         suggestionOutput.textContent += " SPLIT BET 1st Doz/3rd Doz HERE";
    }

    // Append: THIS MEANS 7-30 (from Step 4)
    if (lowerCaseSuggestion.includes("mid quadrants 2 & 3") && lowerCaseSuggestion.includes("17-20")) {
        suggestionOutput.textContent += " THIS MEANS 7-30";
    }

    // Append: !SUM Balanced! (from Step 5)
    if (sum4 !== null && sum4 === 10) {
        suggestionOutput.textContent += " !SUM Balanced!";
    }

    // --- Add Heads-up Reminder for Off-Balance Sum or Avg (from Step 17) ---
    let headsUpMessage = "";

    const isSumOffBalanceLow = (sum4 !== null && sum4 < 9);
    const isSumOffBalanceHigh = (sum4 !== null && sum4 > 11);
    const isAvgOffBalanceLow = (avg10 !== null && avg10 < 17);
    const isAvgOffBalanceHigh = (avg10 !== null && avg10 > 19);

    const sumStatus = isSumOffBalanceLow ? "Sum Low" : (isSumOffBalanceHigh ? "Sum High" : "");
    const avgStatus = isAvgOffBalanceLow ? "Avg Low" : (isAvgOffBalanceHigh ? "Avg High" : "");

    if (sumStatus !== "" && avgStatus !== "") {
        headsUpMessage = ` Heads-up: ${sumStatus}, ${avgStatus}!`;
    } else if (sumStatus !== "") {
        headsUpMessage = ` Heads-up: ${sumStatus}!`;
    } else if (avgStatus !== "") {
        headsUpMessage = ` Heads-up: ${avgStatus}!`;
    }

    // Append the heads-up message if created
    if (headsUpMessage !== "") {
        suggestionOutput.textContent += headsUpMessage;
    }


    // --- Get & Display Surrounding Numbers for the LAST spin ---
     const surroundingString = getSurroundingNumbersString(lastSpinFromHistory);
     surroundingNumbersOutput.textContent = surroundingString;

    // --- Find & Display Possible Corner Bets in Surrounding Numbers ---
    const surroundingNumbersList = parseSurroundingNumbersString(surroundingString);
    const cornerBetsFound = findCornerBetsInSurrounding(surroundingNumbersList); // Corrected typo

    let cornerBetsOutputText = "";
    const fullCorners = cornerBetsFound.full;
    const partialCorners = cornerBetsFound.partial;

    if (fullCorners.length > 0) {
        // Format Full Corners: (n1, n2, n3, n4) on separate lines
        cornerBetsOutputText += "Full Corner Bets:\n"; // Add heading and newline
        cornerBetsOutputText += fullCorners.map(c => `(${c.join(',')})`).join('\n'); // Join with newline
    }

    if (partialCorners.length > 0) {
        // Add separator and heading if there were full corners
        if (fullCorners.length > 0) {
            cornerBetsOutputText += "\n---\n"; // Add newline separator
        }
        // Format Partial Corners: just list the 3 found numbers on separate lines
        cornerBetsOutputText += "Partial Corner Bets (3 of 4 found):\n"; // Add heading and newline
        cornerBetsOutputText += partialCorners.map(p => {
             // Format found numbers nicely, ensure 00 is correct
            const foundNumsFormatted = p.found.map(num => typeof num === 'string' ? `"${num}"` : String(num));
            return `(${foundNumsFormatted.join(',')})`; // Only show the found numbers in parentheses
        }).join('\n'); // Join with newline
    }

    // Default message if no corners were found
    if (fullCorners.length === 0 && partialCorners.length === 0) {
        cornerBetsOutputText = "No standard corner bets found in surrounding numbers.";
    }
    cornerBetsOutput.textContent = cornerBetsOutputText;


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
    cornerBetsOutput.textContent = ""; // Clear new output too
    lastSpinQuadrantOutput.textContent = "";
    lastSpinHalfOutput.textContent = "";
    last10SpinsList.textContent = "";
    last10QuadrantsList.textContent = ""; // Clear Q history display
    last10HalvesList.textContent = ""; // Clear H history display
    validationFeedback.textContent = "";
     // spinInput.focus(); // Return focus - This might cause issues on some mobile keyboards
});


/*
// Optional: Function to save/load history to browser's local storage (more advanced)
// This allows history to persist if you close and reopen the browser page
*/
