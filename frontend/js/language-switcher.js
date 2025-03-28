// filepath: /home/dmeireles/projects/42-ft_transcendence/frontend/js/language-switcher.js

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const lang = this.dataset.lang;
            localStorage.setItem('selectedLanguage', lang);
            loadLanguage(lang).then((translations) => {
                applyTranslations(translations);
            });
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
                element.innerHTML = element.innerHTML.replace(
                    new RegExp(element.textContent.trim(), "g"),
                    translations[key]
                );
            }
        });
    }