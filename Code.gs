/**
 * @fileoverview Script de tri automatique des e-mails Gmail basé sur des mots-clés.
 * @author Fabrice Faucheux
 * @version 2.0.0
 * @license MIT
 */

// --- CONFIGURATION ---

/**
 * Configuration des règles de tri.
 * L'ordre du tableau définit la priorité des règles.
 * @constant {Array<Object>}
 */
const REGLES_DE_TRI = [
  {
    nomLibelle: "Promos Shopping",
    motsCles: [
      "promotion", "réduction", "soldes", "livraison gratuite", 
      "code promo", "dernière chance", "ventes privées"
    ]
  },
  {
    nomLibelle: "Newsletters Tech",
    motsCles: [
      "newsletter", "tech", "gadget", "IA", 
      "mise à jour logicielle", "nouveau smartphone", "deep learning"
    ]
  },
  {
    nomLibelle: "Réseaux Sociaux",
    motsCles: [
      "notification linkedin", "vous êtes identifié", 
      "nouveau message de", "facebook"
    ]
  }
];

// --- FONCTIONS PRINCIPALES ---

/**
 * Fonction principale : Analyse, groupe et traite les e-mails en masse.
 * Utilise une approche "Batch" pour minimiser les appels API.
 */
function trierEmailsPublicitaires() {
  console.time("Temps d'exécution");
  Logger.log("🚀 Démarrage du scan optimisé des e-mails...");

  try {
    // 1. Récupération des conversations (Threads)
    const threadsNonLus = GmailApp.search('is:inbox is:unread', 0, 50); // Limite à 50 pour la performance
    
    if (threadsNonLus.length === 0) {
      Logger.log("✅ Aucun nouvel e-mail à traiter.");
      return;
    }

    Logger.log(`🔍 Analyse de ${threadsNonLus.length} conversations...`);

    // 2. Groupement des threads par libellé (pour traitement par lots)
    // Structure : { "NomLibelle": [Thread1, Thread2], ... }
    const actionsAGerer = {};

    threadsNonLus.forEach(thread => {
      const regleTrouvee = identifierReglePourThread(thread);
      
      if (regleTrouvee) {
        const { nomLibelle } = regleTrouvee;
        
        // Initialisation du tableau si la clé n'existe pas encore
        if (!actionsAGerer[nomLibelle]) {
          actionsAGerer[nomLibelle] = [];
        }
        
        // Ajout du thread au groupe correspondant
        actionsAGerer[nomLibelle].push(thread);
      }
    });

    // 3. Exécution des actions par lots
    executerActionsParLots(actionsAGerer);

  } catch (erreur) {
    console.error(`❌ Erreur critique lors du tri : ${erreur.message}`);
  } finally {
    console.timeEnd("Temps d'exécution");
  }
}

/**
 * Analyse un thread pour voir s'il correspond à une règle définie.
 * @param {GmailThread} thread - La conversation à analyser.
 * @return {Object|null} La règle correspondante ou null.
 */
function identifierReglePourThread(thread) {
  // Récupération optimisée : on concatène sujet et snippets des messages pour une recherche globale
  const messages = thread.getMessages();
  // On ne regarde que le premier message pour le sujet, et on concatène le corps
  const contenuGlobal = messages.map(m => `${m.getSubject()} ${m.getPlainBody()}`).join(" ").toLowerCase();

  // Utilisation de .find() pour retourner la première règle qui match
  return REGLES_DE_TRI.find(({ motsCles }) => {
    return motsCles.some(mot => contenuGlobal.includes(mot.toLowerCase()));
  }) || null;
}

/**
 * Applique les modifications (Label, Lu, Archive) par groupes de threads.
 * @param {Object} actionsMap - Objet contenant les tableaux de threads par libellé.
 */
function executerActionsParLots(actionsMap) {
  // Transformation de l'objet en tableau de paires [clé, valeur] pour itérer
  Object.entries(actionsMap).forEach(([nomLibelle, threadsDuGroupe]) => {
    
    if (threadsDuGroupe.length > 0) {
      const libelleObjet = recupererOuCreerLibelle(nomLibelle);
      
      if (libelleObjet) {
        Logger.log(`⚡ Traitement de ${threadsDuGroupe.length} e-mails pour : "${nomLibelle}"`);
        
        try {
          // Opérations par lots (Batch Operations)
          libelleObjet.addToThreads(threadsDuGroupe);     // 1 appel API pour N threads
          GmailApp.markThreadsRead(threadsDuGroupe);      // 1 appel API pour N threads
          GmailApp.moveThreadsToArchive(threadsDuGroupe); // 1 appel API pour N threads
        } catch (e) {
          console.error(`Erreur lors du traitement du lot "${nomLibelle}": ${e.message}`);
        }
      }
    }
  });
}

/**
 * Récupère un libellé existant ou le crée s'il est absent.
 * @param {string} nom - Le nom du libellé.
 * @return {GmailLabel} L'objet libellé.
 */
function recupererOuCreerLibelle(nom) {
  try {
    let libelle = GmailApp.getUserLabelByName(nom);
    if (!libelle) {
      Logger.log(`✨ Création du nouveau libellé : "${nom}"`);
      libelle = GmailApp.createLabel(nom);
    }
    return libelle;
  } catch (e) {
    console.error(`Impossible de gérer le libellé "${nom}" : ${e.message}`);
    return null;
  }
}

// --- GESTION DES DÉCLENCHEURS (TRIGGERS) ---

/**
 * Installe le déclencheur horaire.
 * À lancer manuellement une seule fois.
 */
function installerDeclencheurAutomatique() {
  supprimerDeclencheursExistants();
  
  ScriptApp.newTrigger("trierEmailsPublicitaires")
    .timeBased()
    .everyHours(1)
    .create();
    
  Logger.log("✅ Déclencheur installé : Analyse toutes les heures.");
}

/**
 * Nettoie les déclencheurs pour éviter les doublons.
 */
function supprimerDeclencheursExistants() {
  const triggers = ScriptApp.getProjectTriggers();
  const nomFonction = "trierEmailsPublicitaires";
  
  const triggersAeffacer = triggers.filter(t => t.getHandlerFunction() === nomFonction);
  
  triggersAeffacer.forEach(t => ScriptApp.deleteTrigger(t));
  
  if(triggersAeffacer.length > 0) {
    Logger.log(`🗑️ ${triggersAeffacer.length} ancien(s) déclencheur(s) supprimé(s).`);
  }
}
