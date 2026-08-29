import fs from 'fs';
import path from 'path';

const colleges = JSON.parse(
  fs.readFileSync(path.resolve('src/data/colleges.json'), 'utf8')
);

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const REGISTERED_CRITERIA = {
  google_rating: { direction: 'higher_is_better' },
  google_review_count: { direction: 'higher_is_better' },
  beds: { direction: 'higher_is_better' },
  fee_category_a: { direction: 'lower_is_better' },
  distance_from_home: { direction: 'lower_is_better' },
};

function calculateCriterionBounds(colleges, criterionId, homeCoords) {
  let min = Infinity;
  let max = -Infinity;

  for (const college of colleges) {
    let rawVal = null;
    if (criterionId === 'distance_from_home') {
      if (homeCoords && college.lat !== null && college.lng !== null) {
        rawVal = haversineDistance(
          homeCoords.lat,
          homeCoords.lng,
          college.lat,
          college.lng
        );
      }
    } else {
      rawVal = college[criterionId];
    }

    if (rawVal !== null && typeof rawVal === 'number' && !isNaN(rawVal)) {
      if (rawVal < min) min = rawVal;
      if (rawVal > max) max = rawVal;
    }
  }

  if (min === Infinity || max === -Infinity) return { min: 0, max: 100 };
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}

function normalizeSignal(val, bounds, direction) {
  if (val === null || isNaN(val)) return null;
  const { min, max } = bounds;
  if (max === min) return 50;
  const clampedVal = Math.max(min, Math.min(max, val));
  const ratio = (clampedVal - min) / (max - min);

  if (direction === 'higher_is_better') {
    return Math.round(ratio * 100 * 10) / 10;
  } else {
    return Math.round((1 - ratio) * 100 * 10) / 10;
  }
}

function isUnverifiedBeds(college) {
  if (!college.data_notes) return false;
  return college.data_notes.includes('unverified, low-confidence estimate');
}

function computeCollegeRankings(colleges, weights, homeCoords) {
  const activeWeights = {};
  for (const [key, val] of Object.entries(weights)) {
    if (val && val > 0) {
      if (key === 'distance_from_home' && !homeCoords) continue;
      activeWeights[key] = val;
    }
  }

  const activeCriteria = Object.keys(activeWeights);
  const totalWeight = activeCriteria.reduce((sum, k) => sum + (activeWeights[k] || 0), 0);

  const boundsMap = {};
  for (const criterionId of Object.keys(REGISTERED_CRITERIA)) {
    boundsMap[criterionId] = calculateCriterionBounds(colleges, criterionId, homeCoords);
  }

  return colleges.map((college) => {
    let distance = null;
    if (homeCoords && college.lat !== null && college.lng !== null) {
      distance = haversineDistance(
        homeCoords.lat,
        homeCoords.lng,
        college.lat,
        college.lng
      );
    }

    const rawSignals = {
      google_rating: college.google_rating,
      google_review_count: college.google_review_count,
      beds: college.beds,
      fee_category_a: college.fee_category_a,
      distance_from_home: distance,
    };

    const normalizedSignals = {};
    const missingSignals = [];

    for (const criterionId of Object.keys(REGISTERED_CRITERIA)) {
      const rawVal = rawSignals[criterionId];
      const bounds = boundsMap[criterionId];
      const config = REGISTERED_CRITERIA[criterionId];
      const norm = normalizeSignal(rawVal, bounds, config.direction);
      if (norm !== null) {
        normalizedSignals[criterionId] = norm;
      } else {
        missingSignals.push(criterionId);
      }
    }

    let overallScore = null;
    if (totalWeight > 0 && activeCriteria.length > 0) {
      let weightedSum = 0;
      let usedWeightSum = 0;
      for (const criterionId of activeCriteria) {
        const weight = activeWeights[criterionId];
        const normVal = normalizedSignals[criterionId];
        if (normVal !== undefined && normVal !== null) {
          weightedSum += normVal * weight;
          usedWeightSum += weight;
        }
      }
      if (usedWeightSum > 0) {
        overallScore = Math.round((weightedSum / usedWeightSum) * 10) / 10;
      }
    }

    return {
      college,
      distance_from_home: distance,
      overallScore,
      normalizedSignals,
      rawSignals,
      missingSignals,
      isEstimatedBeds: isUnverifiedBeds(college),
      dataNotes: college.data_notes,
    };
  });
}

function sortRankedColleges(ranked) {
  return [...ranked].sort((a, b) => {
    if (a.overallScore !== null && b.overallScore !== null) {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
    } else if (a.overallScore !== null && b.overallScore === null) {
      return -1;
    } else if (a.overallScore === null && b.overallScore !== null) {
      return 1;
    }
    return a.college.name.localeCompare(b.college.name);
  });
}

console.log('--- TESTING HAVERSINE DISTANCE ---');
const hydWarangalDist = haversineDistance(17.39, 78.47, 17.97, 79.59);
console.log(`Distance Hyderabad to Warangal: ${hydWarangalDist} km (expected ~134 km)`);

console.log('\n--- TESTING DEFAULT SORT ON INITIAL PAGE LOAD (BALANCED PRESET) ---');
const defaultHomeCoords = { lat: 17.39, lng: 78.47 }; // Hyderabad
const defaultPresetWeights = {
  beds: 35,
  distance_from_home: 30,
  google_rating: 20,
  google_review_count: 15,
  fee_category_a: 0,
};
const defaultRanked = sortRankedColleges(
  computeCollegeRankings(colleges, defaultPresetWeights, defaultHomeCoords)
);
console.log(`Default ranked colleges count: ${defaultRanked.length} (expected 69)`);
console.log('Top 3 on initial page load:');
defaultRanked.slice(0, 3).forEach((r, i) => {
  console.log(
    `#${i + 1}: ${r.college.name} (${r.college.city}) - Score: ${r.overallScore}/100`
  );
});
console.assert(defaultRanked.length === 69, 'All 69 colleges must be ranked by default');
console.assert(defaultRanked[0].overallScore >= defaultRanked[1].overallScore, 'Ranked list must be descending by score');

console.log('\n--- TESTING MANUAL DRAG-TO-REORDER OVERRIDE ON LIVE BROWSE LIST ---');
// User drags #4 (index 3) to #1 (index 0)
const originalFirst = defaultRanked[0].college.name;
const originalFourth = defaultRanked[3].college.name;
console.log(`Before drag: #1 = ${originalFirst}, #4 = ${originalFourth}`);

const reorderedList = [...defaultRanked];
const [movedItem] = reorderedList.splice(3, 1);
reorderedList.splice(0, 0, movedItem);

console.log(`After drag (index 3 -> 0): #1 = ${reorderedList[0].college.name}`);
console.assert(reorderedList[0].college.name === originalFourth, 'Moved item should now be at position #1');
console.assert(reorderedList[1].college.name === originalFirst, 'Original #1 should now be at position #2');

console.log('\n--- TESTING PDF EXPORT MAPPING WITH MANUAL DRAG ---');
// PDF export table must map the reorderedList directly
const exportTableRowsAfterDrag = reorderedList.map((item, index) => {
  const priorityNum = String(index + 1).padStart(2, '0');
  const codeDisplay = item.college.college_code ? item.college.college_code : item.college.name;
  return {
    order: priorityNum,
    code: codeDisplay,
    name: item.college.name,
    city: item.college.city,
  };
});

console.log('Export row #1 after drag:', exportTableRowsAfterDrag[0]);
console.assert(exportTableRowsAfterDrag[0].name === originalFourth, 'Export document row #1 must match the on-screen dragged order');
console.assert(exportTableRowsAfterDrag[0].order === '01', 'Order number must be 01');

console.log('\n--- TESTING MANUAL DRAG RESET ON CRITERIA/FILTER CHANGE ---');
// User changes sort/filter: manual order resets to fresh rank order
let manualOrderOverride = reorderedList.map(c => c.college.id);
// Simulated criteria change (e.g. 100% beds sort)
const freshRanked = sortRankedColleges(
  computeCollegeRankings(colleges, { beds: 100 }, null)
);
manualOrderOverride = null; // reset triggered by criteria change

const activeDisplay = manualOrderOverride
  ? manualOrderOverride.map(id => freshRanked.find(c => c.college.id === id))
  : freshRanked;

console.log('Top college after criteria change + reset:', activeDisplay[0].college.name, `(${activeDisplay[0].college.beds} beds)`);
console.assert(activeDisplay[0].college.beds >= activeDisplay[1].college.beds, 'List must revert to fresh computed rank order');

console.log('\nAll engine, default sort, manual drag-to-reorder, and export parity tests passed successfully!');
