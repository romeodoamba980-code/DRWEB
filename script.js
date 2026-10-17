"use strict";

/* TES RÉALISATIONS
   - image  : la miniature affichée dans la grille
   - images : (facultatif) plusieurs pages ou visuels, qu'on fait défiler dans la visionneuse
   - description : (facultatif) une phrase affichée sous le titre dans la visionneuse */
const PROJECTS = [
  {
    title: "Projet personnel",
    category: "Branding",
    image: "https://i.ibb.co/8Ldt2wKP/Whats-App-Image-2025-10-29-at-12-35-48-30d4f2db.jpg"
  },
  {
    title: "Brochure EcoVigi Consulting",
    category: "Brochures",
    description: "Brochure de 7 pages pour Nana Abdoul Aziz, ingénieur QHSE : engagements, méthodologie, domaines d'intervention et offres.",
    image: "images/realisations/nana-aziz-brochure/miniature.jpg",
    images: [
      "images/realisations/nana-aziz-brochure/page-1.jpg",
      "images/realisations/nana-aziz-brochure/page-2.jpg",
      "images/realisations/nana-aziz-brochure/page-3.jpg",
      "images/realisations/nana-aziz-brochure/page-4.jpg",
      "images/realisations/nana-aziz-brochure/page-5.jpg",
      "images/realisations/nana-aziz-brochure/page-6.jpg",
      "images/realisations/nana-aziz-brochure/page-7.jpg"
    ]
  },
  {
    title: "Affiche Orbite Services",
    category: "Affiches",
    description: "Affiche pour Orbite Services (études, conseils, constructions) : « L'excellence se construit en équipe ».",
    image: "images/realisations/affiche-orbite-services.jpg"
  },
  {
    title: "Affiche promotionnelle",
    category: "Affiches",
    image: "https://i.ibb.co/1tX4ZGCY/RD-N-1.jpg"
  },
  {
    title: "Assiyah Délice",
    category: "Affiches",
    image: "https://i.ibb.co/nqj6GKTP/assiyah-delice-1-AA.jpg"
  },
  {
    title: "Campagne email",
    category: "Email",
    image: "https://i.ibb.co/fVmd60wG/EM.jpg"
  }
];

const WHATSAPP_NUMBER = "22673061050";

document.addEventListener("DOMContentLoaded", () => {
  const get = (id) => document.getElementById(id);

  const year = get("year");
  if (year) year.textContent = String(new Date().getFullYear());

  initializeTheme(get("theme-toggle"));
  initializeNavigation(get("main-nav"), get("nav-toggle"));
  initializeRevealAnimations();
  initializeCounters();
  initializePortfolio();
  initializeContactForm(get("contact-form"));
});

function initializeTheme(toggle) {
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("delarose-theme");
  } catch (error) {
    // Theme still works for this page view when storage is unavailable.
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  applyTheme(toggle, storedTheme ? storedTheme === "dark" : prefersDark);

  toggle?.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark-mode");
    applyTheme(toggle, dark);
    try {
      localStorage.setItem("delarose-theme", dark ? "dark" : "light");
    } catch (error) {
      // The selected theme remains active until the page is reloaded.
    }
  });
}

function applyTheme(toggle, dark) {
  document.body.classList.toggle("dark-mode", dark);
  if (!toggle) return;

  toggle.setAttribute("aria-pressed", String(dark));
  toggle.setAttribute("aria-label", dark ? "Activer le mode clair" : "Activer le mode sombre");
  const icon = toggle.querySelector("i");
  if (icon) {
    icon.classList.toggle("fa-moon", !dark);
    icon.classList.toggle("fa-sun", dark);
  }
}

function initializeNavigation(nav, toggle) {
  if (!nav || !toggle) return;

  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  if ("IntersectionObserver" in window) {
    const links = [...nav.querySelectorAll("a[href^='#']")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.hash === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
  }
}

function initializeRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function initializeCounters() {
  const counters = document.querySelectorAll(".stat-card [data-target]");
  if (!counters.length || !("IntersectionObserver" in window)) {
    counters.forEach((counter) => {
      counter.textContent = `${counter.dataset.target}+`;
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0]?.isIntersecting) return;
    counters.forEach((counter) => {
      const target = Number.parseInt(counter.dataset.target, 10);
      if (!Number.isFinite(target)) return;

      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.floor(eased * target)}${progress === 1 ? "+" : ""}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.disconnect();
  }, { threshold: 0.6 });

  const stats = document.querySelector(".stats-grid");
  if (stats) observer.observe(stats);
}

function getPages(project) {
  return Array.isArray(project.images) && project.images.length ? project.images : [project.image];
}

function createProjectCard(project, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "project-card";
  card.dataset.projectIndex = String(index);
  card.dataset.category = project.category;
  card.setAttribute("aria-label", `Agrandir le projet : ${project.title}`);

  const imageWrap = document.createElement("span");
  imageWrap.className = "project-image";
  const image = document.createElement("img");
  image.src = project.image;
  image.alt = `${project.title} — ${project.category}`;
  image.loading = index < 3 ? "eager" : "lazy";
  image.decoding = "async";
  imageWrap.appendChild(image);

  const pages = getPages(project);
  if (pages.length > 1) {
    const badge = document.createElement("span");
    badge.className = "project-badge";
    badge.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> ';
    badge.append(`${pages.length} pages`);
    imageWrap.appendChild(badge);
  }

  const meta = document.createElement("span");
  meta.className = "project-meta";
  const text = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = project.title;
  const category = document.createElement("span");
  category.textContent = project.category;
  text.append(title, category);

  const arrow = document.createElement("span");
  arrow.className = "project-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';

  meta.append(text, arrow);
  card.append(imageWrap, meta);
  return card;
}

function initializePortfolio() {
  const featured = document.getElementById("featured-projects");
  const grid = document.getElementById("portfolio-grid");
  const filter = document.getElementById("portfolio-filter");
  const modal = document.getElementById("portfolio-modal");
  const openButton = document.getElementById("portfolio-open");
  const closeButton = document.getElementById("portfolio-close");
  const lightbox = document.getElementById("lightbox");
  const lightboxMedia = document.getElementById("lb-media");
  const lightboxCaption = document.getElementById("lb-caption");
  let returnFocus = null;
  let currentProject = 0;
  let currentPage = 0;

  if (!featured || !grid || !filter || !modal || !openButton || !lightbox) return;

  PROJECTS.forEach((project, index) => {
    const card = createProjectCard(project, index);
    grid.appendChild(card);
    if (index < 3) featured.appendChild(card.cloneNode(true));
  });

  const categories = ["Tous", ...new Set(PROJECTS.map((project) => project.category))];
  categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-button${index === 0 ? " active" : ""}`;
    button.textContent = category;
    button.setAttribute("aria-pressed", String(index === 0));
    button.addEventListener("click", () => {
      filter.querySelectorAll(".filter-button").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      grid.querySelectorAll(".project-card").forEach((card) => {
        card.hidden = category !== "Tous" && card.dataset.category !== category;
      });
    });
    filter.appendChild(button);
  });

  const showLightbox = (index, page = 0) => {
    currentProject = index;
    const project = PROJECTS[currentProject];
    if (!project || !lightboxMedia || !lightboxCaption) return;
    const pages = getPages(project);
    currentPage = Math.min(Math.max(page, 0), pages.length - 1);

    lightboxMedia.replaceChildren();
    const image = document.createElement("img");
    image.src = pages[currentPage];
    image.alt = `${project.title} — ${pages.length > 1 ? `page ${currentPage + 1}` : project.category}`;
    lightboxMedia.appendChild(image);

    lightboxCaption.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = project.title;
    const category = document.createElement("small");
    category.textContent = pages.length > 1
      ? `${project.category} · page ${currentPage + 1} / ${pages.length}`
      : project.category;
    lightboxCaption.append(title, category);
    if (project.description) {
      const description = document.createElement("small");
      description.className = "lightbox-description";
      description.textContent = project.description;
      lightboxCaption.appendChild(description);
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    if (document.querySelector(".portfolio-modal.active")) return;
    document.body.classList.add("modal-open");
    document.getElementById("lb-close")?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxMedia?.replaceChildren();
    document.body.classList.remove("modal-open");
    returnFocus?.focus();
  };

  const openGallery = () => {
    returnFocus = document.activeElement;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeButton?.focus();
  };

  const closeGallery = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    returnFocus?.focus();
  };

  openButton.addEventListener("click", openGallery);
  closeButton?.addEventListener("click", closeGallery);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeGallery();
  });

  const openProjectFromCard = (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    const index = Number.parseInt(card.dataset.projectIndex, 10);
    if (!Number.isInteger(index)) return;
    returnFocus = card.closest("#portfolio-modal") ? openButton : card;
    showLightbox(index);
  };

  featured.addEventListener("click", openProjectFromCard);
  grid.addEventListener("click", openProjectFromCard);

  // Les flèches font d'abord défiler les pages du projet, puis passent au projet suivant / précédent
  const stepProject = (direction) => {
    const pages = getPages(PROJECTS[currentProject]);
    const nextPage = currentPage + direction;
    if (nextPage >= 0 && nextPage < pages.length) {
      showLightbox(currentProject, nextPage);
      return;
    }
    currentProject = (currentProject + direction + PROJECTS.length) % PROJECTS.length;
    const target = getPages(PROJECTS[currentProject]);
    showLightbox(currentProject, direction > 0 ? 0 : target.length - 1);
  };

  document.getElementById("lb-close")?.addEventListener("click", closeLightbox);
  document.getElementById("lb-prev")?.addEventListener("click", () => stepProject(-1));
  document.getElementById("lb-next")?.addEventListener("click", () => stepProject(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.classList.contains("active")) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") stepProject(1);
      if (event.key === "ArrowLeft") stepProject(-1);
      return;
    }

    if (!modal.classList.contains("active")) return;
    if (event.key === "Escape") {
      closeGallery();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...modal.querySelectorAll("button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  let touchStartX = null;
  lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 55) stepProject(deltaX < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });
}

function initializeContactForm(form) {
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("c-nom")?.value.trim();
    const service = document.getElementById("c-service")?.value;
    const message = document.getElementById("c-message")?.value.trim();

    if (!name || !service || !message) {
      form.reportValidity();
      return;
    }

    const text = `Bonjour Delarose, je m'appelle ${name}.\nService : ${service}\n\n${message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}
