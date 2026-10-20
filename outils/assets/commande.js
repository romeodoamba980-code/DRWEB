/* =========================================================
   Boîte à outils Mr Doamba — Demande de devis avec estimation
   Lit le catalogue dans data/tarifs.js (objet TARIFS).
   1. Catalogue des services  2. Questions  3. Coordonnées
   4. Estimation + envoi WhatsApp / copie / e-mail.
   Tout texte saisi est affiché avec textContent (pas de faille XSS).
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  if (typeof TARIFS === "undefined" || typeof Outils === "undefined") return;

  const SERVICES = TARIFS.services;
  const $ = (sel, racine = document) => racine.querySelector(sel);
  const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));

  /* Petit constructeur d'éléments : el("p", {class: "x"}, "texte") */
  function el(balise, attributs = {}, ...enfants) {
    const noeud = document.createElement(balise);
    Object.entries(attributs).forEach(([cle, valeur]) => {
      if (valeur === null || valeur === undefined || valeur === false) return;
      if (cle === "class") noeud.className = valeur;
      else if (cle === "text") noeud.textContent = valeur;
      else noeud.setAttribute(cle, valeur === true ? "" : valeur);
    });
    enfants.flat().forEach((enfant) => {
      if (enfant === null || enfant === undefined) return;
      noeud.append(enfant instanceof Node ? enfant : document.createTextNode(String(enfant)));
    });
    return noeud;
  }

  /* ---------- État ---------- */
  let serviceId = null;
  let etape = 1;
  let numero = "";

  const ecranCatalogue = $("#ecran-catalogue");
  const ecranFormulaire = $("#ecran-formulaire");
  const zoneQuestions = $("#questions");
  const form = $("#form-commande");

  /* =========================================================
     Prix
     ========================================================= */

  /** Prix d'un choix : { min, max, surDevis, aPartirDe } */
  function prixChoix(choix) {
    if (!choix || !("prix" in choix)) return null;
    if (choix.prix === null) return { min: 0, max: 0, surDevis: true, aPartirDe: false };
    const [min, max] = choix.prix;
    return { min, max: max === null ? min : max, surDevis: false, aPartirDe: max === null };
  }

  /** Format d'un prix pour l'affichage ou le message */
  function texteFourchette(min, max, { aPartirDe = false, surDevis = false, mensuel = false } = {}) {
    const suffixe = mensuel ? " / mois" : "";
    if (surDevis && min === 0) return "Sur devis";
    let texte;
    if (aPartirDe) texte = `À partir de ${Outils.formatFCFA(min)}`;
    else if (min === max) texte = Outils.formatFCFA(min);
    else texte = `Entre ${Outils.formatFCFA(min)} et ${Outils.formatFCFA(max)}`;
    return texte + suffixe + (surDevis ? " + éléments sur devis" : "");
  }

  /** Prix « catalogue » minimum d'un service (pour les cartes du catalogue) */
  function prixDepart(service) {
    const minimums = [];
    service.questions.forEach((q) => {
      if (q.type !== "choix" || !q.requis) return;
      const valeurs = (q.choix || []).map(prixChoix).filter((p) => p && !p.surDevis).map((p) => p.min);
      if (valeurs.length) minimums.push(Math.min(...valeurs));
    });
    return minimums.length ? minimums.reduce((a, b) => a + b, 0) : null;
  }

  /** Calcule l'estimation à partir des réponses */
  function calculer(service, reponses) {
    let min = 0;
    let max = 0;
    let surDevis = false;
    let aPartirDe = false;
    let mensuel = Boolean(service.mensuel);
    let multiplicateur = 1;
    const lignes = [];

    service.questions.forEach((q) => {
      const r = reponses[q.id];
      if (q.type === "choix" && r) {
        const choix = q.choix.find((c) => c.id === r);
        const p = prixChoix(choix);
        if (p && (p.min > 0 || p.surDevis)) {
          min += p.min; max += p.max;
          surDevis = surDevis || p.surDevis;
          aPartirDe = aPartirDe || p.aPartirDe;
          lignes.push({ label: choix.label, prix: p });
        }
        if (choix && choix.mensuel) mensuel = true;
      } else if (q.type === "options" && Array.isArray(r)) {
        r.forEach((id) => {
          const choix = q.choix.find((c) => c.id === id);
          const p = prixChoix(choix);
          if (p && (p.min > 0 || p.surDevis)) {
            min += p.min; max += p.max;
            surDevis = surDevis || p.surDevis;
            aPartirDe = aPartirDe || p.aPartirDe;
            lignes.push({ label: choix.label, prix: p });
          }
        });
      } else if (q.type === "nombre" && q.multiplie) {
        const n = Math.max(q.min || 1, Math.min(q.max || 99, parseInt(r, 10) || q.defaut || 1));
        if (n > 1) lignes.push({ label: `× ${n} (${q.label.replace(/\s*\?$/, "").toLowerCase()})`, multiplicateur: n });
        multiplicateur *= n;
      }
    });

    return { min: min * multiplicateur, max: max * multiplicateur, surDevis, aPartirDe, mensuel, multiplicateur, lignes };
  }

  /* =========================================================
     Catalogue
     ========================================================= */

  function afficherCatalogue() {
    const zone = $("#catalogue");
    zone.replaceChildren();
    const groupes = {};
    Object.entries(SERVICES).forEach(([id, s]) => {
      (groupes[s.groupe] = groupes[s.groupe] || []).push([id, s]);
    });
    Object.entries(groupes).forEach(([nomGroupe, liste]) => {
      const grille = el("ul", { class: "tool-grid catalogue-grille" });
      liste.forEach(([id, s]) => {
        const depart = prixDepart(s);
        const lien = el("a", { class: "catalogue-carte", href: `?service=${id}`, "data-service": id },
          el("span", { class: "tool-icon" }, el("i", { class: `fa-solid ${s.icone}`, "aria-hidden": "true" })),
          el("span", { class: "catalogue-texte" },
            el("strong", { text: s.titre }),
            el("span", { text: s.resume }),
            el("span", { class: "catalogue-meta" },
              depart ? el("span", { class: "badge", text: `Dès ${Outils.formatFCFA(depart)}${s.mensuel ? " / mois" : ""}` }) : el("span", { class: "badge", text: "Sur devis" }),
              el("span", { class: "badge badge-neutral", text: s.delai })
            )
          ),
          el("i", { class: "fa-solid fa-chevron-right catalogue-fleche", "aria-hidden": "true" })
        );
        lien.addEventListener("click", (e) => {
          e.preventDefault();
          ouvrirService(id);
        });
        grille.append(el("li", {}, lien));
      });
      zone.append(el("h2", { class: "catalogue-groupe", text: nomGroupe }), grille);
    });
  }

  /* =========================================================
     Questions du service
     ========================================================= */

  function champQuestion(q) {
    const idChamp = `q-${q.id}`;
    const erreur = el("p", { class: "field-error", id: `${idChamp}-err` });
    const aide = q.aide ? el("p", { class: "hint", text: q.aide }) : null;
    const etoile = q.requis ? el("span", { class: "req", "aria-hidden": "true", text: " *" }) : null;

    if (q.type === "info") {
      return el("p", { class: "cmd-info" }, el("i", { class: "fa-solid fa-circle-info", "aria-hidden": "true" }), " ", q.texte);
    }

    if (q.type === "choix" || q.type === "options") {
      const multiple = q.type === "options";
      const avecPrix = q.choix.some((c) => "prix" in c);
      const liste = el("div", { class: `choix-liste${avecPrix ? " choix-cartes" : " choix-pastilles"}` });
      q.choix.forEach((c) => {
        const p = prixChoix(c);
        const input = el("input", { type: multiple ? "checkbox" : "radio", name: idChamp, value: c.id });
        const contenu = el("span", { class: "choix-contenu" },
          el("span", { class: "choix-label", text: c.label }),
          c.detail ? el("span", { class: "choix-detail", text: c.detail }) : null
        );
        const prix = avecPrix && p
          ? el("span", { class: "choix-prix", text: p.surDevis ? "Sur devis" : (p.min === 0 && p.max === 0 ? "Inclus" : (multiple ? "+ " : "") + texteFourchette(p.min, p.max, { aPartirDe: p.aPartirDe, mensuel: Boolean(c.mensuel) }).replace(/^Entre /, "").replace(" et ", " – ")) })
          : null;
        liste.append(el("label", { class: "choix" }, input, contenu, prix));
      });
      return el("fieldset", { class: "field cmd-question", "data-question": q.id, "aria-describedby": `${idChamp}-err` },
        el("legend", {}, q.label, etoile), aide, liste, erreur);
    }

    if (q.type === "nombre") {
      const input = el("input", { type: "number", id: idChamp, name: idChamp, min: q.min || 1, max: q.max || 99, value: q.defaut || 1, inputmode: "numeric" });
      const moins = el("button", { type: "button", class: "stepper-btn", "aria-label": "Diminuer" }, "−");
      const plus = el("button", { type: "button", class: "stepper-btn", "aria-label": "Augmenter" }, "+");
      const borne = (delta) => {
        const v = Math.max(q.min || 1, Math.min(q.max || 99, (parseInt(input.value, 10) || 1) + delta));
        input.value = v;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      moins.addEventListener("click", () => borne(-1));
      plus.addEventListener("click", () => borne(1));
      return el("div", { class: "field cmd-question", "data-question": q.id },
        el("label", { for: idChamp }, q.label, etoile), aide, el("div", { class: "stepper" }, moins, input, plus), erreur);
    }

    const zone = q.type === "zone";
    const input = el(zone ? "textarea" : "input", { id: idChamp, name: idChamp, type: zone ? null : "text", "aria-describedby": `${idChamp}-err` });
    return el("div", { class: "field cmd-question", "data-question": q.id },
      el("label", { for: idChamp }, q.label, etoile), aide, input, erreur);
  }

  function lireReponses(service) {
    const reponses = {};
    service.questions.forEach((q) => {
      const nom = `q-${q.id}`;
      if (q.type === "choix") reponses[q.id] = ($(`input[name="${nom}"]:checked`, form) || {}).value || "";
      else if (q.type === "options") reponses[q.id] = $$(`input[name="${nom}"]:checked`, form).map((i) => i.value);
      else if (q.type !== "info") reponses[q.id] = (($(`#${nom}`, form) || {}).value || "").trim();
    });
    return reponses;
  }

  function remplirReponses(service, reponses) {
    service.questions.forEach((q) => {
      const r = reponses[q.id];
      const nom = `q-${q.id}`;
      if (r === undefined) return;
      if (q.type === "choix") $$(`input[name="${nom}"]`, form).forEach((i) => { i.checked = i.value === r; });
      else if (q.type === "options") $$(`input[name="${nom}"]`, form).forEach((i) => { i.checked = Array.isArray(r) && r.includes(i.value); });
      else if ($(`#${nom}`, form)) $(`#${nom}`, form).value = r;
    });
  }

  /* ---------- Brouillon (gardé sur le téléphone du client) ---------- */
  const CHAMPS_CLIENT = ["nom", "tel", "entreprise", "ville", "quand", "message"];
  function lireClient() {
    const c = {};
    CHAMPS_CLIENT.forEach((k) => { c[k] = ($(`#c-${k}`).value || "").trim(); });
    return c;
  }
  function sauver() {
    if (!serviceId) return;
    Outils.stockage.ecrire(`commande:${serviceId}`, lireReponses(SERVICES[serviceId]));
    Outils.stockage.ecrire("commande:client", lireClient());
  }
  function restaurerClient() {
    const c = Outils.stockage.lire("commande:client", null);
    if (!c) return;
    CHAMPS_CLIENT.forEach((k) => { if (c[k]) $(`#c-${k}`).value = c[k]; });
  }

  /* =========================================================
     Navigation entre écrans et étapes
     ========================================================= */

  function ouvrirService(id, { remplacer = false } = {}) {
    const service = SERVICES[id];
    if (!service) return;
    serviceId = id;
    numero = "";
    $("#service-titre").textContent = service.titre;
    $("#service-resume").textContent = `${service.resume} Délai : ${service.delai}.`;
    $("#service-icone").className = `fa-solid ${service.icone}`;
    zoneQuestions.replaceChildren(...service.questions.map(champQuestion));
    remplirReponses(service, Outils.stockage.lire(`commande:${id}`, {}));
    restaurerClient();
    ecranCatalogue.hidden = true;
    ecranFormulaire.hidden = false;
    document.title = `${service.titre} — Demande de devis — Mr Doamba`;
    const url = `${location.pathname}?service=${id}`;
    if (remplacer) history.replaceState({ service: id }, "", url);
    else history.pushState({ service: id }, "", url);
    allerEtape(1, { defiler: false });
    window.scrollTo({ top: 0 });
  }

  function retourCatalogue({ pousser = true } = {}) {
    serviceId = null;
    ecranFormulaire.hidden = true;
    ecranCatalogue.hidden = false;
    document.title = "Demande de devis — Mr Doamba, graphiste à Ouagadougou";
    if (pousser) history.pushState({}, "", location.pathname);
    window.scrollTo({ top: 0 });
  }

  function allerEtape(n, { defiler = true } = {}) {
    etape = n;
    $$(".cmd-etape", form).forEach((bloc) => { bloc.hidden = Number(bloc.dataset.etape) !== n; });
    $$(".cmd-steps li").forEach((li) => {
      const k = Number(li.dataset.etape);
      li.classList.toggle("actif", k === n);
      li.classList.toggle("fait", k < n);
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    if (n === 3) afficherEstimation();
    if (defiler) $(".cmd-head").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  /* ---------- Validation ---------- */
  function marquerErreur(conteneur, message) {
    const err = $(".field-error", conteneur);
    if (err) err.textContent = message;
    conteneur.classList.toggle("has-error", Boolean(message));
  }

  function validerEtape1() {
    const service = SERVICES[serviceId];
    const reponses = lireReponses(service);
    let premier = null;
    service.questions.forEach((q) => {
      const bloc = $(`[data-question="${q.id}"]`, form);
      if (!bloc) return;
      const vide = Array.isArray(reponses[q.id]) ? reponses[q.id].length === 0 : !reponses[q.id];
      const manque = q.requis && vide;
      marquerErreur(bloc, manque ? (q.type === "choix" ? "Choisissez une réponse." : "Ce champ est nécessaire.") : "");
      if (manque && !premier) premier = bloc;
    });
    if (premier) premier.scrollIntoView({ behavior: "smooth", block: "center" });
    return !premier;
  }

  function validerEtape2() {
    const nom = $("#c-nom");
    const tel = $("#c-tel");
    const okNom = nom.value.trim().length >= 2;
    const okTel = Boolean(Outils.normaliserTelephone(tel.value));
    marquerErreur(nom.closest(".field"), okNom ? "" : "Indiquez votre nom.");
    marquerErreur(tel.closest(".field"), okTel ? "" : "Numéro invalide : 8 chiffres, ex. 70 12 34 56.");
    if (okTel) tel.value = Outils.formatTelephone(tel.value);
    if (!okNom) nom.focus(); else if (!okTel) tel.focus();
    return okNom && okTel;
  }

  /* =========================================================
     Estimation et message
     ========================================================= */

  function nouveauNumero() {
    const d = new Date();
    const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const hasard = String(Math.floor(Math.random() * 9000) + 1000);
    return `DEM-${date}-${hasard}`;
  }

  /** Réponses lisibles : [{ question, reponse }] */
  function reponsesLisibles(service, reponses) {
    const sortie = [];
    service.questions.forEach((q) => {
      const r = reponses[q.id];
      if (q.type === "info" || r === undefined || r === "" || (Array.isArray(r) && !r.length)) return;
      let texte;
      if (q.type === "choix") texte = (q.choix.find((c) => c.id === r) || {}).label || r;
      else if (q.type === "options") texte = r.map((id) => (q.choix.find((c) => c.id === id) || {}).label || id).join(", ");
      else texte = String(r);
      sortie.push({ question: q.label.replace(/\s*\?$/, ""), reponse: texte });
    });
    return sortie;
  }

  function construireMessage(service, reponses, client, est) {
    const prix = texteFourchette(est.min, est.max, est);
    const lignes = [
      `*Demande de devis : ${service.titre}*`,
      `N° ${numero} · ${Outils.formatDate()}`,
      "",
      "👤 *Client*",
      `Nom : ${client.nom}`,
      `WhatsApp : ${client.tel}`
    ];
    if (client.entreprise) lignes.push(`Entreprise : ${client.entreprise}`);
    if (client.ville) lignes.push(`Ville : ${client.ville}`);
    lignes.push(`Pour quand : ${client.quand}`, "", "🎨 *Projet*");
    reponsesLisibles(service, reponses).forEach(({ question, reponse }) => lignes.push(`${question} : ${reponse}`));
    lignes.push("", `💰 *Estimation : ${prix}*`, `Délai indicatif : ${service.delai}`);
    if (client.message) lignes.push("", "📝 *Message*", client.message);
    return lignes.join("\n");
  }

  function afficherEstimation() {
    const service = SERVICES[serviceId];
    const reponses = lireReponses(service);
    const client = lireClient();
    const est = calculer(service, reponses);
    if (!numero) numero = nouveauNumero();

    $("#est-prix").textContent = texteFourchette(est.min, est.max, est);
    const acompte = TARIFS.acompte;
    let sous = `Délai indicatif : ${service.delai}`;
    if (!est.surDevis && est.min > 0 && acompte) {
      const aMin = Math.round(est.min * acompte / 100 / 500) * 500;
      const aMax = Math.round(est.max * acompte / 100 / 500) * 500;
      const aTexte = est.aPartirDe || aMin === aMax ? Outils.formatFCFA(aMin) : `${Outils.formatFCFA(aMin)} à ${Outils.formatFCFA(aMax)}`;
      sous += ` · Acompte à la commande (${acompte} %) : ${est.aPartirDe ? "dès " : ""}${aTexte}`;
    }
    $("#est-sous").textContent = sous;

    // Détail du calcul
    const ul = $("#recap-lignes");
    ul.replaceChildren(...est.lignes.map((l) => el("li", {},
      el("span", { text: l.label }),
      el("span", { class: "recap-montant", text: l.multiplicateur ? "" : (l.prix.surDevis ? "Sur devis" : texteFourchette(l.prix.min, l.prix.max, { aPartirDe: l.prix.aPartirDe }).replace(/^Entre /, "").replace(" et ", " – ")) })
    )));

    // Récapitulatif
    const dl = $("#recap");
    dl.replaceChildren();
    [["Service", service.titre], ["N° de demande", numero], ["Nom", client.nom], ["WhatsApp", client.tel]].concat(
      reponsesLisibles(service, reponses).map((x) => [x.question, x.reponse])
    ).forEach(([k, v]) => dl.append(el("div", {}, el("dt", { text: k }), el("dd", { text: v }))));

    const message = construireMessage(service, reponses, client, est);
    const { url, tropLong } = Outils.lienWhatsApp(message);
    $("#btn-whatsapp").href = url;
    $("#btn-email").href = Outils.lienEmail(`Demande de devis ${numero} : ${service.titre}`, message.replace(/\*/g, ""));
    $("#btn-copier").dataset.message = message;
    $("#btn-copier").classList.toggle("button-primary", tropLong);
  }

  /* =========================================================
     Événements
     ========================================================= */

  form.addEventListener("click", (e) => {
    const suivant = e.target.closest("[data-suivant]");
    const precedent = e.target.closest("[data-precedent]");
    if (suivant) {
      const cible = Number(suivant.dataset.suivant);
      if (cible === 2 && !validerEtape1()) return;
      if (cible === 3 && !validerEtape2()) return;
      sauver();
      allerEtape(cible);
    } else if (precedent) {
      allerEtape(Number(precedent.dataset.precedent));
    }
  });

  form.addEventListener("input", (e) => {
    const bloc = e.target.closest(".has-error");
    if (bloc) marquerErreur(bloc, "");
    sauver();
  });
  form.addEventListener("change", sauver);
  form.addEventListener("submit", (e) => e.preventDefault());

  $("#btn-copier").addEventListener("click", async (e) => {
    const ok = await Outils.copierTexte(e.currentTarget.dataset.message || "");
    Outils.toast(ok ? "Message copié. Collez-le dans WhatsApp." : "La copie a échoué. Sélectionnez le texte à la main.");
  });

  $("#btn-whatsapp").addEventListener("click", () => Outils.toast("WhatsApp s'ouvre : appuyez sur Envoyer pour me transmettre la demande."));

  $("#btn-nouvelle").addEventListener("click", () => {
    Outils.stockage.supprimer(`commande:${serviceId}`);
    numero = "";
    retourCatalogue();
  });

  $("#retour-catalogue").addEventListener("click", () => retourCatalogue());

  window.addEventListener("popstate", () => {
    const id = Outils.lireParametre("service", /^[a-z]{2,30}$/);
    if (id && SERVICES[id]) ouvrirService(id, { remplacer: true });
    else retourCatalogue({ pousser: false });
  });

  /* ---------- Démarrage ---------- */
  afficherCatalogue();
  const depart = Outils.lireParametre("service", /^[a-z]{2,30}$/);
  if (depart && SERVICES[depart]) ouvrirService(depart, { remplacer: true });
});
