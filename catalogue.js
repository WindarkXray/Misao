/* =====================================================================
   CATALOGUE MISAO
   ---------------------------------------------------------------------
   1. SHOPIFY_STORE : le domaine de la boutique Shopify de la cliente
      (ex. "misao-epices.myshopify.com"), visible dans son admin Shopify.
   2. vid : l'identifiant de variante Shopify de chaque format.
      Admin Shopify > Produits > ouvrir le produit > cliquer sur la
      variante : le numéro à la fin de l'adresse est le vid.
   3. img : chemin d'une photo (ex. "img/poivre-kivu.jpg"). Laisser vide
      pour garder le sachet dessiné.
   Les prix « dès » viennent du site actuel misao.be. Les prix des
   autres formats sont à confirmer avec la cliente.
   ===================================================================== */

window.MISAO = {
  SHOPIFY_STORE: "VOTRE-BOUTIQUE.myshopify.com",

  categories: [
    { id: "misao",   nom: "Poivres & épices MISAO", court: "Épices MISAO" },
    { id: "melanges", nom: "Mélanges MISAO",        court: "Mélanges" },
    { id: "monde",   nom: "Poivres du monde",       court: "Poivres du monde" },
    { id: "ateliers", nom: "Masterclass & bons cadeaux", court: "Ateliers" }
  ],

  produits: [
    /* ---------- Nouveautés en précommande (récolte en cours) ---------- */
    {
      id: "kivu-blanc", cat: "misao", nom: "Poivre blanc sauvage du Kivu", shot: "poivre-kivu-blanc",
      origine: "Kivu · Est de la RD Congo", nouveau: true, precommande: true, badge: "Nouveau · Précommande",
      court: "Nouvelle récolte. Fin, élégant, légèrement musqué.",
      description: "La nouveauté de la saison : nos baies sauvages du Kivu, récoltées à pleine maturité puis débarrassées de leur peau pour révéler un poivre blanc fin et élégant. Récolte en cours : réservez votre part dès maintenant, elle vous est expédiée dès la fin de la récolte.",
      notes: ["Fin", "Musqué", "Élégant"], piquant: 2,
      accords: ["Poissons blancs", "Sauces crémeuses", "Purées", "Œufs", "Volailles"],
      couleur: "#e6dbc2", teinte: "#f3efe4",
      options: { "Format": ["20 g", "35 g", "100 g"] },
      variantes: [ { o: ["20 g"], prix: 8.50, vid: "" }, { o: ["35 g"], prix: 13.50, vid: "" }, { o: ["100 g"], prix: 32.00, vid: "" } ],
      img: ""
    },
    {
      id: "kivu-rouge", cat: "misao", nom: "Poivre rouge sauvage du Kivu", shot: "poivre-kivu-rouge",
      origine: "Kivu · Est de la RD Congo", nouveau: true, precommande: true, badge: "Nouveau · Précommande",
      court: "Nouvelle récolte. Fruité, intense, très rare.",
      description: "Les baies sauvages du Kivu cueillies bien rouges, à pleine maturité, puis séchées selon notre méthode. Un poivre rare, fruité et intense. Récolte en cours : réservez votre part dès maintenant, elle vous est expédiée dès la fin de la récolte.",
      notes: ["Fruité", "Intense", "Rare"], piquant: 3,
      accords: ["Viandes rouges", "Gibier", "Fraises", "Chocolat noir", "Fromages affinés"],
      couleur: "#8e2a1f", teinte: "#f3e3df",
      options: { "Format": ["20 g", "35 g", "100 g"] },
      variantes: [ { o: ["20 g"], prix: 8.50, vid: "" }, { o: ["35 g"], prix: 13.50, vid: "" }, { o: ["100 g"], prix: 32.00, vid: "" } ],
      img: ""
    },

    /* ---------- Épices MISAO (RD Congo) ---------- */
    {
      id: "poivre-kivu", cat: "misao", nom: "Poivre sauvage du Kivu", shot: "poivre-kivu-noir",
      origine: "Kivu · Est de la RD Congo", vedette: true, badge: "Signature",
      court: "Floral, notes de lavande, longue en bouche.",
      description: "Notre poivre emblématique. Il pousse à l'état sauvage dans les forêts denses du Kivu, où il est cueilli et trié à la main, puis séché selon notre propre méthode.",
      notes: ["Floral", "Lavande", "Délicat", "Longue en bouche"], piquant: 2,
      accords: ["Poissons", "Fromages blancs", "Grillades", "Salades de fruits", "Desserts au chocolat", "Soupes"],
      couleur: "#2a2320", teinte: "#e4e8df",
      options: { "Format": ["20 g", "35 g", "100 g"] },
      variantes: [ { o: ["20 g"], prix: 7.00, vid: "" }, { o: ["35 g"], prix: 11.00, vid: "" }, { o: ["100 g"], prix: 26.00, vid: "" } ],
      img: ""
    },
    {
      id: "poivre-equateur", cat: "misao", nom: "Poivre sauvage de l'Équateur",
      origine: "Province de l'Équateur · Ouest de la RD Congo", badge: "Sauvage",
      court: "Arômes subtils, cueilli à la main en forêt.",
      description: "Un poivre sauvage des forêts de l'ouest de la RD Congo, cueilli et trié à la main, puis séché avec un savoir-faire qui respecte le produit et son environnement.",
      notes: ["Subtil", "Boisé", "Rond"], piquant: 2,
      accords: ["Viandes blanches", "Légumes rôtis", "Sauces crémeuses"],
      couleur: "#3a2a22", teinte: "#e8e4da",
      options: { "Variété": ["Noir", "Rouge", "Blanc"], "Format": ["25 g", "50 g", "100 g"] },
      precommande: { "Variété": ["Blanc", "Rouge"] },
      variantes: [
        { o: ["Noir", "25 g"], prix: 7.00, vid: "" }, { o: ["Noir", "50 g"], prix: 13.00, vid: "" }, { o: ["Noir", "100 g"], prix: 24.00, vid: "" },
        { o: ["Rouge", "25 g"], prix: 8.50, vid: "" }, { o: ["Rouge", "50 g"], prix: 16.00, vid: "" }, { o: ["Rouge", "100 g"], prix: 30.00, vid: "" },
        { o: ["Blanc", "25 g"], prix: 8.50, vid: "" }, { o: ["Blanc", "50 g"], prix: 16.00, vid: "" }, { o: ["Blanc", "100 g"], prix: 30.00, vid: "" }
      ],
      img: ""
    },
    {
      id: "cannelle-congo", cat: "misao", nom: "Cannelle du Congo",
      origine: "Bas-Congo · RD Congo", vedette: true,
      court: "Douce et délicate, 100 % naturelle.",
      description: "Une cannelle brute du Bas-Congo, que l'on surnomme là-bas l'écorce de l'arbre du bonheur. Naturelle, conditionnée à la main, avec une douceur que les gourmands adorent.",
      notes: ["Douce", "Délicate", "Gourmande"], piquant: 0,
      accords: ["Plats mijotés", "Desserts", "Boissons chaudes", "Vin chaud"],
      couleur: "#8a4a22", teinte: "#efe3d6",
      options: { "Format": ["20 g", "40 g", "70 g"] },
      variantes: [ { o: ["20 g"], prix: 6.00, vid: "" }, { o: ["40 g"], prix: 10.50, vid: "" }, { o: ["70 g"], prix: 16.00, vid: "" } ],
      img: ""
    },
    {
      id: "citronnelle-congo", cat: "misao", nom: "Citronnelle du Congo",
      origine: "RD Congo",
      court: "Saveur citronnée, idéale en infusion.",
      description: "Une citronnelle séchée au parfum franc de citron, à infuser ou à glisser dans vos bouillons et currys.",
      notes: ["Citronnée", "Fraîche", "Herbacée"], piquant: 0,
      accords: ["Infusions", "Bouillons", "Currys", "Poissons vapeur"],
      couleur: "#8f9d4c", teinte: "#eaeedd",
      options: { "Format": ["20 g", "40 g", "70 g"] },
      variantes: [ { o: ["20 g"], prix: 2.99, vid: "" }, { o: ["40 g"], prix: 5.50, vid: "" }, { o: ["70 g"], prix: 8.50, vid: "" } ],
      img: ""
    },

    /* ---------- Mélanges MISAO ---------- */
    { id: "curry-vadouvan", cat: "melanges", nom: "Curry Vadouvan", vedette: true, badge: "Coup de cœur",
      court: "Le curry fumé aux oignons et à l'ail.", description: "Un curry d'inspiration franco-indienne, rond et légèrement fumé, parfait sur les légumes, les poissons et les viandes blanches.",
      notes: ["Fumé", "Rond", "Parfumé"], piquant: 1, accords: ["Légumes", "Poissons", "Volaille"],
      couleur: "#b7792a", teinte: "#f1e7d3", options: {}, variantes: [ { o: [], prix: 11.00, vid: "" } ], img: "" },
    { id: "melange-raclette", cat: "melanges", nom: "Mélange de poivres pour raclette",
      court: "Le compagnon de vos soirées fromage.", description: "Un assemblage de poivres pensé pour le fromage fondu et la charcuterie.",
      notes: ["Épicé", "Aromatique"], piquant: 2, accords: ["Raclette", "Fondue", "Pommes de terre"],
      couleur: "#3a3330", teinte: "#ece8e1", options: {}, variantes: [ { o: [], prix: 9.00, vid: "" } ], img: "" },
    { id: "melange-chai", cat: "melanges", nom: "Mélange d'épices pour chaï",
      court: "Pour un chaï maison, chaud et épicé.", description: "Cardamome, cannelle et épices chaudes à infuser dans du lait ou du thé noir.",
      notes: ["Chaud", "Épicé", "Doux"], piquant: 1, accords: ["Thé noir", "Lait", "Pâtisseries"],
      couleur: "#6b3f24", teinte: "#efe4da", options: {}, variantes: [ { o: [], prix: 10.00, vid: "" } ], img: "" },
    { id: "the-delicatesse", cat: "melanges", nom: "Thé épicé N°1 Délicatesse", format: "50 g",
      court: "Un thé aux épices, tout en finesse.", description: "Notre premier thé épicé, à savourer nature à toute heure.",
      notes: ["Fin", "Épicé", "Floral"], piquant: 0, accords: ["Après-midi", "Desserts"],
      couleur: "#5e6b3a", teinte: "#e7eadb", options: {}, variantes: [ { o: [], prix: 13.00, vid: "" } ], img: "" },
    { id: "melange-berbere", cat: "melanges", nom: "Mélange Berbéré",
      court: "Le curry éthiopien, chaud et intense.", description: "Le berbéré, ou curry africain, relève les ragoûts, les lentilles et les viandes grillées.",
      notes: ["Intense", "Chaud", "Piquant"], piquant: 3, accords: ["Lentilles", "Ragoûts", "Viandes grillées"],
      couleur: "#a8361e", teinte: "#f2e2dc", options: {}, variantes: [ { o: [], prix: 10.00, vid: "" } ], img: "" },
    { id: "vin-chaud-hibiscus", cat: "melanges", nom: "Mix vin chaud à l'hibiscus rouge",
      court: "Le vin chaud version hibiscus.", description: "Un mélange d'épices et d'hibiscus rouge pour un vin chaud fruité et profond.",
      notes: ["Fruité", "Acidulé", "Épicé"], piquant: 0, accords: ["Vin rouge", "Jus de pomme chaud"],
      couleur: "#8b1e3f", teinte: "#f1dfe3", options: {}, variantes: [ { o: [], prix: 8.00, vid: "" } ], img: "" },

    /* ---------- Poivres du monde ---------- */
    { id: "poivre-penja", cat: "monde", nom: "Poivre de Penja", origine: "Cameroun", vedette: true,
      court: "Le grand poivre blanc du Cameroun.", description: "Un poivre blanc réputé, aux notes musquées et boisées.",
      notes: ["Musqué", "Boisé"], piquant: 2, accords: ["Poissons", "Sauces blanches"],
      couleur: "#e2d6bb", teinte: "#f2eee4", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },
    { id: "voatsiperifery", cat: "monde", nom: "Poivre sauvage Voatsiperifery", origine: "Madagascar",
      court: "Le poivre sauvage malgache, frais et agrumé.", description: "Une baie à queue récoltée en forêt, aux notes d'agrumes et de bois.",
      notes: ["Agrumes", "Boisé", "Frais"], piquant: 2, accords: ["Poissons", "Fruits", "Chocolat"],
      couleur: "#3b2a22", teinte: "#ebe5dc", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },
    { id: "kampot-blanc", cat: "monde", nom: "Poivre blanc de Kampot IGP bio", origine: "Cambodge", badge: "Bio · IGP",
      court: "Un grand cru de poivre, certifié IGP.", description: "Le célèbre poivre de Kampot, en version blanche et bio.",
      notes: ["Fin", "Floral", "Frais"], piquant: 2, accords: ["Poissons", "Crustacés", "Légumes"],
      couleur: "#ece2ca", teinte: "#f3efe6", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },
    { id: "baies-passion", cat: "monde", nom: "Baies de la Passion (Tenadam)", origine: "Éthiopie", format: "15 g",
      court: "Des baies aux notes fruitées et résineuses.", description: "Une baie éthiopienne rare, à moudre sur les desserts et les viandes.",
      notes: ["Fruité", "Résineux"], piquant: 1, accords: ["Desserts", "Agneau"],
      couleur: "#9f3f2a", teinte: "#f1e2dc", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },
    { id: "poivre-long-java", cat: "monde", nom: "Poivre long de Java", origine: "Indonésie", format: "25 g", epuise: true,
      court: "Chaud et sucré, en épis.", description: "Un poivre en épis, chaud et légèrement sucré.",
      notes: ["Chaud", "Sucré"], piquant: 3, accords: ["Viandes", "Desserts"],
      couleur: "#4a3a30", teinte: "#ebe6df", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },
    { id: "sarawak-noir", cat: "monde", nom: "Poivre noir de Sarawak", origine: "Malaisie", format: "25 g",
      court: "Un noir classique, franc et chaud.", description: "Un poivre noir de Bornéo, franc et équilibré.",
      notes: ["Franc", "Chaud"], piquant: 3, accords: ["Viandes rouges", "Sauces"],
      couleur: "#2a2523", teinte: "#e9e7e2", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },
    { id: "sao-tome", cat: "monde", nom: "Poivre sauvage de São Tomé", origine: "São Tomé-et-Príncipe",
      court: "Un poivre sauvage d'île, rare et parfumé.", description: "Un poivre sauvage récolté sur l'archipel de São Tomé-et-Príncipe.",
      notes: ["Parfumé", "Rare"], piquant: 2, accords: ["Poissons", "Volaille"],
      couleur: "#3d2c24", teinte: "#ece6de", options: {}, variantes: [ { o: [], prix: 7.00, vid: "" } ], img: "" },

    /* ---------- Masterclass & bons cadeaux ----------
       Infos et dates reprises du site actuel misao.be (octobre 2026).
       photo : fichier local (dossier img/ateliers) ; photoUrl : photo d'origine sur misao.be.
       Le script « telecharger-photos.command » rapatrie ces photos dans img/ateliers. */
    { id: "mc-poivres-monde", cat: "ateliers", type: "atelier", art: "monde", nom: "Masterclass Poivres du monde", badge: "Le plus demandé",
      photo: "img/ateliers/poivres-du-monde.jpg", photoUrl: "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1645546660571-QZAFBW81DAAS3FO3KLUI/IMG_20211106_153808.jpg?format=1000w",
      court: "Tout comprendre du roi des épices, avec Sandrine.", description: "Une masterclass vivante animée par Sandrine, productrice et chasseuse d'épices : où et comment pousse le poivre, ce qui fait un bon poivre, comment le cuisiner, et la grande question : le poivre rose est-il vraiment un poivre ?",
      duree: "1 h 30", groupe: "Dès 10 ans · 1 à 5 places",
      programme: ["Où et comment pousse le poivre", "Reconnaître un bon poivre", "Le poivre rose est-il vraiment un poivre ?", "Dégustation d'épices fines", "Vous repartez avec un poivre mystère et une épice rare"],
      couleur: "#173326", teinte: "#dfe8e2", options: { "Date": ["Jeu. 15 oct. · 18h30", "Sam. 17 oct. · 10h30", "Ven. 20 nov. · 18h30", "Sam. 21 nov. · 10h30"] },
      variantes: [ { o: ["Jeu. 15 oct. · 18h30"], prix: 45.00, vid: "" }, { o: ["Sam. 17 oct. · 10h30"], prix: 45.00, vid: "" }, { o: ["Ven. 20 nov. · 18h30"], prix: 45.00, vid: "" }, { o: ["Sam. 21 nov. · 10h30"], prix: 45.00, vid: "" } ], img: "" },
    { id: "mc-cardamome", cat: "ateliers", type: "atelier", art: "cardamome", nom: "Masterclass Cardamome",
      photo: "img/ateliers/cardamome.jpg", photoUrl: "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1665750004929-2D578KVKDUWRQODQOPLI/cardamomes.jpg?format=1000w",
      court: "La reine des épices, conjuguée au pluriel.", description: "De la gousse verte que l'on connaît aux cardamomes plus fruitées, florales ou intenses d'Inde, du Cameroun et du Népal : découvrez toute la famille et ses usages en cuisine salée comme sucrée.",
      duree: "1 h 30", groupe: "Dès 10 ans",
      programme: ["Les cardamomes du monde : Inde, Cameroun, Népal", "De la gousse verte aux variétés fruitées, florales ou intenses", "La cardamome en cuisine salée et sucrée", "Dégustation"],
      couleur: "#5d7a3a", teinte: "#e3ebd8", options: { "Créneau": ["Mercredi · 18h00", "Samedi · 10h30"] },
      variantes: [ { o: ["Mercredi · 18h00"], prix: 45.00, vid: "" }, { o: ["Samedi · 10h30"], prix: 45.00, vid: "" } ], img: "" },
    { id: "atelier-infusions", cat: "ateliers", type: "atelier", art: "infusion", nom: "Atelier Infusions & tisanes épicées",
      photo: "img/ateliers/infusions.jpg", photoUrl: "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1665753213049-BPHWIF8S91CKRKB9R0US/IMG-20220420-WA0095.jpg?format=1000w",
      court: "Vétiver, poivre, cannelle : des infusions qui surprennent.", description: "Une masterclass-atelier pour découvrir des boissons originales : infusions de vétiver, de poivre ou de cannelle, et les épices qui font un vrai chaï.",
      duree: "1 h 30", groupe: "Dès 10 ans",
      programme: ["Infusions de vétiver, de poivre et de cannelle", "Les épices du chaï", "Dosages et temps d'infusion", "Vous repartez avec une bouteille d'infusion originale"],
      couleur: "#8b1e3f", teinte: "#f1dfe3", options: { "Date": ["Ven. 13 nov. · 18h30"] },
      variantes: [ { o: ["Ven. 13 nov. · 18h30"], prix: 40.00, vid: "" } ], img: "" },
    { id: "atelier-melange", cat: "ateliers", type: "atelier", art: "melange", nom: "Atelier Crée ton mélange d'épices", badge: "Repartez avec votre mélange",
      photo: "img/ateliers/melange.jpg", photoUrl: "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/ab24522a-cdb0-4d2e-9d1e-291450232d93/cr%C3%A9e+une+image+d%27un+homme+et+d%27une+femme++europ%C3%A9enne+qui+%C3%A9crase+des+%C3%A9pices+pour+faire+un+curry.+on+voit+aussi+des+tas+d%27%C3%A9pices+non+moulues+sur+la+table.+plan+de+haut.jpg?format=1000w",
      court: "Créez votre mélange signature au mortier.", description: "Deux heures pour découvrir l'histoire, l'origine et la production des épices, les sentir, les goûter, les écraser, puis composer votre propre mélange : curry, za'atar ou chaï selon le thème du jour. Atelier en français, anglais ou italien.",
      duree: "2 h", groupe: "FR · EN · IT",
      programme: ["Histoire, origine et production des épices", "Sentir, goûter et écraser les épices", "Selon le thème : curry, za'atar ou chaï", "Votre mélange au mortier ou au moulin manuel, à emporter"],
      couleur: "#b7792a", teinte: "#f1e7d3", options: { "Date": ["Ven. 6 nov. · 18h30", "Sam. 14 nov. · 10h30"] },
      variantes: [ { o: ["Ven. 6 nov. · 18h30"], prix: 60.00, vid: "" }, { o: ["Sam. 14 nov. · 10h30"], prix: 60.00, vid: "" } ], img: "" },
    { id: "mc-vin-poivre", cat: "ateliers", type: "atelier", art: "vin", nom: "Masterclass Vin & Poivre", badge: "15 places",
      photo: "img/ateliers/vin-poivre.jpg", photoUrl: "https://static1.squarespace.com/static/5b03e59ce2ccd19b1a81763e/63496b0bb9849d268a700162/6aa2a4cda60b5f2044675bce/1789043917494/92169.jpg?format=1000w",
      court: "Vino & Pepe : 4 vins, 4 poivres, 2 duos.", description: "Avec Alessandra (Mosto, vins insolites de vignerons indépendants), Sandrine associe quatre vins et quatre poivres en deux duos : un cépage en blanc et en rouge, un poivre en blanc et en noir. Même origine, deux visages. Aucune connaissance préalable n'est nécessaire.",
      duree: "19h00 – 21h30", groupe: "15 places · accueil 18h45",
      programme: ["4 vins et 4 poivres en 2 duos", "Un cépage en blanc et en rouge, un poivre en blanc et en noir", "Une mise en bouche à chaque accord", "Guide et carnet de dégustation"],
      couleur: "#5a1f2e", teinte: "#efe0e3", options: { "Date": ["Jeu. 28 janv. 2027 · 19h00"] },
      variantes: [ { o: ["Jeu. 28 janv. 2027 · 19h00"], prix: 55.00, vid: "" } ], img: "" },
    { id: "bon-atelier", cat: "ateliers", type: "cadeau", art: "cadeau", nom: "Bon cadeau Atelier épices",
      photo: "img/ateliers/bon-atelier.jpg", photoUrl: "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/ff0ec0bb-1b19-422b-9d39-40bd61fc3c2f/IMG_20260110_122301860.jpg?format=1000w",
      court: "Offrez l'atelier de son choix.", description: "Un bon valable pour l'atelier ou la masterclass de son choix, pendant 12 mois. La date se réserve ensuite par e-mail ou par SMS.",
      couleur: "#173326", teinte: "#f4ecd9", options: { "Valeur": ["45 €", "60 €"] },
      variantes: [ { o: ["45 €"], prix: 45.00, vid: "" }, { o: ["60 €"], prix: 60.00, vid: "" } ], img: "" },
    { id: "bon-boutique", cat: "ateliers", type: "cadeau", art: "bon", nom: "Bon d'achat La Maison des Poivres",
      photo: "img/ateliers/bon-boutique.jpg", photoUrl: "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1671637997467-GTHBG8TQI014CX7DBNTF/5J3A0149+%281%29.jpg?format=1000w",
      court: "À dépenser en boutique, valable 6 mois.", description: "Un bon d'achat pour les gourmands, à utiliser à La Maison des Poivres, Place de la Vieille Halle aux Blés. Valable 6 mois à partir de l'achat.",
      couleur: "#e3a82b", teinte: "#e9efe9", options: { "Valeur": ["25 €", "50 €", "75 €", "100 €"] },
      variantes: [ { o: ["25 €"], prix: 25.00, vid: "" }, { o: ["50 €"], prix: 50.00, vid: "" }, { o: ["75 €"], prix: 75.00, vid: "" }, { o: ["100 €"], prix: 100.00, vid: "" } ], img: "" }
  ]
};
