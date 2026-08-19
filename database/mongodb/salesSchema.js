/**
 * MongoDB Atlas — Sales Collection Reference Schema
 */
module.exports = {
  collectionName: "sales",
  fields: {
    _id: "ObjectId",
    medicine: "ObjectId (ref: Medicines)",
    quantity: "Number",
    unitPrice: "Number",
    totalPrice: "Number",
    soldBy: "ObjectId (ref: Users)",
    customerName: "String",
    date: "ISODate"
  }
};
