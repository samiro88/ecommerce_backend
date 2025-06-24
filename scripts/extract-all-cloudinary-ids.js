/**
 * Mongo Shell Script: Extract all image references (any extension) from all collections,
 * listing the collection, document _id, and (if available) a name/title field.
 * Usage:
 *   mongosh "mongodb://localhost:27017/protein_db" scripts/extract-all-image-refs-detailed.js > all-image-refs-detailed.txt
 */

function extractImagesFromDoc(doc, collection, docId, docName, foundList, parentKey) {
  for (var key in doc) {
    if (!doc.hasOwnProperty(key)) continue;
    var val = doc[key];
    // Regex for common image extensions (jpg, jpeg, png, gif, webp, svg, bmp, tiff, ico, avif, jfif, etc.)
    var imgRegex = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico|avif|jfif)(\?|#|$)/i;
    if (typeof val === 'string' && imgRegex.test(val)) {
      foundList.push({
        collection: collection,
        _id: docId,
        name: docName,
        field: parentKey ? parentKey + '.' + key : key,
        url: val
      });
    } else if (Array.isArray(val)) {
      val.forEach(function(item, idx) {
        if (typeof item === 'object' && item !== null) {
          extractImagesFromDoc(item, collection, docId, docName, foundList, (parentKey ? parentKey + '.' + key : key) + '[' + idx + ']');
        } else if (typeof item === 'string' && imgRegex.test(item)) {
          foundList.push({
            collection: collection,
            _id: docId,
            name: docName,
            field: (parentKey ? parentKey + '.' + key : key) + '[' + idx + ']',
            url: item
          });
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      extractImagesFromDoc(val, collection, docId, docName, foundList, parentKey ? parentKey + '.' + key : key);
    }
  }
}

var collections = [
  "adminusers","analytics","annonces","aromas","attachments","blogs","brands","categories","clients","commande_details","commandes","contacts","coordinates","data_rows","data_types","details_facture_tvas","details_factures","details_tickets","facture_tvas","factures","faqs","information","invoices","material","menu_items","menus","messages","migrations","musculationproducts","MusculationProducts","newsletters","packs","pages","paymentmethods","permission_role","permissions","personal_access_tokens","posts","product_aromas","product_tags","products","promocodes","proteins","reviews","roles","seo_pages","services","settings","shipments","slides","subcategories","tags","tickets","transactions","translations","users","VenteFlash","ventes"
];

var foundImages = [];

collections.forEach(function(collName) {
  var cursor = db.getCollection(collName).find({});
  cursor.forEach(function(doc) {
    // Try to get a human-readable name/title if present
    var docName = doc.name || doc.title || doc.productName || doc.nom || doc.slug || doc.username || doc.email || "";
    extractImagesFromDoc(doc, collName, doc._id, docName, foundImages, "");
  });
});

print("\n=== All Image References with Collection and Document Info ===");
foundImages.forEach(function(entry) {
  printjson(entry);
});