async function testEndpoint() {
  const cases = [
    {
      name: 'Kalaiyarkoil Town Core (Near hotel ~0.3 km)',
      payload: { lat: 9.8491, lng: 78.6366, address: 'Kalaiyarkoil Town' },
    },
    {
      name: 'Sivagangai Highway (~17 km from hotel)',
      payload: { lat: 9.8433, lng: 78.4809, address: 'Sivagangai Bus Stand' },
    },
    {
      name: 'Madurai (~60 km from hotel - outside coverage)',
      payload: { lat: 9.9252, lng: 78.1198, address: 'Simmakkal, Madurai' },
    },
    {
      name: 'No coordinates',
      payload: { address: 'Somewhere without GPS' },
    },
  ];

  for (const c of cases) {
    console.log(`\n=== Testing: ${c.name} ===`);
    try {
      const res = await fetch('http://localhost:3001/api/v1/customer/delivery/check-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c.payload),
      });
      const data = await res.json();
      console.log('Status code:', res.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Request failed:', err.message);
    }
  }
}

testEndpoint();
