const CV = document.getElementById('cv');
const PI = document.getElementById('pi');
const tag = document.getElementById('add_tags');
const skills = document.getElementById('add_skills');
const cv_frame = document.getElementById('cv_frame');

const skillTypes = {
  // Languages
  'C': 'language',
  'C++': 'language',
  'Java': 'language',
  'JavaScript': 'language',
  'TypeScript': 'language',
  'Python': 'language',
  'Ruby': 'language',
  'Go': 'language',
  'Rust': 'language',
  'PHP': 'language',
  'Swift': 'language',
  'Kotlin': 'language',
  'Scala': 'language',
  'Dart': 'language',
  'R': 'language',
  'Bash': 'language',
  'Perl': 'language',

  // Frontend
  'HTML': 'frontend',
  'CSS': 'frontend',
  'React': 'frontend',
  'Vue.js': 'frontend',
  'Angular': 'frontend',
  'Svelte': 'frontend',
  'Next.js': 'frontend',
  'Gatsby': 'frontend',
  'Tailwind CSS': 'frontend',
  'Bootstrap': 'frontend',
  'jQuery': 'frontend',

  // Backend
  'Node.js': 'backend',
  'Express.js': 'backend',
  'Django': 'backend',
  'Flask': 'backend',
  'Ruby on Rails': 'backend',
  'Spring Boot': 'backend',
  'Laravel': 'backend',
  'ASP.NET': 'backend',
  'Koa.js': 'backend',
  'FastAPI': 'backend',
  'NestJS': 'backend',

  // Databases
  'PostgreSQL': 'database',
  'MySQL': 'database',
  'SQLite': 'database',
  'MongoDB': 'database',
  'Redis': 'database',
  'Firebase': 'database',
  'Cassandra': 'database',
  'MariaDB': 'database',
  'OracleDB': 'database',
  'DynamoDB': 'database',

  // DevOps / Tools
  'Docker': 'devops',
  'Kubernetes': 'devops',
  'Git': 'devops',
  'GitHub Actions': 'devops',
  'Jenkins': 'devops',
  'Terraform': 'devops',
  'Ansible': 'devops',
  'Nginx': 'devops',
  'Apache': 'devops',
  'AWS': 'devops',
  'Azure': 'devops',
  'GCP': 'devops',
  'Linux': 'devops',
  'CI/CD': 'devops',

  // Testing
  'Jest': 'testing',
  'Mocha': 'testing',
  'Chai': 'testing',
  'JUnit': 'testing',
  'Cypress': 'testing',
  'Selenium': 'testing',
  'PyTest': 'testing',
  'RSpec': 'testing',

  // Mobile
  'React Native': 'mobile',
  'Flutter': 'mobile',
  'SwiftUI': 'mobile',
  'Xamarin': 'mobile',

  // Other
  'GraphQL': 'other',
  'REST API': 'other',
  'Webpack': 'other',
  'Vite': 'other',
  'ESLint': 'other',
  'Prettier': 'other',
  'Storybook': 'other'
};


const typeColors = {
  language: '#43a4b1ff',
  frontend: '#66bd6dff',
  backend: '#f07ee8ff',
  database: '#ee6060ff',
  devops: '#f3b63aff',
  testing: '#9d8dfcff',
  mobile: '#50c5b7ff',
  other: '#b0bec5ff',
  unknown: 'transparent'
};


fetch('/api/profile', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
})
.then(res => res.json())
.then(data => {
if (data.success) {
    const user = data.user;
    // Remplir les infos
    document.getElementById('NomPrenom').textContent = user.name + " " + user.fname;
    document.getElementById('email').textContent += user.email;
    document.getElementById('tel').textContent += user.tel;

    const dateOnly = user.birth.split("T")[0].replace(/-/g, "/");
    const birthDate = new Date(user.birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    document.getElementById('birthday').textContent = "Né le : " + dateOnly + " | " + age + " ans";
    document.getElementById('city').textContent += user.city + ", " + user.postal;
    document.getElementById('addr').textContent += user.addr;
    const cvUrl = '/uploads/' + user.cv;
        fetch(cvUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
            })
        .then(response => {
            if (!response.ok) throw new Error("Accès refusé au CV");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            document.getElementById('cv-frame').src = url;
        })
        .catch(err => {
            console.error(err);
            alert("Impossible de charger le CV.");
        });
        cv.style.backgroundColor = "var(--secondary)";
        cv.style.color = "var(--primary)";
        pi.style.backgroundColor = "var(--primary)";
        pi.style.color = "var(--secondary)";
    cv.addEventListener('click', function (){ // charger le cv
        const cvUrl = '/uploads/' + user.cv;
        fetch(cvUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
            })
        .then(response => {
            if (!response.ok) throw new Error("Accès refusé au CV");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            document.getElementById('cv-frame').src = url;
        })
        .catch(err => {
            console.error(err);
            alert("Impossible de charger le CV.");
        });
        cv.style.backgroundColor = "var(--secondary)";
        cv.style.color = "var(--primary)";
        pi.style.backgroundColor = "var(--primary)";
        pi.style.color = "var(--secondary)";
    });
    
    pi.addEventListener('click', function (){ // charger la pi
        const cvUrl = '/uploads/' + user.id_doc;
        fetch(cvUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
            })
        .then(response => {
            if (!response.ok) throw new Error("Accès refusé a la pièce d'id");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            document.getElementById('cv-frame').src = url;
        })
        .catch(err => {
            console.error(err);
            alert("Impossible de charger la PI.");
        });
        cv.style.backgroundColor = "var(--primary)";
        cv.style.color = "var(--secondary)";
        pi.style.backgroundColor = "var(--secondary)";
        pi.style.color = "var(--primary)";
    });
    let currentTags = Array.isArray(user.tags) ? user.tags : JSON.parse(user.tags || '[]');
    let currentSkills = Array.isArray(user.skills) ? user.skills : JSON.parse(user.skills || '[]');

    function updateTagsAndSkills() {
        fetch('/api/update-tags', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tags: currentTags,
                skills: currentSkills
            })
        })
        .then(res => res.json())
        .then(result => {
            if (!result.success) throw new Error(result.message);
        })
        .catch(err => {
            console.error("Failed to update tags/skills", err);
            alert("Erreur lors de la mise à jour des tags/skills");
        });

        // Mise à jour des tags/skills affichés
        const tagList = document.getElementById('tags');
        const skillList = document.getElementById('skills');

        tagList.innerHTML = '';
        skillList.innerHTML = '';

        currentTags.forEach(t => {
            const span = document.createElement('span');
            span.textContent = t;
            let confirming = false;

            span.onmouseenter = () => {
                if (!confirming) {
                    span.style.textDecoration = 'line-through';
                }
            };
            span.onmouseleave = () => {
                span.style.textDecoration = 'none';
                if (confirming) {
                    span.textContent = t;
                    span.style.color = 'var(--secondary)';
                    confirming = false;
                }
            };
            span.onclick = () => {
                if (!confirming) {
                    span.textContent += ' ?';
                    span.style.color = 'red';
                    confirming = true;
                } else {
                    currentTags = currentTags.filter(tag => tag !== t);
                    updateTagsAndSkills();
                }
            };
            tagList.appendChild(span);
        });

        currentSkills.forEach(s => {
            const span = document.createElement('span');
            span.textContent = s;
            const type = skillTypes[s] || 'unknown';
            const bgColor = typeColors[type];
            span.style.backgroundColor = bgColor;
            let confirming = false;

            span.onmouseenter = () => {
                if (!confirming) {
                    span.style.textDecoration = 'line-through';
                }
            };
            span.onmouseleave = () => {
                span.style.textDecoration = 'none';
                if (confirming) {
                    span.textContent = s;
                    span.style.color = 'var(--secondary)';
                    confirming = false;
                }
            };
            span.onclick = () => {
                if (!confirming) {
                    span.textContent += ' ?';
                    span.style.color = 'red';
                    confirming = true;
                } else {
                    currentSkills = currentSkills.filter(tag => tag !== s);
                    updateTagsAndSkills();
                }
            };
            skillList.appendChild(span);
        });
    }

    updateTagsAndSkills()
    const tagInput = document.getElementById('add_tags');
    const skillInput = document.getElementById('add_skills');

    // When tag input loses focus or user presses Enter
    tagInput.addEventListener('change', () => {
    const tag = tagInput.value.trim();
    if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        updateTagsAndSkills();
    }
    tagInput.value = '';
    });

    // When skill input loses focus or user presses Enter
    skillInput.addEventListener('change', () => {
    const skill = skillInput.value.trim();
    if (skill && !currentSkills.includes(skill)) {
        currentSkills.push(skill);
        updateTagsAndSkills();
    }
    skillInput.value = '';
    });
    } else {
        alert('Non autorisé');
        window.location.href = '/signin';
    }
})
.catch(err => {
    console.error(err);
    alert("Erreur lors de la récupération du profil");
    window.location.href = '/signin';
});