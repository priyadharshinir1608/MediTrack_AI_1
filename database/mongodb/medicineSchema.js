/**
 * MongoDB Atlas — Medicine Collection Reference Schema
 */
module.exports = {
  collectionName: "medicines",
  fields: {
    _id: "ObjectId",
    name: "String (e.g. Paracetamol 500mg)",
    genericName: "String",
    brand: "String",
    category: "String (Tablet, Capsule, Syrup, Injection, Ointment)",
    batchNumber: "String (e.g. B-98745)",
    quantity: "Number",
    price: "Number (Selling price)",
    costPrice: "Number (Purchase cost)",
    expiryDate: "ISODate",
    manufactureDate: "ISODate",
    supplier: "ObjectId (ref: Suppliers)",
    location: "String (e.g. Shelf A1)",
    barcode: "String (UPC/EAN)",
    ocrData: "Object (raw text & confidence)",
    createdAt: "ISODate",
    updatedAt: "ISODate"
  }
};
