import { calculateDistanceKm, evaluateCoverage, POPULAR_LOCALITIES, ASHOK_RAJ_BRANCHES } from '../frontend/mobile/store/useLocationStore';

console.log('--- Testing Delivery Coverage Calculations ---');

// 1. Madurai Anna Nagar location
const maduraiLoc = POPULAR_LOCALITIES.find(p => p.area === 'Anna Nagar');
if (maduraiLoc) {
  const cov1 = evaluateCoverage(maduraiLoc.latitude, maduraiLoc.longitude, maduraiLoc.city);
  console.log('1. Anna Nagar, Madurai coverage:', {
    isDeliverable: cov1.isDeliverable,
    distanceKm: cov1.distanceKm,
    estimatedMinutes: cov1.estimatedMinutes,
    message: cov1.message,
    deliveryFee: cov1.deliveryFee,
  });
}

// 2. Kalaiyarkoil Town location
const kalaiyarLoc = POPULAR_LOCALITIES.find(p => p.area === 'Kalaiyarkoil');
if (kalaiyarLoc) {
  const cov2 = evaluateCoverage(kalaiyarLoc.latitude, kalaiyarLoc.longitude, kalaiyarLoc.city);
  console.log('2. Kalaiyarkoil Town coverage:', {
    isDeliverable: cov2.isDeliverable,
    distanceKm: cov2.distanceKm,
    estimatedMinutes: cov2.estimatedMinutes,
    message: cov2.message,
    deliveryFee: cov2.deliveryFee,
  });
}

// 3. Far away location (>50km away, e.g. Dindigul / Trichy)
const distantLat = 10.3673; // Dindigul
const distantLon = 77.9803;
const cov3 = evaluateCoverage(distantLat, distantLon, 'Dindigul');
console.log('3. Distant location (Dindigul) coverage:', {
  isDeliverable: cov3.isDeliverable,
  distanceKm: cov3.distanceKm,
  estimatedMinutes: cov3.estimatedMinutes,
  message: cov3.message,
});

console.log('\n--- Location Coverage Tests Completed Successfully ---');
