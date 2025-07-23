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

const allUsers = [];
function renderUser (users) {
  const list = document.getElementById('list');
  list.innerHTML='';
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

          const userToUpdate = allUsers.find(user => user.id == userId);
          if (userToUpdate) {
            userToUpdate.status = parseInt(newStatus, 10);
          }
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
function sortUsers(by, ascending = true) {
  const sorted = [...allUsers];
  sorted.sort((a, b) => {
    let valA = a[by];
    let valB = b[by];

    // Normalize for string or date
    if (by === 'date_inscription') {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  renderUser(sorted);
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
    allUsers.push(...users);
    renderUser(users);
    attachFormListeners();
    document.addEventListener('click', (e) => {
      const wrapper = e.target.closest('#name-fname');
      if (wrapper) {
      const clickedSvg = wrapper.querySelector('svg');
      document.querySelectorAll('#name-fname svg, #localisation svg, #status svg, #creation-date svg')
        .forEach(svg => {
          if (svg !== clickedSvg) {
            svg.classList.remove('rotated');
            svg.classList.add('unrotate');
          }
        });
        if (clickedSvg) {
          const isRotated = clickedSvg.classList.contains('rotated');
          if(isRotated == false) {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("name",true);
          } else {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("name",false);
          }
        }
      }
    });
    document.addEventListener('click', (e) => {
      const wrapper = e.target.closest('#localisation');
      if (wrapper) {
        const clickedSvg = wrapper.querySelector('svg');
        document.querySelectorAll('#name-fname svg, #localisation svg, #status svg, #creation-date svg')
          .forEach(svg => {
            if (svg !== clickedSvg) {
              svg.classList.remove('rotated');
              svg.classList.add('unrotate');
            }
          });

        if (clickedSvg) {
          const isRotated = clickedSvg.classList.contains('rotated');
          if(isRotated == false) {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("localisation",true);
          } else {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("localisation",false);
          }
        }
      }
    });
    document.addEventListener('click', (e) => {
      const wrapper = e.target.closest('#status');
      if (wrapper) {
        const clickedSvg = wrapper.querySelector('svg');
        document.querySelectorAll('#name-fname svg, #localisation svg, #status svg, #creation-date svg')
          .forEach(svg => {
            if (svg !== clickedSvg) {
              svg.classList.remove('rotated');
              svg.classList.add('unrotate');
            }
          });

        if (clickedSvg) {
          const isRotated = clickedSvg.classList.contains('rotated');
          if(isRotated == false) {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("status",true);
          } else {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("status",false);
          }
        }
      }
    });
    document.addEventListener('click', (e) => {
      const wrapper = e.target.closest('#creation-date');
      if (wrapper) {
        const clickedSvg = wrapper.querySelector('svg');
        document.querySelectorAll('#name-fname svg, #localisation svg, #status svg, #creation-date svg')
          .forEach(svg => {
            if (svg !== clickedSvg) {
              svg.classList.remove('rotated');
              svg.classList.add('unrotate');
            }
          });

        if (clickedSvg) {
          const isRotated = clickedSvg.classList.contains('rotated');
          if(isRotated == false) {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("date_inscription",true);
          } else {
            clickedSvg.classList.toggle('rotated', !isRotated);
            clickedSvg.classList.toggle('unrotate', isRotated);
            sortUsers("date_inscription",false);
          }
        }
      }
    });
  }
})
.catch(err => {
  console.error('Error fetching users:', err);
});

function filterUsers() {
  const nameValue = document.getElementById('nomPrenom').value.toLowerCase();
  const statusValue = document.getElementById('searchStatus').value;
  const placeValue = document.getElementById('place').value.toLowerCase();
  const ageValue = document.getElementById('age').value;
  const trancheValue = document.getElementById('trancheAge').value;
  const tagsValue = document.getElementById('tags').value.toLowerCase();
  const aiSearchValue = document.getElementById('aiSearch').value.toLowerCase();
  
  
  const filtered = allUsers.filter(user => {
    // Calculate age
    const birthDate = new Date(user.birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    const fullName = `${user.name} ${user.fname}`.toLowerCase();
    const matchName = nameValue === '' || fullName.includes(nameValue);
    const matchStatus = statusValue === '' || user.status.toString() === statusValue;
    const matchPlace = placeValue === '' || user.city?.toLowerCase().includes(placeValue);
    const matchAge = ageValue === '' || age === parseInt(ageValue);
    const matchTranche = trancheValue === '' || (
      age >= parseInt(trancheValue.slice(0,2)) &&
      age <= parseInt(trancheValue.slice(2))
    );
    const matchTags = tagsValue === '' || (user.tags || []).some(tag => tag.toLowerCase().includes(tagsValue));
    const matchAI = aiSearchValue === '' || JSON.stringify(user).toLowerCase().includes(aiSearchValue); // simple AI full-text

    return matchName && matchStatus && matchPlace && matchAge && matchTranche && matchTags && matchAI;
  });

  renderUser(filtered);
}

function attachFormListeners() {
  const form = document.getElementById('search-form');
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', filterUsers);
    field.addEventListener('change', filterUsers);
  });
}
function refreshUserList() {
  fetch('/api/admin-panel', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      allUsers.length = 0; // Vider l'ancien tableau
      allUsers.push(...data.users); // Remplir avec les vraies données
      renderUser(data.users);
    }
  })
  .catch(err => {
    console.error('Erreur lors du refresh:', err);
  });
}
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log("Retour depuis le cache détecté, rechargement forcé.");
    window.location.reload();
  }
});
