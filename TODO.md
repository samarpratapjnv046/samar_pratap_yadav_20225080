# TODO List for Implementing Fuel EU Compliance Tabs

## Backend Updates
- [x] Update /routes endpoint to filter by vesselType, fuelType, year
- [x] Update /routes/comparison to return ComparisonData[] with calculated percentDiff and compliant
- [x] Update /compliance/cb to return current CB as number
- [x] Update /compliance/adjusted-cb to return array of {shipId, adjustedCb} for the year
- [x] Update /banking/bank and /banking/apply to return ComplianceBalance and implement banking logic
- [x] Update /pools to implement pooling logic with validation rules

## Frontend Updates
- [x] Update ApiClient to add method for fetching adjusted CBs
- [x] Update PoolingTab to fetch adjusted CBs instead of manual input, display list of ships, allow selection
- [x] Update CompareTab to use calculated data from backend (if needed)
- [x] Update BankingTab to handle errors and disable properly (if needed)

## Testing and Verification
- [x] Test backend endpoints
- [x] Run frontend and verify all tabs work correctly
- [x] Handle any runtime errors

## Bug Fixes
- [x] Fix set baseline button not updating compare page - added event listener for baseline changes
- [x] Fix add new route form validation and submission
- [x] Fix CB calculations (all routes showing 0 CB due to incorrect formula)
