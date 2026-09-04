document.addEventListener("DOMContentLoaded", function () {
    var footerContainer = document.querySelector("footer");
    if (!footerContainer) return;

    var showCows = footerContainer.getAttribute("data-cows") !== "false";

    // 1. DETECTAR IDIOMA Y DEFINIR TEXTOS
    var lang = (document.documentElement.lang || "es").toLowerCase().substring(0, 2);
    
    var translations = {
        es: { contact: "Contacto" },
        en: { contact: "Contact" }
    };

    // Si el idioma no está en la lista, usa español por defecto
    var t = translations[lang] || translations.es;

    // 2. EXTRAER LA RUTA RELATIVA EXACTA
    var selfScript = document.querySelector('script[src*="footer-loader.js"]');
    var basePath = "";

    if (selfScript) {
        var src = selfScript.getAttribute("src");
        basePath = src.replace("footer-loader.js", "");
    }

    // 3. INYECTAR EL FOOTER CON EL TEXTO TRADUCIDO
    footerContainer.outerHTML = `
        <div class="mountains"></div>
        <footer class="suelo" id="footer-campo">
            <canvas id="gridCanvas"></canvas>
            <div class="footer-overlay-text">
                <p>© 2026 Jonás Rodríguez Unanyan | <a href="mailto:jonasrodriguezunanyan@gmail.com">${t.contact}</a></p>
            </div>
        </footer>
    `;

    function loadScript(src, attributes = {}) {
        var s = document.createElement("script");
        s.src = src;
        for (var key in attributes) {
            s.setAttribute(key, attributes[key]);
        }
        document.body.appendChild(s);
    }

    // 4. CARGAR SCRIPTS E IMÁGENES CON LA RUTA CORRECTA
    var jsFolder = basePath; 
    var imgFolder = basePath.replace("javascript/", "images/");

    if (showCows) {
        loadScript(jsFolder + "cow-abduction.js", {
            "data-target": "footer-campo",
            "data-cow-src": imgFolder + "vaca.gif",
            "data-ufo-src": imgFolder + "ovni.gif"
        });
    }

    loadScript(jsFolder + "grid.js");
    loadScript(jsFolder + "lightbox.js");
});