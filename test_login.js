async function testLogin() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }) // Testing invalid credentials first
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);

    const res2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test123' }) // Testing valid credentials
    });
    console.log("Status 2:", res2.status);
    const data2 = await res2.json();
    console.log("Response 2:", data2);
  } catch (err) {
    console.error("Error:", err);
  }
}

testLogin();
