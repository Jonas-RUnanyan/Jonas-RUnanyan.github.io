document.addEventListener("DOMContentLoaded", function () {
    var footerContainer = document.querySelector("footer");
    if (!footerContainer) return;

    var showCows = footerContainer.getAttribute("data-cows") !== "false";

    // 1. EXTRAER LA RUTA RELATIVA EXACTA
    var selfScript = document.querySelector('script[src*="footer-loader.js"]');
    var basePath = "";

    if (selfScript) {
        var src = selfScript.getAttribute("src");
        // Extrae todo lo que esté antes del nombre del archivo 'footer-loader.js'
        basePath = src.replace("footer-loader.js", "");
    }

    // 2. INYECTAR EL FOOTER
    footerContainer.outerHTML = `
        <div class="mountains"></div>
        <footer class="suelo" id="footer-campo">
            <canvas id="gridCanvas"></canvas>
            <div class="footer-overlay-text">
                <p>© 2026 Jonás Rodríguez Unanyan | <a href="mailto:jonasrodriguezunanyan@gmail.com">Contacto</a></p>
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

    // 3. CARGAR SCRIPTS E IMÁGENES CON LA RUTA CORRECTA
    // basePath vale algo como "../javascript/" o "../../javascript/"
    var jsFolder = basePath; 
    // Para las imágenes, subimos un nivel desde la carpeta javascript (reemplazamos javascript/ por images/)
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