const button = document.getElementById('toggle-theme');
let themeSwapped = false;

button.addEventListener('click', () => {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue('--primary');
    const secondary = getComputedStyle(root).getPropertyValue('--secondary');

    if (!themeSwapped) {
        root.style.setProperty('--primary', secondary);
        root.style.setProperty('--secondary', primary);
    } else {
        // Reset to original
        root.style.setProperty('--primary', '#F1F4F4');
        root.style.setProperty('--secondary', '#141414');
    }

    themeSwapped = !themeSwapped;
});
