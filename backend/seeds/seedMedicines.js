const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Medicine = require('../models/Medicine');

const sampleMedicines = [
  {
    name: 'Dolo 650mg',
    genericName: 'Paracetamol',
    brand: 'Micro Labs',
    category: 'Tablet',
    batchNumber: 'DL-2026-991',
    quantity: 150,
    price: 32.00,
    costPrice: 22.00,
    expiryDate: new Date('2027-11-30'),
    manufactureDate: new Date('2024-11-01'),
    location: 'Rack A-1',
    description: 'Fast acting antipyretic and analgesic for fever and mild to moderate pain relief.',
    barcode: '8901117001012'
  },
  {
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    brand: 'GSK',
    category: 'Tablet',
    batchNumber: 'AUG-8821',
    quantity: 8,
    price: 205.00,
    costPrice: 160.00,
    expiryDate: new Date('2027-08-15'),
    manufactureDate: new Date('2024-08-01'),
    location: 'Rack A-2',
    description: 'Broad spectrum penicillin antibiotic for bacterial respiratory and soft tissue infections.',
    barcode: '8901117001029'
  },
  {
    name: 'Azithral 500mg',
    genericName: 'Azithromycin',
    brand: 'Alembic Pharmaceuticals',
    category: 'Tablet',
    batchNumber: 'AZ-5542',
    quantity: 65,
    price: 130.00,
    costPrice: 95.00,
    expiryDate: new Date('2028-01-20'),
    manufactureDate: new Date('2025-01-01'),
    location: 'Rack A-3',
    description: 'Macrolide antibiotic used for throat, sinus, and respiratory infections.',
    barcode: '8901117001036'
  },
  {
    name: 'Pan-D Capsule',
    genericName: 'Pantoprazole + Domperidone',
    brand: 'Alkem Laboratories',
    category: 'Capsule',
    batchNumber: 'PAND-441',
    quantity: 90,
    price: 185.00,
    costPrice: 135.00,
    expiryDate: new Date('2027-06-30'),
    manufactureDate: new Date('2024-06-01'),
    location: 'Rack B-1',
    description: 'Proton pump inhibitor with prokinetic agent for acid reflux and GERD management.',
    barcode: '8901117001043'
  },
  {
    name: 'Glycomet 500mg',
    genericName: 'Metformin Hydrochloride',
    brand: 'USV Private Limited',
    category: 'Tablet',
    batchNumber: 'GLY-773',
    quantity: 120,
    price: 48.00,
    costPrice: 32.00,
    expiryDate: new Date('2027-10-15'),
    manufactureDate: new Date('2024-10-01'),
    location: 'Rack B-2',
    description: 'Biguanide antihyperglycemic agent for blood glucose control in Type 2 Diabetes.',
    barcode: '8901117001050'
  },
  {
    name: 'Atorva 10mg',
    genericName: 'Atorvastatin',
    brand: 'Zydus Cadila',
    category: 'Tablet',
    batchNumber: 'AT-3321',
    quantity: 80,
    price: 115.00,
    costPrice: 80.00,
    expiryDate: new Date('2027-09-25'),
    manufactureDate: new Date('2024-09-01'),
    location: 'Rack B-3',
    description: 'HMG-CoA reductase inhibitor for reducing LDL cholesterol and cardiovascular risk.',
    barcode: '8901117001067'
  },
  {
    name: 'Montair-LC',
    genericName: 'Montelukast + Levocetirizine',
    brand: 'Cipla',
    category: 'Tablet',
    batchNumber: 'MLC-109',
    quantity: 5,
    price: 190.00,
    costPrice: 140.00,
    expiryDate: new Date('2026-09-28'),
    manufactureDate: new Date('2024-09-01'),
    location: 'Rack C-1',
    description: 'Antihistamine and leukotriene receptor antagonist for allergic rhinitis and asthma.',
    barcode: '8901117001074'
  },
  {
    name: 'Benadryl Cough Syrup 100ml',
    genericName: 'Diphenhydramine + Ammonium Chloride',
    brand: 'Johnson & Johnson',
    category: 'Syrup',
    batchNumber: 'BEN-902',
    quantity: 45,
    price: 125.00,
    costPrice: 90.00,
    expiryDate: new Date('2027-04-10'),
    manufactureDate: new Date('2024-04-01'),
    location: 'Rack D-1',
    description: 'Soothing cough formula for wet and dry allergic cough relief.',
    barcode: '8901117001081'
  },
  {
    name: 'Ascoril-D Plus Syrup',
    genericName: 'Dextromethorphan + Chlorpheniramine + Phenylephrine',
    brand: 'Glenmark',
    category: 'Syrup',
    batchNumber: 'ASC-402',
    quantity: 6,
    price: 140.00,
    costPrice: 100.00,
    expiryDate: new Date('2026-10-05'),
    manufactureDate: new Date('2024-10-01'),
    location: 'Rack D-2',
    description: 'Sugar-free dry cough syrup providing fast decongestion and cough relief.',
    barcode: '8901117001098'
  },
  {
    name: 'Telma 40mg',
    genericName: 'Telmisartan',
    brand: 'Glenmark',
    category: 'Tablet',
    batchNumber: 'TLM-881',
    quantity: 110,
    price: 145.00,
    costPrice: 105.00,
    expiryDate: new Date('2027-12-01'),
    manufactureDate: new Date('2024-12-01'),
    location: 'Rack B-4',
    description: 'Angiotensin II receptor blocker (ARB) for managing primary hypertension.',
    barcode: '8901117001104'
  },
  {
    name: 'Lantus SoloStar 100IU/ml',
    genericName: 'Insulin Glargine',
    brand: 'Sanofi',
    category: 'Injection',
    batchNumber: 'LAN-339',
    quantity: 18,
    price: 650.00,
    costPrice: 520.00,
    expiryDate: new Date('2027-05-18'),
    manufactureDate: new Date('2025-05-01'),
    location: 'Cold Storage 4°C',
    description: 'Long-acting basal human insulin analog for diabetes mellitus glucose stabilization.',
    barcode: '8901117001111'
  },
  {
    name: 'Monocef 1g Injection',
    genericName: 'Ceftriaxone Sodium',
    brand: 'Aristo Pharmaceuticals',
    category: 'Injection',
    batchNumber: 'MON-771',
    quantity: 40,
    price: 75.00,
    costPrice: 50.00,
    expiryDate: new Date('2027-07-22'),
    manufactureDate: new Date('2024-07-01'),
    location: 'Rack E-1',
    description: 'Third-generation cephalosporin antibiotic injection for severe systemic infections.',
    barcode: '8901117001128'
  },
  {
    name: 'Volini Pain Relief Gel 50g',
    genericName: 'Diclofenac Diethylamine + Linseed Oil + Methyl Salicylate',
    brand: 'Sun Pharma',
    category: 'Ointment',
    batchNumber: 'VOL-661',
    quantity: 55,
    price: 160.00,
    costPrice: 115.00,
    expiryDate: new Date('2028-02-14'),
    manufactureDate: new Date('2025-02-01'),
    location: 'Rack F-1',
    description: 'Fast absorbing topical analgesic gel for sprains, joint pain, and muscular aches.',
    barcode: '8901117001135'
  },
  {
    name: 'Betadine 10% Ointment 20g',
    genericName: 'Povidone Iodine',
    brand: 'Win-Medicare',
    category: 'Ointment',
    batchNumber: 'BET-552',
    quantity: 70,
    price: 95.00,
    costPrice: 65.00,
    expiryDate: new Date('2027-08-30'),
    manufactureDate: new Date('2024-08-01'),
    location: 'Rack F-2',
    description: 'Topical microbicidal antiseptic for minor cuts, wounds, and burns.',
    barcode: '8901117001142'
  },
  {
    name: 'Ciplox 500mg',
    genericName: 'Ciprofloxacin',
    brand: 'Cipla',
    category: 'Tablet',
    batchNumber: 'CPX-112',
    quantity: 4,
    price: 52.00,
    costPrice: 35.00,
    expiryDate: new Date('2027-03-15'),
    manufactureDate: new Date('2024-03-01'),
    location: 'Rack A-4',
    description: 'Fluoroquinolone antibiotic for urinary tract, gastrointestinal, and skin infections.',
    barcode: '8901117001159'
  },
  {
    name: 'Becosules Performance',
    genericName: 'Vitamin B-Complex + Vitamin C + Zinc',
    brand: 'Pfizer',
    category: 'Capsule',
    batchNumber: 'BEC-993',
    quantity: 140,
    price: 55.00,
    costPrice: 38.00,
    expiryDate: new Date('2028-04-10'),
    manufactureDate: new Date('2025-04-01'),
    location: 'Rack C-2',
    description: 'Therapeutic nutritional supplement for immunity and energy vitality.',
    barcode: '8901117001166'
  },
  {
    name: 'Allegra 120mg',
    genericName: 'Fexofenadine Hydrochloride',
    brand: 'Sanofi',
    category: 'Tablet',
    batchNumber: 'ALG-441',
    quantity: 60,
    price: 210.00,
    costPrice: 155.00,
    expiryDate: new Date('2027-11-12'),
    manufactureDate: new Date('2024-11-01'),
    location: 'Rack C-3',
    description: 'Non-sedating second generation antihistamine for seasonal allergy symptoms.',
    barcode: '8901117001173'
  },
  {
    name: 'Ciplox Eye/Ear Drops 10ml',
    genericName: 'Ciprofloxacin 0.3%',
    brand: 'Cipla',
    category: 'Drops',
    batchNumber: 'CPD-882',
    quantity: 35,
    price: 28.00,
    costPrice: 18.00,
    expiryDate: new Date('2026-09-20'),
    manufactureDate: new Date('2024-09-01'),
    location: 'Rack G-1',
    description: 'Sterile antibacterial ophthalmic and otic solution for bacterial conjunctivitis and otitis.',
    barcode: '8901117001180'
  },
  {
    name: 'Thyronorm 50mcg',
    genericName: 'Levothyroxine Sodium',
    brand: 'Abbott',
    category: 'Tablet',
    batchNumber: 'THY-773',
    quantity: 95,
    price: 165.00,
    costPrice: 120.00,
    expiryDate: new Date('2027-10-30'),
    manufactureDate: new Date('2024-10-01'),
    location: 'Rack C-4',
    description: 'Synthetic thyroid hormone replacement therapy for primary and secondary hypothyroidism.',
    barcode: '8901117001197'
  },
  {
    name: 'Calpol 250mg Suspension',
    genericName: 'Paracetamol Paediatric Suspension',
    brand: 'GSK',
    category: 'Syrup',
    batchNumber: 'CAL-114',
    quantity: 50,
    price: 52.00,
    costPrice: 36.00,
    expiryDate: new Date('2027-06-25'),
    manufactureDate: new Date('2024-06-01'),
    location: 'Rack D-3',
    description: 'Strawberry flavored paediatric suspension for pain and fever relief in children.',
    barcode: '8901117001203'
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in backend/.env');
    }

    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('[Seed] Connected successfully.');

    // Upsert each medicine by name and batchNumber
    let inserted = 0;
    let updated = 0;

    for (const medData of sampleMedicines) {
      const existing = await Medicine.findOne({
        $or: [
          { name: medData.name, batchNumber: medData.batchNumber },
          { barcode: medData.barcode }
        ]
      });

      if (existing) {
        await Medicine.findByIdAndUpdate(existing._id, medData);
        updated++;
      } else {
        await Medicine.create(medData);
        inserted++;
      }
    }

    const totalCount = await Medicine.countDocuments();
    console.log(`[Seed Complete] Inserted: ${inserted}, Updated: ${updated}, Total Medicines in DB: ${totalCount}`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
}

seedDatabase();
