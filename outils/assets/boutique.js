/* =========================================================
   Boutique Mr Doamba — achat des plugins Photoshop
   Paiement Orange Money / Moov Money, preuve envoyée sur WhatsApp.
   Pour changer un prix : modifier « prix » ci-dessous (en FCFA, ou null).
   Lien direct vers un produit : boutique.html?produit=affiche-minute
   ========================================================= */
"use strict";

(() => {
  /* ---------- Réglages ---------- */
  const PAIEMENT = Object.freeze({
    orange: "66540535",   // Orange Money
    moov: "73061050",     // Moov Money
    whatsapp: "22666540535" // WhatsApp qui reçoit les preuves de paiement
  });

  const PRODUITS = [
    {
      id: "affiche-minute",
      nom: "Affiche Minute",
      icone: "fa-bolt",
      badge: "Plugin Photoshop",
      prix: null, // ex. 15000
      resume: "Une affiche professionnelle prête à publier en une minute, même sans savoir utiliser Photoshop.",
      points: [
        "10 modèles modernes (soirée, culte, immobilier, BTP, produits…)",
        "Assistant IA : décrivez l'affiche, tout se remplit",
        "Cadrage automatique des photos et logo sur fond blanc",
        "Titres et textes 3D en un clic, 6 formats (A4, story, Facebook…)"
      ],
      essai: true
    },
    {
      id: "atelier-logo",
      nom: "Atelier Logo",
      icone: "fa-pen-ruler",
      badge: "Plugin Photoshop",
      prix: null, // ex. 10000
      resume: "Des propositions de logos adaptées à votre activité, à insérer dans Photoshop en calques modifiables.",
      points: [
        "15 domaines d'activité, symboles et palettes adaptés",
        "Couleurs libres et harmonies automatiques",
        "Logo en 3 versions : fond clair, sombre et couleur",
        "Formes vectorielles et texte toujours modifiables"
      ],
      essai: false
    }
  ];

  /* ---------- Outils ---------- */
  const $ = (id) => document.getElementById(id);
  const prixTexte = (p) => (p ? Outils.formatFCFA(p) : "Prix sur WhatsApp");
  const local = (n) => n.match(/\d{2}/g).join(" ");

  let choix = PRODUITS[0];

  function afficherProduits() {
    const boite = $("liste-produits");
    boite.innerHTML = "";
    PRODUITS.forEach((p) => {
      const carte = document.createElement("button");
      carte.type = "button";
      carte.className = "bq-produit" + (p === choix ? " is-actif" : "");
      carte.setAttribute("role", "radio");
      carte.setAttribute("aria-checked", String(p === choix));
      carte.innerHTML = `
        <span class="bq-produit-haut">
          <span class="tool-icon"><i class="fa-solid ${p.icone}" aria-hidden="true"></i></span>
          <span class="badge">${p.badge}</span>
          <span class="bq-coche" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
        </span>
        <span class="bq-produit-nom">${p.nom}</span>
        <span class="bq-produit-resume">${p.resume}</span>
        <span class="bq-points">${p.points.map((x) => `<span><i class="fa-solid fa-check" aria-hidden="true"></i>${x}</span>`).join("")}</span>
        <span class="bq-prix">${prixTexte(p.prix)}</span>`;
      carte.addEventListener("click", () => { choix = p; majTout(); });
      boite.appendChild(carte);
    });
  }

  function message() {
    const nom = $("a-nom").value.trim();
    const tel = Outils.formatTelephone($("a-tel").value);
    const trx = $("a-transaction").value.trim();
    return [
      `Bonjour Mr Doamba, je viens d'acheter « ${choix.nom} » sur votre site.`,
      ``,
      `• Produit : ${choix.nom}${choix.prix ? " — " + Outils.formatFCFA(choix.prix) : ""}`,
      `• Payé avec : ${$("a-moyen").value}`,
      trx ? `• Identifiant de transaction : ${trx}` : null,
      `• Nom : ${nom}`,
      `• WhatsApp : ${tel}`,
      ``,
      `Je vous envoie la capture du paiement. Merci de m'envoyer ma clé de licence.`
    ].filter((l) => l !== null).join("\n");
  }

  function valider() {
    let ok = true;
    const nom = $("a-nom").value.trim();
    $("a-nom-err").textContent = nom.length < 2 ? "Indiquez votre nom." : "";
    if (nom.length < 2) ok = false;
    const tel = Outils.normaliserTelephone($("a-tel").value);
    $("a-tel-err").textContent = tel ? "" : "Numéro invalide (8 chiffres, ex. 70 12 34 56).";
    if (!tel) ok = false;
    return ok;
  }

  function majTout() {
    afficherProduits();
    $("montant-a-payer").textContent = choix.prix ? Outils.formatFCFA(choix.prix) : "";
    $("bloc-essai").hidden = !choix.essai;
    try { history.replaceState(null, "", "?produit=" + choix.id); } catch (e) { /* sans importance */ }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const demande = Outils.lireParametre("produit", /^[a-z-]{3,30}$/);
    choix = PRODUITS.find((p) => p.id === demande) || PRODUITS[0];

    $("num-orange").textContent = "+226 " + local(PAIEMENT.orange);
    $("num-moov").textContent = "+226 " + local(PAIEMENT.moov);
    document.querySelectorAll("[data-copier]").forEach((b) => {
      b.addEventListener("click", async () => {
        const n = PAIEMENT[b.dataset.copier];
        const ok = await Outils.copierTexte(n);
        Outils.toast(ok ? `Numéro ${local(n)} copié` : `Numéro : ${local(n)}`);
      });
    });

    $("form-achat").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!valider()) return;
      const { url } = Outils.lienWhatsApp(message(), PAIEMENT.whatsapp);
      window.open(url, "_blank", "noopener");
    });
    $("btn-copier-msg").addEventListener("click", async () => {
      if (!valider()) return;
      const ok = await Outils.copierTexte(message());
      Outils.toast(ok ? "Message copié : collez-le dans WhatsApp" : "Copie impossible sur cet appareil");
    });

    const y = $("year"); if (y) y.textContent = new Date().getFullYear();
    majTout();
  });
})();
