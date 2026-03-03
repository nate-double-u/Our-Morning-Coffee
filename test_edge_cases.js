const { getSitesToOpen, normalizeSiteLists, getDayKey } = require('./shared/site-lists');

console.log('=== Testing Edge Cases ===\n');

// Test 1: What happens with invalid dayIndex values?
console.log('Test 1: Invalid dayIndex values');
console.log('getSitesToOpen with dayIndex=7:', getSitesToOpen({everyday: ['a.com']}, 7));
console.log('getSitesToOpen with dayIndex=-1:', getSitesToOpen({everyday: ['a.com']}, -1));
console.log('getSitesToOpen with dayIndex=100:', getSitesToOpen({everyday: ['a.com']}, 100));
console.log('getDayKey(7):', getDayKey(7));
console.log('getDayKey(-1):', getDayKey(-1));
console.log('');

// Test 2: What happens with null/undefined siteLists?
console.log('Test 2: Null/undefined siteLists');
console.log('getSitesToOpen(null, 1):', getSitesToOpen(null, 1));
console.log('getSitesToOpen(undefined, 1):', getSitesToOpen(undefined, 1));
console.log('');

// Test 3: Site lists with non-string values
console.log('Test 3: Invalid site URLs in lists');
const invalidData = {
  everyday: [123, null, 'https://valid.com', undefined, true],
  monday: ['https://a.com']
};
console.log('Input:', invalidData);
console.log('getSitesToOpen result:', getSitesToOpen(invalidData, 1));
console.log('');

// Test 4: Duplicate handling across categories
console.log('Test 4: Deduplication behavior');
const withDupes = {
  everyday: ['a', 'b', 'a'],
  weekdays: ['b', 'c', 'b'],
  monday: ['c', 'd']
};
console.log('Input with duplicates:', withDupes);
console.log('Output (should dedupe):', getSitesToOpen(withDupes, 1));
console.log('');

// Test 5: Empty string URLs
console.log('Test 5: Empty strings');
const withEmpty = {
  everyday: ['', 'https://valid.com', '   ']
};
console.log('Input with empty strings:', withEmpty);
console.log('Output:', getSitesToOpen(withEmpty, 1));
