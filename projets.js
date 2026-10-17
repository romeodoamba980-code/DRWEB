/* =========================================================
   TES RÉALISATIONS — c'est le SEUL endroit à modifier pour
   ajouter, retirer ou changer un projet.
   (Ce fichier est utilisé par index.html ET projet.html)

   Pour ajouter une réalisation, copie un bloc { ... },
   colle-le à la fin de la liste et mets une virgule entre deux blocs.

   - titre       : nom du projet
   - categorie   : "Affiches", "Branding", "Web", "Email", "Vidéo"…
                   (un nouveau filtre apparaît automatiquement)
   - description : (facultatif) quelques phrases sur le projet
   - images      : la 1re sert de miniature ; toutes s'affichent
                   sur la page du projet
   - youtube     : (facultatif) l'ID d'une vidéo YouTube
                   (la partie après "v=" dans le lien)
   ========================================================= */
const PROJETS = [
  {
    titre: "Projet personnel",
    categorie: "Branding",
    description: "",
    images: ["https://i.ibb.co/8Ldt2wKP/Whats-App-Image-2025-10-29-at-12-35-48-30d4f2db.jpg"]
  },
  {
    titre: "Affiche événement",
    categorie: "Affiches",
    description: "",
    images: ["https://i.ibb.co/Y7pM1s8J/week-enk-nov-z-1.jpg"]
  },
  {
    titre: "Affiche promotionnelle",
    categorie: "Affiches",
    description: "",
    images: ["https://i.ibb.co/1tX4ZGCY/RD-N-1.jpg"]
  },
  {
    titre: "Assiyah Délice",
    categorie: "Affiches",
    description: "",
    images: ["https://i.ibb.co/nqj6GKTP/assiyah-delice-1-AA.jpg"]
  },
  {
    titre: "Campagne email",
    categorie: "Email",
    description: "",
    images: ["https://i.ibb.co/fVmd60wG/EM.jpg"]
  },
  {
    titre: "Site web",
    categorie: "Web",
    description: "",
    images: ["https://i.ibb.co/P8bhRnR/rr-1p.jpg"]
  }
  // Exemple de vidéo : enlève les deux barres // au début de chaque ligne pour l'activer
  // ,{
  //   titre: "Vidéo promo",
  //   categorie: "Vidéo",
  //   description: "",
  //   images: ["LIEN_D_UNE_MINIATURE.jpg"],
  //   youtube: "ID_DE_LA_VIDEO"
  // }
];
