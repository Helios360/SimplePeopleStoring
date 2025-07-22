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
      <div class="user" data-user-id="${user.id}">
      <span><a href="/profile?email=${encodeURIComponent(user.email)}"><p>${user.name}</p><p>${user.fname}</p></a></span>
      <span><p>${user.city}</p><p>${user.postal}</p></span>
        <span>
            <select class="status-select" data-user-id="${user.id}">
                <option value="0" ${user.status == 0 ? 'selected' : ''}>Archive</option>
                <option value="1" ${user.status == 1 ? 'selected' : ''}>En recherche</option>
                <option value="2" ${user.status == 2 ? 'selected' : ''}>Recherche active</option>
            </select>
        </span>
        <span><p class="creationDate">${user.date_inscription.match(/^\d{4}-\d{2}-\d{2}/)}</p></span>
      </div>
      `;
    });
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', event => {
        const newStatus = event.target.value;
        const userId = event.target.getAttribute('data-user-id');

        fetch('/api/admin/update-status', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: userId,
            status: newStatus
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log(`Status updated for user ${userId}`);
          } else {
            throw new Error(data.message);
          }
        })
        .catch(err => {
          console.error(`Failed to update status for user ${userId}:`, err);
          alert("Erreur lors de la mise à jour du statut.");
        });
      });
    });
  }
})
.catch(err => {
  console.error('Error fetching users:', err);
});

document.addEventListener('click', (e) => {
  const target = e.target.closest('#name-fname');
  if (target) {
    console.log('click via delegation');
    // tri ici
  }
});
