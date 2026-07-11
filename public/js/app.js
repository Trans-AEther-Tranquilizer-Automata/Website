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
	const alwaysScrolled = nav?.classList.contains("scrolled") ?? false;
	let menuOpen = false;

	const updateNav = () => {
		if (nav) {
			nav.classList.toggle(
				"scrolled",
				alwaysScrolled || menuOpen || window.scrollY > 40,
			);
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

	const mobileQuery = window.matchMedia("(max-width: 768px)");
	mobileQuery.addEventListener("change", (e) => {
		if (!e.matches && menuOpen && toggle && links) {
			menuOpen = false;
			toggle.classList.remove("active");
			links.classList.remove("open");
			document.body.style.overflow = "";
			updateNav();
		}
	});

	const cmdSearch = document.getElementById("cmd-search");
	const cmdList = document.getElementById("cmd-list");
	const cmdEmpty = document.getElementById("cmd-empty");

	if (cmdSearch && cmdList && cmdEmpty) {
		cmdSearch.addEventListener("input", () => {
			const query = cmdSearch.value.toLowerCase().trim();
			let visible = 0;

			for (const category of cmdList.querySelectorAll(".cmd-category")) {
				let categoryVisible = 0;

				for (const item of category.querySelectorAll(".cmd-item")) {
					const cmd = item.getAttribute("data-cmd") || "";
					const desc =
						item.querySelector(".cmd-desc")?.textContent?.toLowerCase() || "";
					const match = cmd.includes(query) || desc.includes(query);
					item.style.display = match ? "" : "none";
					if (match) categoryVisible++;
				}

				category.style.display = categoryVisible > 0 ? "" : "none";
				visible += categoryVisible;
			}

			cmdEmpty.hidden = visible > 0;
		});
	}

	const lbTabs = document.getElementById("lb-tabs");
	const lbBoards = document.getElementById("lb-boards");
	const lbSearch = document.getElementById("lb-search");

	if (lbTabs && lbBoards) {
		const filterBoard = (board, query) => {
			const empty = board.querySelector(".lb-empty");
			let visible = 0;

			for (const row of board.querySelectorAll(".lb-row:not(.lb-row-head)")) {
				const user = row.getAttribute("data-user") || "";
				const match = user.includes(query);
				row.style.display = match ? "" : "none";
				if (match) visible++;
			}

			if (empty) empty.hidden = visible > 0;
		};

		const activeBoard = () =>
			lbBoards.querySelector(".lb-board:not([hidden])") ||
			lbBoards.querySelector(".lb-board");

		const lbTabNodes = lbTabs.querySelectorAll(".lb-tab");

		for (const tab of lbTabNodes) {
			tab.addEventListener("click", () => {
				const name = tab.getAttribute("data-tab");

				for (const t of lbTabNodes) {
					t.classList.toggle("lb-tab-active", t === tab);
				}

				let current = null;
				for (const board of lbBoards.querySelectorAll(".lb-board")) {
					const isActive = board.getAttribute("data-board") === name;
					board.hidden = !isActive;
					if (isActive) current = board;
				}

				if (current)
					filterBoard(current, lbSearch?.value.toLowerCase().trim() || "");
			});
		}

		if (lbSearch) {
			lbSearch.addEventListener("input", () => {
				const board = activeBoard();
				if (board) filterBoard(board, lbSearch.value.toLowerCase().trim());
			});
		}
	}
})();
