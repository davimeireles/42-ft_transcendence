// filepath: /home/dmeireles/projects/42-ft_transcendence/frontend/js/language-switcher.js
document.addEventListener("DOMContentLoaded", () => {
    const languageSwitcher = document.getElementById("language-switcher");

    // Load the selected language from localStorage or default to 'en'
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    languageSwitcher.value = selectedLanguage;
    loadLanguage(selectedLanguage).then((translations) => {
        applyTranslations(translations);
    });

    languageSwitcher.addEventListener("change", (event) => {
        const selectedLanguage = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLanguage);
        loadLanguage(selectedLanguage).then((translations) => {
            applyTranslations(translations);
        });
    });
});

async function loadLanguage(lang) {
    return fetch(`json/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                return fetch('json/en.json');
            }
            return response.json();
        })
        .then(data => data)
        .catch(error => console.error('Error loading language file:', error));
}

function applyTranslations(translations) {
    document.querySelectorAll("[data-translate-key]").forEach(element => {
        const key = element.getAttribute("data-translate-key");
        if (translations[key]) {
            // Replace only the text content, preserving HTML structure
            element.innerHTML = element.innerHTML.replace(
                new RegExp(element.textContent.trim(), "g"),
                translations[key]
            );
        }
    });
}