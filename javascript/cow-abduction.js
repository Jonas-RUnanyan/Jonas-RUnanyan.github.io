/*
 * cow-abduction.js
 * ---------------------------------------------------------------
 * Widget autoinicializable: vacas caminando en bucle (gif real) que
 * de vez en cuando son abducidas por un ovni que entra por un lateral.
 *
 * USO MÍNIMO
 * Pega esto donde quieras que aparezca el campo de vacas:
 *
 *   <script src="js/cow-abduction.js"
 *           data-cow-src="images/vaca.gif"
 *           data-ufo-src="images/ovni.gif"></script>
 *
 * El script crea su propio contenedor justo en el sitio donde está
 * la etiqueta <script>, con fondo transparente (no pinta nada más
 * que las vacas y el ovni). No hace falta añadir CSS ni HTML extra.
 *
 * ATRIBUTOS OPCIONALES (todos con "data-" en la etiqueta <script>)
 *   data-cow-src     ruta al gif de la vaca        (por defecto "vaca.gif")
 *   data-ufo-src     ruta al gif del ovni           (por defecto "ovni.gif")
 *   data-height      alto del campo en px           (por defecto 260)
 *   data-cows        nº de vacas iniciales          (por defecto 4)
 *   data-cow-width   ancho de cada vaca en px       (por defecto 90)
 *   data-ufo-width   ancho del ovni en px           (por defecto 110)
 *   data-min-delay   segundos mínimos entre abducciones (por defecto 14)
 *   data-max-delay   segundos máximos entre abducciones (por defecto 30)
 *   data-target      id de un contenedor ya existente donde renderizar,
 *                    en vez de insertarlo junto al <script> (opcional)
 * ---------------------------------------------------------------
 */
(function () {
	"use strict";

	// Hay que capturar esto de inmediato: document.currentScript solo
	// es válido durante la ejecución síncrona inicial del script.
	var scriptEl = document.currentScript;

	function ready(fn) {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", fn);
		} else {
			fn();
		}
	}

	ready(function () {
		var cfg = {
			cowSrc: scriptEl.getAttribute("data-cow-src") || "vaca.gif",
			ufoSrc: scriptEl.getAttribute("data-ufo-src") || "ovni.gif",
			height: parseInt(scriptEl.getAttribute("data-height"), 10) || 260,
			cowCount: parseInt(scriptEl.getAttribute("data-cows"), 10) || 6,
			cowWidth: parseInt(scriptEl.getAttribute("data-cow-width"), 10) || 120,
			ufoWidth: parseInt(scriptEl.getAttribute("data-ufo-width"), 10) || 180,
			minDelay: (parseFloat(scriptEl.getAttribute("data-min-delay")) || 10) * 1000,
			maxDelay: (parseFloat(scriptEl.getAttribute("data-max-delay")) || 25) * 1000
		};

		var targetId = scriptEl.getAttribute("data-target");
		var field = document.createElement("div");
		field.className = "cow-abduction-field";
		field.setAttribute("aria-hidden", "true");
		field.style.position = "relative";
		field.style.width = "100%";
		field.style.height = cfg.height + "px";
		field.style.overflow = "hidden";
		field.style.background = "transparent"; // solo vacas y ovni, nada más

		if (targetId) {
			var target = document.getElementById(targetId);
			if (target) {
				target.appendChild(field);
			} else {
				scriptEl.parentNode.insertBefore(field, scriptEl);
			}
		} else {
			scriptEl.parentNode.insertBefore(field, scriptEl);
		}

		// -----------------------------------------------------------
		// Estado
		// -----------------------------------------------------------
		var cows = [];
		var nextId = 0;
		var lastTs = null;
		var ufoBusy = false;

		function fieldWidth() {
			return field.clientWidth;
		}

		// -----------------------------------------------------------
		// Vacas
		// -----------------------------------------------------------
		function spawnCow(x, dir) {
			var img = document.createElement("img");
			img.src = cfg.cowSrc;
			img.alt = "";
			img.draggable = false;
			img.style.position = "absolute";
			img.style.width = cfg.cowWidth + "px";
			img.style.height = "auto";
			img.style.bottom = (10 + Math.random() * 16) + "px";
			img.style.transition = "transform 0.25s ease";
			
			// CORREGIDO: Giro inicial
			img.style.transform = dir < 0 ? "scaleX(1)" : "scaleX(-1)";

			field.appendChild(img);

			var cow = {
				id: nextId++,
				el: img,
				x: x,
				dir: dir,
				speed: 26 + Math.random() * 18,
				beingAbducted: false
			};

			img.style.left = x + "px";
			cows.push(cow);
			return cow;
		}

		function initialPopulation() {
			var w = fieldWidth();
			for (var i = 0; i < cfg.cowCount; i++) {
				var x = (w / cfg.cowCount) * i + Math.random() * 40;
				spawnCow(x, Math.random() < 0.5 ? -1 : 1);
			}
		}

		function tick(ts) {
			if (lastTs === null) lastTs = ts;
			var dt = Math.min(50, ts - lastTs) / 1000;
			lastTs = ts;

			var w = fieldWidth();

			for (var i = 0; i < cows.length; i++) {
				var cow = cows[i];
				if (cow.beingAbducted) continue;

				cow.x += cow.dir * cow.speed * dt;

				var flipped = false;
				if (cow.x <= 0) {
					cow.x = 0;
					if (cow.dir !== 1) flipped = true;
					cow.dir = 1;
				} else if (cow.x >= w - cfg.cowWidth) {
					cow.x = w - cfg.cowWidth;
					if (cow.dir !== -1) flipped = true;
					cow.dir = -1;
				}

				cow.el.style.left = cow.x + "px";
				if (flipped) {
					// CORREGIDO: Giro al rebotar en los bordes
					cow.el.style.transform = cow.dir < 0 ? "scaleX(1)" : "scaleX(-1)";
				}
			}

			requestAnimationFrame(tick);
		}

		// Congela el gif en el frame exacto en el que va, dibujándolo
		// en un canvas oculto y usando esa captura como nueva imagen.
		// Un <img> de gif no se puede pausar de otra forma.
		function freezeFrame(imgEl) {
			try {
				var canvas = document.createElement("canvas");
				canvas.width = imgEl.naturalWidth || imgEl.width;
				canvas.height = imgEl.naturalHeight || imgEl.height;
				var ctx = canvas.getContext("2d");
				ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
				imgEl.src = canvas.toDataURL();
			} catch (e) {
				// Si el navegador bloquea el canvas (gif servido desde otro
				// dominio sin CORS), simplemente no se congela el frame;
				// el resto de la animación de abducción sigue funcionando.
			}
		}

		function pickRandomCow() {
			var candidates = cows.filter(function (c) { return !c.beingAbducted; });
			if (candidates.length === 0) return null;
			return candidates[Math.floor(Math.random() * candidates.length)];
		}

		// -----------------------------------------------------------
		// Ovni: entra por un lateral aleatorio, sobrevuela hasta la
		// vaca elegida, la abduce, y sigue su camino hasta salir por
		// el lado opuesto.
		// -----------------------------------------------------------



function abductRandomCow() {
	var cow = pickRandomCow();

	if (!cow) {
		scheduleNextAbduction();
		return;
	}

	ufoBusy = true;

	var fromLeft = Math.random() < 0.5;
	var ufoY = 22;
	var ufoSpeed = 140;
	var w = fieldWidth();

	// -----------------------------------------------------------
	// OVNI
	// -----------------------------------------------------------

	var ufo = document.createElement("img");

	ufo.src = cfg.ufoSrc;
	ufo.alt = "";
	ufo.draggable = false;

	ufo.style.position = "absolute";
	ufo.style.width = cfg.ufoWidth + "px";
	ufo.style.height = "auto";
	ufo.style.top = ufoY + "px";

	ufo.style.transformOrigin = "center center";
	ufo.style.transform = fromLeft
		? "scaleX(1)"
		: "scaleX(-1)";

	ufo.style.filter =
		"drop-shadow(0 0 8px rgba(0,255,255,0.55))";

	// Posición inicial fuera de pantalla
	var ufoX = fromLeft
		? -cfg.ufoWidth
		: w;

	ufo.style.left = ufoX + "px";
	ufo.style.zIndex = "2";

	field.appendChild(ufo);

	// -----------------------------------------------------------
	// RAYO
	// -----------------------------------------------------------

	var beam = document.createElement("div");

	beam.style.position = "absolute";
	beam.style.width = "46px";
	beam.style.height = "0px";
	beam.style.opacity = "0";

	beam.style.transformOrigin = "top center";
	beam.style.transform = "translateX(-50%)";

	beam.style.background =
		"linear-gradient(to bottom, rgba(120,255,255,0.55), rgba(120,255,255,0))";

	beam.style.clipPath =
		"polygon(50% 0%, 0% 100%, 100% 100%)";

	beam.style.transition =
		"height 0.3s ease-out, opacity 0.3s ease-out";

	beam.style.pointerEvents = "none";

	beam.style.zIndex = "1";
field.appendChild(beam);

	// -----------------------------------------------------------
	// ESTADO
	// -----------------------------------------------------------

	var phase = "approach";
	var ufoLastTs = null;

	// -----------------------------------------------------------
	// ANIMACIÓN DEL OVNI
	// -----------------------------------------------------------

	function ufoTick(ts) {

		if (ufoLastTs === null) {
			ufoLastTs = ts;
		}

		var dt =
			Math.min(50, ts - ufoLastTs) / 1000;

		ufoLastTs = ts;

		var currentCowCenter =
			cow.x + (cfg.cowWidth / 2);

		// =======================================================
		// ENTRADA
		// =======================================================

		if (phase === "approach") {

			var dir =
				fromLeft ? 1 : -1;

			ufoX +=
				dir * ufoSpeed * dt;

			// ===================================================
			// IMPORTANTE:
			//
			// Recalculamos el objetivo EN CADA FRAME porque
			// la vaca sigue caminando.
			// ===================================================

			var targetX =
				currentCowCenter -
				(cfg.ufoWidth / 2);

			// ---------------------------------------------------
			// Comprobar si el ovni ya ha alcanzado a la vaca
			// ---------------------------------------------------

			if (
				(fromLeft && ufoX >= targetX) ||
				(!fromLeft && ufoX <= targetX)
			) {

				// Colocamos el ovni exactamente sobre la
				// posición ACTUAL de la vaca.
				ufoX = targetX;

				ufo.style.left =
					ufoX + "px";

				phase = "hover";

				startAbduction();
			}

			ufo.style.left =
				ufoX + "px";
		}

		// =======================================================
		// ABDUCCIÓN
		// =======================================================

		else if (phase === "hover") {

			// El ovni se queda quieto.
			// La vaca ya está marcada como beingAbducted.
		}

		// =======================================================
		// SALIDA
		// =======================================================

		else if (phase === "leave") {

			var leaveDir =
				fromLeft ? 1 : -1;

			ufoX +=
				leaveDir * ufoSpeed * dt;

			ufo.style.left =
				ufoX + "px";

			if (
				(fromLeft && ufoX > w) ||
				(!fromLeft && ufoX < -cfg.ufoWidth)
			) {

				if (ufo.parentNode === field) {
					field.removeChild(ufo);
				}

				if (beam.parentNode === field) {
					field.removeChild(beam);
				}

				ufoBusy = false;

				return;
			}
		}

		requestAnimationFrame(ufoTick);
	}

	// -----------------------------------------------------------
	// INICIAR ABDUCCIÓN
	// -----------------------------------------------------------

	function startAbduction() {

		// Cogemos la posición REAL de la vaca en este instante.
		var cowCenterX =
			cow.x + (cfg.cowWidth / 2);

		// -------------------------------------------------------
		// RAYO
		// -------------------------------------------------------

		beam.style.left =
			cowCenterX + "px";

		beam.style.top =
			(ufoY  +65) + "px";

		var cowBottom =
			parseFloat(cow.el.style.bottom) || 10;

		var beamHeight =
			Math.max(
				20,
				cowBottom + 30
			);

		beam.style.height =
			beamHeight + "px";

		beam.style.opacity =
			"1";

		// -------------------------------------------------------
		// CONGELAR VACA
		// -------------------------------------------------------

		cow.beingAbducted = true;

		freezeFrame(cow.el);

		// -------------------------------------------------------
		// SUBIDA DE LA VACA
		// -------------------------------------------------------

		setTimeout(function () {

			cow.el.style.transition =
				"transform 1.1s cubic-bezier(.5,0,.8,.3), opacity 1.1s ease-in";

			cow.el.style.transform +=
				" translateY(-220px) scale(0.15)";

			cow.el.style.opacity =
				"0";

			// ---------------------------------------------------
			// TERMINAR ABDUCCIÓN
			// ---------------------------------------------------

			setTimeout(function () {

				beam.style.opacity =
					"0";

				beam.style.height =
					"0px";

				if (cow.el.parentNode === field) {
					field.removeChild(cow.el);
				}

				cows = cows.filter(function (c) {
					return c.id !== cow.id;
				});

				// El ovni continúa su trayectoria
				phase = "leave";

				// ------------------------------------------------
				// CREAR NUEVA VACA
				// ------------------------------------------------

				setTimeout(function () {

					var edge =
						Math.random() < 0.5;

					var startX =
						edge
							? -cfg.cowWidth
							: fieldWidth();

					var dir =
						edge ? 1 : -1;

					spawnCow(
						startX,
						dir
					);

				}, 2000 + Math.random() * 3000);

			}, 1150);

		}, 250);
	}

	requestAnimationFrame(ufoTick);

	scheduleNextAbduction();
}



		function scheduleNextAbduction() {
			var delay = cfg.minDelay + Math.random() * (cfg.maxDelay - cfg.minDelay);
			setTimeout(function () {
				if (!ufoBusy) abductRandomCow();
				else scheduleNextAbduction();
			}, delay);
		}

		window.addEventListener("resize", function () {
			var w = fieldWidth();
			cows.forEach(function (cow) {
				cow.x = Math.min(cow.x, Math.max(0, w - cfg.cowWidth));
				cow.el.style.left = cow.x + "px";
			});
		});

		initialPopulation();
		requestAnimationFrame(tick);
		scheduleNextAbduction();
	});
})();
