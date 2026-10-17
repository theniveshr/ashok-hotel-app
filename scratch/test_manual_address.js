async function testManualAddress() {
  const payload = {
    address: '1/602(13), Vasantham Nagar, Kalaiyarkoil',
    pincode: '630551',
  };

  const res = await fetch('http://localhost:3001/api/v1/customer/delivery/check-coverage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('Result for manual address in Kalaiyarkoil:');
  console.log(JSON.stringify(data, null, 2));
}

testManualAddress();
