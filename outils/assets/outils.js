/* =========================================================
   Boîte à outils Mr Doamba — JavaScript partagé
   Chargé par toutes les pages du dossier outils/.
   Contient : coordonnées, thème clair/sombre, menu mobile,
   formatage (FCFA, dates, téléphones), liens WhatsApp,
   copie de texte, stockage local (localStorage + IndexedDB).
   Tout est exposé dans l'objet global « Outils ».
   ========================================================= */
"use strict";

const Outils = (() => {
  /* ---------- Coordonnées (une seule source pour toutes les pages) ---------- */
  const CONFIG = Object.freeze({
    marque: "Mr Doamba",
    nomComplet: "Delarose Doamba",
    metier: "Graphiste, designer web, monteur vidéo et motion designer",
    ville: "Ouagadougou, Burkina Faso",
    whatsapp: "22673061050", // format international, sans « + » ni espaces
    email: "romeodoamba980@gmail.com",
    instagram: "https://www.instagram.com/delarose__doamba",
    facebook: "https://www.facebook.com/share/1C9p7qsbiz/?mibextid=wwXIfr",
    siteUrl: "https://romeodoamba980-code.github.io/MrDoamba/",
    delaiReponse: "48 h"
  });

  /* Préfixe de toutes les clés localStorage, pour pouvoir tout effacer d'un coup */
  const PREFIXE_STOCKAGE = "md-outils:";

  /* Au-delà de cette longueur, un lien WhatsApp peut échouer sur certains téléphones */
  const LIMITE_WHATSAPP = 1500;

  /* =========================================================
     Formatage
     ========================================================= */

  const formateurNombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

  /**
   * Formate un montant en FCFA : 150000 -> « 150 000 FCFA ».
   * À l'écran, on garde les espaces insécables (le montant ne se coupe pas en fin de ligne).
   * Pour un PDF (jsPDF), passer { pourPdf: true } : les espaces insécables fines
   * d'Intl s'affichent mal avec les polices de base de jsPDF, on les remplace par des espaces normales.
   */
  function formatFCFA(montant, { pourPdf = false } = {}) {
    const valeur = Math.round(Number(montant) || 0);
    const nombre = formateurNombre.format(valeur);
    if (pourPdf) return `${nombre.replace(/[  ]/g, " ")} FCFA`;
    return `${nombre.replace(/ /g, " ")} FCFA`;
  }

  /** Date au format jj/mm/aaaa */
  function formatDate(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    const jj = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${jj}/${mm}/${d.getFullYear()}`;
  }

  /**
   * Nettoie un numéro saisi et renvoie le format international sans « + » (ex. 22670123456),
   * ou null s'il n'est pas valide. Accepte : 70 12 34 56, +226 70 12 34 56, 0022670123456…
   * Numéros du Burkina Faso : 8 chiffres après l'indicatif 226.
   */
  function normaliserTelephone(saisie) {
    let chiffres = String(saisie || "").replace(/\D/g, "");
    if (chiffres.startsWith("00")) chiffres = chiffres.slice(2);
    if (chiffres.length === 8) chiffres = `226${chiffres}`;
    if (/^226\d{8}$/.test(chiffres)) return chiffres;
    return null;
  }

  /** Affiche un numéro au format +226 XX XX XX XX (ou le texte d'origine si invalide) */
  function formatTelephone(saisie) {
    const numero = normaliserTelephone(saisie);
    if (!numero) return String(saisie || "");
    const local = numero.slice(3).match(/\d{2}/g).join(" ");
    return `+226 ${local}`;
  }

  /* =========================================================
     WhatsApp, e-mail et copie
     ========================================================= */

  /**
   * Construit un lien WhatsApp avec message pré-rempli.
   * Renvoie { url, tropLong } : si tropLong est vrai, proposer aussi « Copier le message ».
   */
  function lienWhatsApp(message = "", numero = CONFIG.whatsapp) {
    const texte = String(message);
    const url = `https://wa.me/${numero}${texte ? `?text=${encodeURIComponent(texte)}` : ""}`;
    return { url, tropLong: texte.length > LIMITE_WHATSAPP };
  }

  /** Construit un lien mailto avec objet et corps pré-remplis */
  function lienEmail(objet = "", corps = "", adresse = CONFIG.email) {
    const params = new URLSearchParams();
    if (objet) params.set("subject", objet);
    if (corps) params.set("body", corps);
    // URLSearchParams encode les espaces en « + », que les messageries n'interprètent pas toujours
    const requete = params.toString().replace(/\+/g, "%20");
    return `mailto:${adresse}${requete ? `?${requete}` : ""}`;
  }

  /** Copie un texte dans le presse-papiers (avec solution de secours pour les vieux navigateurs) */
  async function copierTexte(texte) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texte);
        return true;
      }
    } catch (erreur) {
      // On tente la méthode de secours ci-dessous
    }
    const zone = document.createElement("textarea");
    zone.value = texte;
    zone.setAttribute("readonly", "");
    zone.style.position = "fixed";
    zone.style.opacity = "0";
    document.body.appendChild(zone);
    zone.select();
    let reussi = false;
    try {
      reussi = document.execCommand("copy");
    } catch (erreur) {
      reussi = false;
    }
    zone.remove();
    return reussi;
  }

  /* =========================================================
     Petit message de confirmation (toast)
     ========================================================= */

  let zoneToast = null;
  let minuteurToast = null;

  function toast(message, { duree = 2800 } = {}) {
    if (!zoneToast) {
      zoneToast = document.createElement("div");
      zoneToast.className = "outils-toast";
      zoneToast.setAttribute("role", "status");
      zoneToast.setAttribute("aria-live", "polite");
      document.body.appendChild(zoneToast);
    }
    zoneToast.textContent = message;
    zoneToast.classList.add("visible");
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(() => zoneToast.classList.remove("visible"), duree);
  }

  /* =========================================================
     Stockage local (textes et réglages)
     Toutes les lectures/écritures sont protégées : en navigation privée
     ou si le stockage est plein, l'outil continue de fonctionner.
     ========================================================= */

  const stockage = {
    lire(cle, valeurParDefaut = null) {
      try {
        const brut = localStorage.getItem(PREFIXE_STOCKAGE + cle);
        return brut === null ? valeurParDefaut : JSON.parse(brut);
      } catch (erreur) {
        return valeurParDefaut;
      }
    },
    ecrire(cle, valeur) {
      try {
        localStorage.setItem(PREFIXE_STOCKAGE + cle, JSON.stringify(valeur));
        return true;
      } catch (erreur) {
        return false;
      }
    },
    supprimer(cle) {
      try {
        localStorage.removeItem(PREFIXE_STOCKAGE + cle);
      } catch (erreur) {
        // Rien à faire : la donnée n'est de toute façon pas lisible
      }
    },
    /** Efface toutes les données d'un module (ex. « brief: ») ou de toute la boîte à outils */
    effacerTout(sousPrefixe = "") {
      try {
        const cible = PREFIXE_STOCKAGE + sousPrefixe;
        Object.keys(localStorage)
          .filter((cle) => cle.startsWith(cible))
          .forEach((cle) => localStorage.removeItem(cle));
      } catch (erreur) {
        // Stockage indisponible : rien à effacer
      }
    }
  };

  /* =========================================================
     IndexedDB (images : photos de produits, maquettes…)
     localStorage est limité à environ 5 Mo : les images vont ici.
     ========================================================= */

  const NOM_BASE = "md-outils";
  const MAGASIN = "fichiers";
  let baseOuverte = null;

  function ouvrirBase() {
    if (baseOuverte) return baseOuverte;
    baseOuverte = new Promise((resoudre, rejeter) => {
      if (!("indexedDB" in window)) {
        rejeter(new Error("IndexedDB indisponible"));
        return;
      }
      const requete = indexedDB.open(NOM_BASE, 1);
      requete.onupgradeneeded = () => requete.result.createObjectStore(MAGASIN);
      requete.onsuccess = () => resoudre(requete.result);
      requete.onerror = () => rejeter(requete.error);
    });
    // En cas d'échec, on autorise une nouvelle tentative plus tard
    baseOuverte.catch(() => {
      baseOuverte = null;
    });
    return baseOuverte;
  }

  async function transaction(mode, action) {
    const base = await ouvrirBase();
    return new Promise((resoudre, rejeter) => {
      const tx = base.transaction(MAGASIN, mode);
      const requete = action(tx.objectStore(MAGASIN));
      tx.oncomplete = () => resoudre(requete ? requete.result : undefined);
      tx.onerror = () => rejeter(tx.error);
      tx.onabort = () => rejeter(tx.error);
    });
  }

  const fichiers = {
    lire: (cle) => transaction("readonly", (magasin) => magasin.get(cle)).catch(() => undefined),
    ecrire: (cle, valeur) => transaction("readwrite", (magasin) => magasin.put(valeur, cle)).then(() => true).catch(() => false),
    supprimer: (cle) => transaction("readwrite", (magasin) => magasin.delete(cle)).catch(() => undefined),
    /** Efface les fichiers dont la clé commence par sousPrefixe (tous si vide) */
    effacerTout: async (sousPrefixe = "") => {
      try {
        const cles = await transaction("readonly", (magasin) => magasin.getAllKeys());
        const aEffacer = (cles || []).filter((cle) => String(cle).startsWith(sousPrefixe));
        await transaction("readwrite", (magasin) => {
          aEffacer.forEach((cle) => magasin.delete(cle));
          return null;
        });
      } catch (erreur) {
        // Base indisponible : rien à effacer
      }
    }
  };

  /* =========================================================
     Paramètres d'URL (toujours vérifiés avant usage)
     ========================================================= */

  /**
   * Lit un paramètre d'URL et le renvoie seulement s'il correspond au motif autorisé.
   * Ex. : lireParametre("type", /^[a-z-]{2,30}$/)
   */
  function lireParametre(nom, motifAutorise) {
    const valeur = new URLSearchParams(window.location.search).get(nom);
    if (valeur === null) return null;
    return motifAutorise.test(valeur) ? valeur : null;
  }

  /* =========================================================
     Thème clair / sombre — même réglage que le site principal
     (clé « delarose-theme » partagée avec script.js)
     ========================================================= */

  const CLE_THEME = "delarose-theme";

  function appliquerTheme(bouton, sombre) {
    document.body.classList.toggle("dark-mode", sombre);
    if (!bouton) return;
    bouton.setAttribute("aria-pressed", String(sombre));
    bouton.setAttribute("aria-label", sombre ? "Activer le mode clair" : "Activer le mode sombre");
    const icone = bouton.querySelector("i");
    if (icone) {
      icone.classList.toggle("fa-moon", !sombre);
      icone.classList.toggle("fa-sun", sombre);
    }
  }

  function initialiserTheme() {
    const bouton = document.getElementById("theme-toggle");
    let themeEnregistre = null;
    try {
      themeEnregistre = localStorage.getItem(CLE_THEME);
    } catch (erreur) {
      themeEnregistre = null;
    }
    const prefereSombre = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    appliquerTheme(bouton, themeEnregistre ? themeEnregistre === "dark" : prefereSombre);

    bouton?.addEventListener("click", () => {
      const sombre = !document.body.classList.contains("dark-mode");
      appliquerTheme(bouton, sombre);
      try {
        localStorage.setItem(CLE_THEME, sombre ? "dark" : "light");
      } catch (erreur) {
        // Le thème reste actif jusqu'au rechargement de la page
      }
    });
  }

  /* ---------- Menu mobile (même comportement que le site principal) ---------- */
  function initialiserMenu() {
    const menu = document.getElementById("main-nav");
    const bouton = document.getElementById("nav-toggle");
    if (!menu || !bouton) return;

    const fermer = () => {
      menu.classList.remove("open");
      bouton.classList.remove("active");
      bouton.setAttribute("aria-expanded", "false");
      bouton.setAttribute("aria-label", "Ouvrir le menu");
    };

    bouton.addEventListener("click", () => {
      const ouvert = menu.classList.toggle("open");
      bouton.classList.toggle("active", ouvert);
      bouton.setAttribute("aria-expanded", String(ouvert));
      bouton.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    });
    menu.querySelectorAll("a").forEach((lien) => lien.addEventListener("click", fermer));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) fermer();
    });
  }

  /* ---------- Liens WhatsApp déclarés dans le HTML ----------
     <a data-whatsapp="Mon message">…</a> reçoit automatiquement le bon lien. */
  function initialiserLiensWhatsApp() {
    document.querySelectorAll("[data-whatsapp]").forEach((lien) => {
      lien.href = lienWhatsApp(lien.dataset.whatsapp).url;
      lien.target = "_blank";
      lien.rel = "noopener noreferrer";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initialiserTheme();
    initialiserMenu();
    initialiserLiensWhatsApp();
    const annee = document.getElementById("year");
    if (annee) annee.textContent = String(new Date().getFullYear());
  });

  return Object.freeze({
    CONFIG,
    formatFCFA,
    formatDate,
    normaliserTelephone,
    formatTelephone,
    lienWhatsApp,
    lienEmail,
    copierTexte,
    toast,
    stockage,
    fichiers,
    lireParametre
  });
})();
