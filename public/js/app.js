(() => {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
	);

	for (const el of document.querySelectorAll(".fade-in")) {
		observer.observe(el);
	}

	const toggle = document.getElementById("nav-toggle");
	const links = document.getElementById("nav-links");

	const nav = document.getElementById("nav");
	let menuOpen = false;

	const updateNav = () => {
		if (nav) {
			nav.classList.toggle("scrolled", menuOpen || window.scrollY > 40);
		}
	};

	if (toggle && links) {
		toggle.addEventListener("click", () => {
			menuOpen = !menuOpen;
			toggle.classList.toggle("active", menuOpen);
			links.classList.toggle("open", menuOpen);
			document.body.style.overflow = menuOpen ? "hidden" : "";
			updateNav();
		});

		for (const link of links.querySelectorAll("a[href^='#']")) {
			link.addEventListener("click", () => {
				menuOpen = false;
				toggle.classList.remove("active");
				links.classList.remove("open");
				document.body.style.overflow = "";
				updateNav();
			});
		}
	}

	if (nav) {
		window.addEventListener("scroll", updateNav, { passive: true });
	}

	const cmdSearch = document.getElementById("cmd-search");
	const cmdList = document.getElementById("cmd-list");
	const cmdEmpty = document.getElementById("cmd-empty");

	if (cmdSearch && cmdList && cmdEmpty) {
		cmdSearch.addEventListener("input", () => {
			const query = cmdSearch.value.toLowerCase().trim();
			const items = cmdList.querySelectorAll(".cmd-item");
			let visible = 0;

			for (const item of items) {
				const cmd = item.getAttribute("data-cmd") || "";
				const desc =
					item.querySelector(".cmd-desc")?.textContent?.toLowerCase() || "";
				const match = cmd.includes(query) || desc.includes(query);
				item.style.display = match ? "" : "none";
				if (match) visible++;
			}

			cmdEmpty.hidden = visible > 0;
		});
	}
})();
