/**
 * MongoDB Atlas — Purchase Collection Reference Schema
 */
module.exports = {
  collectionName: "purchases",
  fields: {
    _id: "ObjectId",
    medicine: "ObjectId (ref: Medicines)",
    supplier: "ObjectId (ref: Suppliers)",
    quantity: "Number",
    unitCost: "Number",
    totalCost: "Number",
    purchaseDate: "ISODate"
  }
};
