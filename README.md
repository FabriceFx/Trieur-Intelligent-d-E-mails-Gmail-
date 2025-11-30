# Trieur intelligent d'E-mails (Gmail)

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

Une solution automatisée et optimisée pour organiser votre boîte de réception Gmail en triant, étiquetant et archivant les e-mails entrants selon des règles sémantiques personnalisables.

## 📋 Fonctionnalités

* **Analyse Sémantique** : Scanne le sujet et le corps des e-mails à la recherche de mots-clés définis.
* **Traitement par Lots (Batching)** : Optimisation des performances pour réduire la consommation de quotas Google (idéal pour les gros volumes).
* **Gestion Automatique des Libellés** : Crée automatiquement les libellés Gmail manquants.
* **Nettoyage** : Marque comme lu et archive automatiquement les e-mails traités.
* **Architecture ES6+** : Code moderne, modulaire et robuste.

## ⚙️ Configuration

1.  Ouvrez le fichier `Code.js`.
2.  Modifiez la constante `REGLES_DE_TRI` pour adapter les catégories à vos besoins :
    ```javascript
    const REGLES_DE_TRI = [
      {
        nomLibelle: "Vos Factures",
        motsCles: ["facture", "reçu", "paiement confirmé"]
      },
      // ...
    ];
    ```

## 🚀 Installation & démarrage

1.  Copiez le code dans votre éditeur Google Apps Script.
2.  Exécutez la fonction `installerDeclencheurAutomatique` **une seule fois**.
3.  Acceptez les demandes d'autorisation d'accès à Gmail.
4.  Le script s'exécutera désormais toutes les heures en arrière-plan.

## 🛡️ Gestion des erreurs

Les erreurs critiques sont capturées et affichées dans la console d'exécution Google Cloud (`console.error`), assurant que le script ne plante pas silencieusement.
