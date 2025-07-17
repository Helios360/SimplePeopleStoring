document.getElementById('sub').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    document.cookie = `token=${data.token}; path=/; SameSite=Strict`; // rajouter "Secure;" pour https
    window.location.href = '/profile';
  } else {
    alert(data.message || 'Login failed');
  }
});