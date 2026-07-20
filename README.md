# prénom-chien.com

Générateur de prénoms de chien — site statique, rapide, mobile-first, monétisable
via Google AdSense et intégrable sur des blogs via `<iframe>`.

## Structure

```
index.html          Page d'accueil : générateur + contenu SEO + emplacement pub
embed.html          Version épurée pour intégration <iframe> (sans pub ni en-tête)
robots.txt          Indexation (embed.html en noindex)
sitemap.xml         Plan du site
assets/
  css/style.css     Styles (mobile-first, identité orange)
  js/data.js        Base de prénoms (à enrichir) + thèmes + lettre de l'année
  js/app.js         Logique du générateur (partagée index + embed)
```

## Fonctionnement

- **Sexe** (obligatoire), **thème** (optionnel), **lettre** (optionnelle).
- La **lettre officielle LOF de l'année** est présélectionnée (2026 = B).
- Zéro dépendance, zéro build : ouvrir `index.html` suffit.

## Enrichir la base de prénoms

Éditer `assets/js/data.js` : ajouter des prénoms dans
`DOG_NAMES.m.<theme>` (mâle) ou `DOG_NAMES.f.<theme>` (femelle).
La lettre est déduite automatiquement de la première lettre du prénom.

## Mettre à jour la lettre de l'année

Chaque année, modifier en bas de `assets/js/data.js` :

```js
window.DOG_YEAR = 2027;
window.DOG_YEAR_LETTER = "C";
```

(Cycle SCC : 2025 = A, 2026 = B, 2027 = C… lettres K, Q, W, X, Y, Z exclues.)

## Activer Google AdSense

1. Créer un compte sur https://adsense.google.com et ajouter le domaine.
2. Dans `index.html`, décommenter le `<script>` AdSense dans le `<head>` et
   remplacer `ca-pub-XXXXXXXXXXXXXXXX` par ton ID éditeur.
3. Décommenter le bloc `<ins class="adsbygoogle">` dans la zone `.ad-slot`
   et renseigner `data-ad-slot`.

> Astuce : AdSense refuse les pages « trop vides ». Le contenu texte sous
> l'outil est là pour faciliter la validation — pense à l'enrichir (ajouter
> des pages « Prénoms mâles », « Prénoms femelles », « Prénoms en B 2026 »).

## Intégration sur un blog

Bouton « Intégrer ce générateur sur mon site » sur la page d'accueil, ou :

```html
<iframe src="https://prenom-chien.com/embed.html" width="100%" height="640"
        style="border:0;max-width:400px" loading="lazy"
        title="Générateur de prénoms de chien"></iframe>
```

## Déploiement

Site 100 % statique → hébergement gratuit possible sur **Cloudflare Pages**,
**Netlify** ou **GitHub Pages**. Il suffit de publier le contenu du dossier.
HTTPS automatique. Pointer le domaine `prénom-chien.com` vers l'hébergeur choisi.
