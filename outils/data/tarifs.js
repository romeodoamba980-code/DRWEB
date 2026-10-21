/* =========================================================
   Boîte à outils Mr Doamba — CATALOGUE DES SERVICES ET TARIFS
   ---------------------------------------------------------
   C'est le SEUL fichier à modifier pour changer un prix, une
   question ou un service. La page commande.html le lit.

   Comment ça marche :
   - Chaque service a des « questions ».
   - Une question de type "choix" (une seule réponse) ou "options"
     (plusieurs réponses possibles) peut avoir un prix par réponse :
       prix: [minimum, maximum]   -> ex. [50000, 80000]
       prix: [30000, 30000]       -> prix fixe
       prix: [30000, null]        -> « à partir de 30 000 FCFA »
       prix: null                 -> sur devis (pas de prix affiché)
   - Une question "nombre" avec multiplie: true multiplie le total
     (ex. nombre d'affiches, nombre de mois).
   - Les autres questions (texte, couleurs, style…) ne changent pas
     le prix : elles servent à préparer le travail.
   Le client voit à la fin : « entre MIN et MAX FCFA ».
   ========================================================= */
"use strict";

const TARIFS = Object.freeze({
  acompte: 60, // pourcentage demandé à la commande

  services: {
    /* ---------------- Création graphique ---------------- */
    logo: {
      titre: "Logo / identité visuelle",
      icone: "fa-pen-nib",
      groupe: "Création graphique",
      resume: "Un logo qui représente votre activité, livré dans tous les formats.",
      delai: "3 jours",
      questions: [
        { id: "formule", type: "choix", label: "Que souhaitez-vous ?", requis: true, choix: [
          { id: "simple", label: "Logo simple", detail: "Logo + version noir et blanc, fichiers PNG, JPG et PDF", prix: [50000, 80000] },
          { id: "declinaisons", label: "Logo + déclinaisons", detail: "Logo, icône seule, versions couleur / noir / blanc, fichiers sources", prix: [80000, 120000] },
          { id: "identite", label: "Identité complète", detail: "Logo + déclinaisons + carte de visite + en-tête de lettre", prix: [120000, 150000] }
        ] },
        { id: "existant", type: "choix", label: "Avez-vous déjà un logo ?", requis: true, choix: [
          { id: "non", label: "Non, c'est une création" },
          { id: "refonte", label: "Oui, je veux le moderniser" }
        ] },
        { id: "extras", type: "options", label: "Options", choix: [
          { id: "anime", label: "Logo animé (pour vidéos et statuts)", prix: [25000, 50000] },
          { id: "mockups", label: "Présentation sur supports (t-shirt, enseigne, véhicule)", prix: [10000, 20000] }
        ] },
        { id: "secteur", type: "texte", label: "Quelle est votre activité ?", aide: "Ex. boutique de pagnes, entreprise de BTP, salon de coiffure…", requis: true },
        { id: "nom_marque", type: "texte", label: "Nom à écrire dans le logo", requis: true },
        { id: "couleurs", type: "texte", label: "Couleurs souhaitées ou à éviter", aide: "Laissez vide si vous me faites confiance" },
        { id: "style", type: "choix", label: "Style préféré", choix: [
          { id: "moderne", label: "Moderne et épuré" },
          { id: "africain", label: "Africain contemporain" },
          { id: "luxe", label: "Élégant / luxe" },
          { id: "ludique", label: "Coloré / ludique" },
          { id: "libre", label: "Je vous laisse proposer" }
        ] }
      ]
    },

    affiche: {
      titre: "Affiche / flyer",
      icone: "fa-image",
      groupe: "Création graphique",
      resume: "Des visuels pour vos événements, promotions et réseaux sociaux.",
      delai: "24 à 48 h",
      questions: [
        { id: "type", type: "choix", label: "Type de visuel", requis: true, choix: [
          { id: "simple", label: "Visuel simple", detail: "Promotion, annonce, peu de texte", prix: [10000, 15000] },
          { id: "complet", label: "Affiche complète", detail: "Événement, programme, beaucoup d'informations", prix: [15000, 25000] }
        ] },
        { id: "quantite", type: "nombre", label: "Combien de visuels différents ?", min: 1, max: 30, defaut: 1, multiplie: true },
        { id: "extras", type: "options", label: "Options (par visuel)", choix: [
          { id: "statut", label: "Version statut WhatsApp (vertical)", prix: [3000, 5000] },
          { id: "post", label: "Version post Facebook / Instagram (carré)", prix: [3000, 5000] }
        ] },
        { id: "usage", type: "choix", label: "Où sera-t-il utilisé ?", choix: [
          { id: "reseaux", label: "Réseaux sociaux uniquement" },
          { id: "impression", label: "Impression" },
          { id: "les_deux", label: "Les deux" }
        ] },
        { id: "contenu", type: "zone", label: "Textes à mettre sur le visuel", aide: "Titre, date, lieu, prix, contacts…", requis: true }
      ]
    },

    carte: {
      titre: "Carte de visite",
      icone: "fa-address-card",
      groupe: "Création graphique",
      resume: "Une carte professionnelle prête à imprimer.",
      delai: "24 à 48 h",
      questions: [
        { id: "faces", type: "choix", label: "Format", requis: true, choix: [
          { id: "recto", label: "Recto seul", prix: [5000, 8000] },
          { id: "recto_verso", label: "Recto-verso", prix: [8000, 15000] }
        ] },
        { id: "logo", type: "choix", label: "Avez-vous un logo ?", requis: true, choix: [
          { id: "oui", label: "Oui, je l'envoie après" },
          { id: "non", label: "Non, une carte sans logo" }
        ] },
        { id: "infos", type: "zone", label: "Informations à mettre sur la carte", aide: "Nom, fonction, téléphone, e-mail, adresse…", requis: true }
      ]
    },

    charte: {
      titre: "Charte graphique",
      icone: "fa-swatchbook",
      groupe: "Création graphique",
      resume: "Les règles de votre image : couleurs, polices, logo, supports.",
      delai: "1 semaine",
      questions: [
        { id: "formule", type: "choix", label: "Formule", requis: true, choix: [
          { id: "base", label: "Charte à partir de mon logo existant", detail: "Couleurs, polices, règles d'usage du logo, exemples", prix: [150000, 220000] },
          { id: "complete", label: "Charte complète avec création du logo", detail: "Logo + charte + papeterie + modèles réseaux sociaux", prix: [250000, 350000] }
        ] },
        { id: "supports", type: "options", label: "Supports à inclure (sans frais en plus)", choix: [
          { id: "papeterie", label: "Papeterie (carte, en-tête, enveloppe)" },
          { id: "reseaux", label: "Modèles réseaux sociaux" },
          { id: "signaletique", label: "Enseigne / signalétique" },
          { id: "vetements", label: "Tenues / goodies" }
        ] },
        { id: "secteur", type: "texte", label: "Quelle est votre activité ?", requis: true }
      ]
    },

    site: {
      titre: "Site web",
      icone: "fa-laptop-code",
      groupe: "Web et vidéo",
      resume: "Un site professionnel, rapide et beau sur téléphone.",
      delai: "2 à 4 semaines",
      questions: [
        { id: "type", type: "choix", label: "Type de site", requis: true, choix: [
          { id: "vitrine", label: "Site vitrine", detail: "3 à 5 pages : accueil, services, à propos, contact", prix: [250000, 400000] },
          { id: "complet", label: "Site complet", detail: "6 à 10 pages, galerie, actualités", prix: [400000, 600000] },
          { id: "boutique", label: "Site avec catalogue / boutique", detail: "Produits, prix, commande par WhatsApp", prix: [600000, 750000] }
        ] },
        { id: "extras", type: "options", label: "Options", choix: [
          { id: "redaction", label: "Rédaction des textes par mes soins", prix: [25000, 50000] },
          { id: "logo", label: "Création du logo en plus", prix: [50000, 80000] }
        ] },
        { id: "exemple", type: "texte", label: "Un site que vous aimez (lien)", aide: "Facultatif" },
        { id: "activite", type: "zone", label: "Décrivez votre activité et ce que le site doit faire", requis: true }
      ]
    },

    video: {
      titre: "Montage vidéo",
      icone: "fa-clapperboard",
      groupe: "Web et vidéo",
      resume: "Vos images transformées en vidéo dynamique.",
      delai: "5 jours",
      questions: [
        { id: "duree", type: "choix", label: "Durée de la vidéo finale", requis: true, choix: [
          { id: "court", label: "Moins d'1 minute", detail: "Statut, publicité courte", prix: [25000, 40000] },
          { id: "moyen", label: "1 à 3 minutes", prix: [40000, 70000] },
          { id: "long", label: "3 à 5 minutes", prix: [70000, 100000] },
          { id: "plus", label: "Plus de 5 minutes", prix: null }
        ] },
        { id: "extras", type: "options", label: "Options", choix: [
          { id: "soustitres", label: "Sous-titres", prix: [5000, 10000] },
          { id: "formats", label: "Version verticale (statut, TikTok) en plus", prix: [5000, 10000] }
        ] },
        { id: "rushes", type: "choix", label: "Avez-vous déjà les vidéos à monter ?", requis: true, choix: [
          { id: "oui", label: "Oui, je les envoie" },
          { id: "non", label: "Non, il faut filmer" }
        ] },
        { id: "but", type: "zone", label: "À quoi servira la vidéo ?", requis: true }
      ]
    },

    motion: {
      titre: "Motion design",
      icone: "fa-wand-magic-sparkles",
      groupe: "Web et vidéo",
      resume: "Animations, logos animés et vidéos explicatives.",
      delai: "5 jours",
      questions: [
        { id: "type", type: "choix", label: "Type d'animation", requis: true, choix: [
          { id: "logo", label: "Logo animé", detail: "5 à 10 secondes", prix: [50000, 70000] },
          { id: "promo", label: "Vidéo promotionnelle", detail: "Environ 30 secondes", prix: [70000, 110000] },
          { id: "explicative", label: "Vidéo explicative", detail: "Environ 1 minute", prix: [110000, 150000] }
        ] },
        { id: "extras", type: "options", label: "Options", choix: [
          { id: "voix", label: "Voix off", prix: null },
          { id: "formats", label: "Version verticale en plus", prix: [10000, 15000] }
        ] },
        { id: "message", type: "zone", label: "Que doit dire ou montrer l'animation ?", requis: true }
      ]
    },

    reseaux: {
      titre: "Gestion des réseaux sociaux",
      icone: "fa-chart-line",
      groupe: "Web et vidéo",
      resume: "Vos pages animées chaque mois, sans vous en occuper.",
      delai: "Démarrage sous 1 semaine",
      mensuel: true,
      questions: [
        { id: "formule", type: "choix", label: "Formule mensuelle", requis: true, choix: [
          { id: "essentiel", label: "Essentiel", detail: "8 publications par mois", prix: [75000, 120000] },
          { id: "standard", label: "Standard", detail: "15 publications + statuts", prix: [120000, 180000] },
          { id: "premium", label: "Premium", detail: "30 publications + gestion des publicités", prix: [180000, 250000] }
        ] },
        { id: "mois", type: "nombre", label: "Pour combien de mois ?", min: 1, max: 12, defaut: 1, multiplie: true },
        { id: "pages", type: "options", label: "Réseaux à gérer", choix: [
          { id: "facebook", label: "Facebook" },
          { id: "instagram", label: "Instagram" },
          { id: "tiktok", label: "TikTok" },
          { id: "whatsapp", label: "Statuts WhatsApp" }
        ] }
      ]
    },

    /* ---------------- Mes produits (logiciels et outils à acheter) ----------------
       Prix pas encore fixés : prix: null affiche « Sur devis ».
       Quand le prix est décidé, remplacer null par [prix, prix] (ex. [15000, 15000]). */
    afficheminute: {
      titre: "Affiche Minute — plugin Photoshop",
      icone: "fa-bolt",
      groupe: "Mes produits",
      resume: "Un plugin à installer dans Photoshop pour créer vos affiches plus vite.",
      delai: "Envoi après paiement",
      questions: [
        { id: "formule", type: "choix", label: "Votre achat", requis: true, choix: [
          { id: "plugin", label: "Plugin Affiche Minute", detail: "[À COMPLÉTER] contenu exact du plugin", prix: null }
        ] },
        { id: "photoshop", type: "texte", label: "Votre version de Photoshop", aide: "Ex. Photoshop 2023, 2024…", requis: true },
        { id: "systeme", type: "choix", label: "Votre ordinateur", requis: true, choix: [
          { id: "windows", label: "Windows" },
          { id: "mac", label: "Mac" }
        ] }
      ]
    },

    atelierlogo: {
      titre: "Atelier de logo",
      icone: "fa-pen-ruler",
      groupe: "Mes produits",
      resume: "Mon atelier pour créer et décliner un logo, en cours d'amélioration.",
      delai: "[À COMPLÉTER]",
      questions: [
        { id: "formule", type: "choix", label: "Votre achat", requis: true, choix: [
          { id: "atelier", label: "Atelier de logo", detail: "[À COMPLÉTER] ce qui est inclus", prix: null }
        ] },
        { id: "message", type: "zone", label: "Une question ou une précision ?" }
      ]
    },

    /* ---------------- Mes offres ---------------- */
    packs: {
      titre: "Pack de templates",
      icone: "fa-layer-group",
      groupe: "Mes offres",
      resume: "Statuts WhatsApp, posts Facebook et carte de visite pour votre secteur.",
      delai: "24 à 72 h",
      questions: [
        { id: "formule", type: "choix", label: "Formule", requis: true, choix: [
          { id: "mini", label: "Mini pack", detail: "5 visuels", prix: [5000, 25000] },
          { id: "complet", label: "Pack complet", detail: "10 statuts WhatsApp + 10 posts Facebook + 1 carte de visite", prix: [25000, 75000] },
          { id: "premium", label: "Pack premium sur mesure", detail: "Contenu adapté à vos besoins", prix: [75000, 200000] },
          { id: "abonnement", label: "Abonnement mensuel", detail: "15 nouveaux visuels chaque mois", prix: [50000, 50000], mensuel: true }
        ] },
        { id: "secteur", type: "choix", label: "Votre secteur", requis: true, choix: [
          { id: "btp", label: "BTP" }, { id: "boutique", label: "Boutique" }, { id: "restaurant", label: "Restaurant" },
          { id: "ecole", label: "École" }, { id: "eglise", label: "Église" }, { id: "beaute", label: "Beauté / coiffure" },
          { id: "evenementiel", label: "Événementiel" }, { id: "sante", label: "Santé / pharmacie" },
          { id: "immobilier", label: "Immobilier" }, { id: "ong", label: "ONG / association" }, { id: "autre", label: "Autre" }
        ] },
        { id: "extras", type: "options", label: "Options", choix: [
          { id: "couleurs", label: "Personnalisé à mes couleurs et mon logo", prix: [14500, 14500] }
        ] }
      ]
    },

    minisite: {
      titre: "Mini-site express",
      icone: "fa-bolt",
      groupe: "Mes offres",
      resume: "Votre entreprise visible sur Internet en 48 h.",
      delai: "48 h",
      questions: [
        { id: "formule", type: "choix", label: "Formule", requis: true, choix: [
          { id: "essentiel", label: "Essentiel", detail: "1 page, logo, services, bouton WhatsApp, carte, mise en ligne sur une adresse gratuite", prix: [100000, 100000] },
          { id: "pro", label: "Pro", detail: "Tout l'Essentiel + galerie, plusieurs pages, nom de domaine (.com ou .bf) inclus", prix: [225000, 225000] }
        ] },
        { id: "hebergement", type: "info", texte: "Hébergement inclus 1 an, puis 10 000 FCFA par an. Modifications gratuites pendant 3 jours, puis 5 000 FCFA." },
        { id: "logo", type: "choix", label: "Avez-vous un logo ?", requis: true, choix: [
          { id: "oui", label: "Oui" },
          { id: "non", label: "Non" }
        ] },
        { id: "activite", type: "zone", label: "Présentez votre entreprise en quelques mots", requis: true }
      ]
    },

    motiontemplate: {
      titre: "Motion template",
      icone: "fa-film",
      groupe: "Mes offres",
      resume: "Une animation After Effects prête à l'emploi, ou adaptée pour vous.",
      delai: "48 à 72 h",
      questions: [
        { id: "formule", type: "choix", label: "Que voulez-vous ?", requis: true, choix: [
          { id: "fichier", label: "Le fichier template", detail: "Vous le modifiez vous-même dans After Effects", prix: [30000, null] },
          { id: "adaptation", label: "Je l'adapte pour vous", detail: "Vos textes, logo et couleurs, vidéo finale livrée", prix: [40000, 40000] }
        ] },
        { id: "theme", type: "choix", label: "Type d'animation", requis: true, choix: [
          { id: "promo", label: "Promotion" }, { id: "evenement", label: "Annonce d'événement" },
          { id: "inauguration", label: "Inauguration" }, { id: "intro", label: "Intro de logo" }, { id: "reseaux", label: "Réseaux sociaux" }
        ] }
      ]
    },

    formation: {
      titre: "Formation",
      icone: "fa-graduation-cap",
      groupe: "Mes offres",
      resume: "Apprendre à communiquer pour son business : 8 séances de 2 h.",
      delai: "Selon le prochain groupe",
      questions: [
        { id: "format", type: "choix", label: "Format", requis: true, choix: [
          { id: "ligne", label: "En ligne", prix: [75000, null] },
          { id: "presentiel", label: "En présentiel (Ouagadougou)", prix: [75000, null] }
        ] },
        { id: "personnes", type: "nombre", label: "Nombre de personnes à inscrire", min: 1, max: 20, defaut: 1, multiplie: true },
        { id: "niveau", type: "choix", label: "Votre niveau", choix: [
          { id: "debutant", label: "Débutant" }, { id: "moyen", label: "J'ai quelques bases" }, { id: "avance", label: "Avancé" }
        ] },
        { id: "objectif", type: "zone", label: "Qu'aimeriez-vous apprendre ?" }
      ]
    }
  }
});
