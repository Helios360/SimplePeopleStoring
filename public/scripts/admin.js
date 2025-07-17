const token = localStorage.getItem('token');
if (token) {
  fetch('/admin-panel', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.text())
  .catch(err => console.error('Erreur admin fetch:', err));
}
fetch('/api/admin-panel', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    const users = data.users;
    const list = document.getElementById('list');
    users.forEach(user => {
      list.innerHTML+=`
      <div class="user">
        <span><p id="name">${user.name}</p><p id="fname">${user.fname}</p></span>
        <span><p id="city">${user.city}</p><p id="postal">${user.postal}</p></span>
        <span>
            <select id="${user.id}">
                <option value="" disabled selected hidden>${user.status}</option>
                <option value="Archive">Archive</option>
                <option value="En recherche">En recherche</option>
                <option value="En recherche active">Recherche active</option>
            </select>
        </span>
        <span><p id="creationDate">${user.date_inscription.match(/^\d{4}-\d{2}-\d{2}/)}</p></span>
      </div>
      `;
    });
  }
})
.catch(err => {
  console.error('Error fetching users:', err);
});