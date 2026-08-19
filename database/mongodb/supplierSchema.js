/**
 * MongoDB Atlas — Supplier Collection Reference Schema
 */
module.exports = {
  collectionName: "suppliers",
  fields: {
    _id: "ObjectId",
    name: "String",
    company: "String",
    email: "String",
    phone: "String",
    address: "String",
    status: "String (active, inactive)",
    createdAt: "ISODate"
  }
};
