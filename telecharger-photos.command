#!/bin/bash
# Télécharge les photos des ateliers depuis le site actuel misao.be
cd "$(dirname "$0")"
mkdir -p img/ateliers
curl -L -s -o "img/ateliers/poivres-du-monde.jpg" "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1645546660571-QZAFBW81DAAS3FO3KLUI/IMG_20211106_153808.jpg?format=1000w" && echo "✓ img/ateliers/poivres-du-monde.jpg"
curl -L -s -o "img/ateliers/cardamome.jpg" "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1665750004929-2D578KVKDUWRQODQOPLI/cardamomes.jpg?format=1000w" && echo "✓ img/ateliers/cardamome.jpg"
curl -L -s -o "img/ateliers/infusions.jpg" "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1665753213049-BPHWIF8S91CKRKB9R0US/IMG-20220420-WA0095.jpg?format=1000w" && echo "✓ img/ateliers/infusions.jpg"
curl -L -s -o "img/ateliers/melange.jpg" "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/ab24522a-cdb0-4d2e-9d1e-291450232d93/cr%C3%A9e+une+image+d%27un+homme+et+d%27une+femme++europ%C3%A9enne+qui+%C3%A9crase+des+%C3%A9pices+pour+faire+un+curry.+on+voit+aussi+des+tas+d%27%C3%A9pices+non+moulues+sur+la+table.+plan+de+haut.jpg?format=1000w" && echo "✓ img/ateliers/melange.jpg"
curl -L -s -o "img/ateliers/vin-poivre.jpg" "https://static1.squarespace.com/static/5b03e59ce2ccd19b1a81763e/63496b0bb9849d268a700162/6aa2a4cda60b5f2044675bce/1789043917494/92169.jpg?format=1000w" && echo "✓ img/ateliers/vin-poivre.jpg"
curl -L -s -o "img/ateliers/bon-atelier.jpg" "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/ff0ec0bb-1b19-422b-9d39-40bd61fc3c2f/IMG_20260110_122301860.jpg?format=1000w" && echo "✓ img/ateliers/bon-atelier.jpg"
curl -L -s -o "img/ateliers/bon-boutique.jpg" "https://images.squarespace-cdn.com/content/v1/5b03e59ce2ccd19b1a81763e/1671637997467-GTHBG8TQI014CX7DBNTF/5J3A0149+%281%29.jpg?format=1000w" && echo "✓ img/ateliers/bon-boutique.jpg"
echo "Terminé. Vous pouvez fermer cette fenêtre."
