import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

async function main() {
  console.log('Seeding database...');

  // --- Clear existing data (reverse dependency order) ---
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.modelMetrics.deleteMany(),
    prisma.diagnosis.deleteMany(),
    prisma.upload.deleteMany(),
    prisma.report.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.user.deleteMany(),
    prisma.hospital.deleteMany(),
  ]);
  console.log('Cleared existing data.');

  // --- Hospitals ---
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: {
        name: 'City General Hospital',
        address: 'Ashram Road, Ahmedabad, Gujarat 380009',
        createdAt: new Date('2024-01-10'),
      },
    }),
    prisma.hospital.create({
      data: {
        name: 'Apollo Diagnostics Centre',
        address: 'Andheri East, Mumbai, Maharashtra 400069',
        createdAt: new Date('2024-02-05'),
      },
    }),
    prisma.hospital.create({
      data: {
        name: 'KIMS Multi-Specialty Hospital',
        address: 'Secunderabad, Hyderabad, Telangana 500003',
        createdAt: new Date('2024-03-12'),
      },
    }),
    prisma.hospital.create({
      data: {
        name: 'Fortis Healthcare',
        address: 'Bannerghatta Road, Bengaluru, Karnataka 560076',
        createdAt: new Date('2024-01-20'),
      },
    }),
  ]);
  console.log(`Created ${hospitals.length} hospitals.`);

  const [h1, h2, h3, h4] = hospitals;

  // --- Users ---
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // ADMIN (no hospital)
    prisma.user.create({
      data: {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@admin.com',
        password: passwordHash,
        role: 'ADMIN',
        createdAt: new Date('2024-01-15'),
      },
    }),
    // DOCTORs
    prisma.user.create({
      data: {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@citygeneral.com',
        password: passwordHash,
        role: 'DOCTOR',
        hospitalId: h1.id,
        createdAt: new Date('2024-02-01'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Rajesh Nair',
        email: 'rajesh.nair@apollo.com',
        password: passwordHash,
        role: 'DOCTOR',
        hospitalId: h2.id,
        createdAt: new Date('2024-02-10'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Sunita Reddy',
        email: 'sunita.reddy@kims.com',
        password: passwordHash,
        role: 'DOCTOR',
        hospitalId: h3.id,
        createdAt: new Date('2024-03-01'),
      },
    }),
    // LAB_TECHs
    prisma.user.create({
      data: {
        name: 'Vikram Patel',
        email: 'vikram.patel@citygeneral.com',
        password: passwordHash,
        role: 'LAB_TECH',
        hospitalId: h1.id,
        createdAt: new Date('2024-02-05'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Anita Kulkarni',
        email: 'anita.kulkarni@apollo.com',
        password: passwordHash,
        role: 'LAB_TECH',
        hospitalId: h2.id,
        createdAt: new Date('2024-02-15'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Suresh Iyer',
        email: 'suresh.iyer@fortis.com',
        password: passwordHash,
        role: 'LAB_TECH',
        hospitalId: h4.id,
        createdAt: new Date('2024-03-05'),
      },
    }),
    // HOSPITAL users
    prisma.user.create({
      data: {
        name: 'Meena Desai',
        email: 'admin@citygeneral.com',
        password: passwordHash,
        role: 'HOSPITAL',
        hospitalId: h1.id,
        createdAt: new Date('2024-01-12'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Kiran Bose',
        email: 'admin@apollo.com',
        password: passwordHash,
        role: 'HOSPITAL',
        hospitalId: h2.id,
        createdAt: new Date('2024-02-08'),
      },
    }),
  ]);
  console.log(`Created ${users.length} users.`);

  const [admin, doc1, doc2, doc3, lab1, lab2, lab3, hosp1, hosp2] = users;
  const labAndDoctorUsers = [doc1, doc2, doc3, lab1, lab2, lab3];

  // --- Patients (20 patients across hospitals) ---
  const patientData = [
    { name: 'Rahul Gupta',       age: 34, gender: 'MALE',   hospitalId: h1.id, createdAt: new Date('2025-10-05') },
    { name: 'Kavitha Menon',     age: 52, gender: 'FEMALE', hospitalId: h1.id, createdAt: new Date('2025-10-18') },
    { name: 'Sanjay Tiwari',     age: 45, gender: 'MALE',   hospitalId: h1.id, createdAt: new Date('2025-11-02') },
    { name: 'Lakshmi Pillai',    age: 29, gender: 'FEMALE', hospitalId: h1.id, createdAt: new Date('2025-11-20') },
    { name: 'Deepak Joshi',      age: 61, gender: 'MALE',   hospitalId: h1.id, createdAt: new Date('2025-12-08') },
    { name: 'Pooja Agarwal',     age: 38, gender: 'FEMALE', hospitalId: h2.id, createdAt: new Date('2025-10-12') },
    { name: 'Mohan Rao',         age: 57, gender: 'MALE',   hospitalId: h2.id, createdAt: new Date('2025-10-28') },
    { name: 'Nisha Choudhary',   age: 23, gender: 'FEMALE', hospitalId: h2.id, createdAt: new Date('2025-11-14') },
    { name: 'Ashok Verma',       age: 70, gender: 'MALE',   hospitalId: h2.id, createdAt: new Date('2025-12-01') },
    { name: 'Geeta Krishnan',    age: 42, gender: 'FEMALE', hospitalId: h2.id, createdAt: new Date('2025-12-19') },
    { name: 'Ravi Shankar',      age: 55, gender: 'MALE',   hospitalId: h3.id, createdAt: new Date('2025-10-09') },
    { name: 'Anjali Singh',      age: 31, gender: 'FEMALE', hospitalId: h3.id, createdAt: new Date('2025-10-25') },
    { name: 'Manoj Kumar',       age: 48, gender: 'MALE',   hospitalId: h3.id, createdAt: new Date('2025-11-10') },
    { name: 'Divya Nambiar',     age: 27, gender: 'FEMALE', hospitalId: h3.id, createdAt: new Date('2025-11-28') },
    { name: 'Prakash Yadav',     age: 64, gender: 'MALE',   hospitalId: h3.id, createdAt: new Date('2026-01-05') },
    { name: 'Shweta Bhatt',      age: 36, gender: 'FEMALE', hospitalId: h4.id, createdAt: new Date('2025-12-10') },
    { name: 'Vinod Malhotra',    age: 53, gender: 'MALE',   hospitalId: h4.id, createdAt: new Date('2026-01-15') },
    { name: 'Rekha Pandey',      age: 44, gender: 'FEMALE', hospitalId: h4.id, createdAt: new Date('2026-02-03') },
    { name: 'Sunil Kapoor',      age: 18, gender: 'MALE',   hospitalId: h4.id, createdAt: new Date('2026-02-20') },
    { name: 'Farida Khan',       age: 67, gender: 'FEMALE', hospitalId: h4.id, createdAt: new Date('2026-03-07') },
    { name: 'Arun Chatterjee',   age: 39, gender: 'MALE',   hospitalId: h1.id, createdAt: new Date('2026-01-22') },
    { name: 'Meera Srinivasan',  age: 50, gender: 'FEMALE', hospitalId: h2.id, createdAt: new Date('2026-02-10') },
    { name: 'Hemant Saxena',     age: 73, gender: 'MALE',   hospitalId: h3.id, createdAt: new Date('2026-02-25') },
  ];

  const patients = [];
  for (const pd of patientData) {
    const patient = await prisma.patient.create({ data: pd });
    patients.push(patient);
  }
  console.log(`Created ${patients.length} patients.`);

  // --- Reports ---
  const reports = [];
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const patientDate = patient.createdAt;
    const reportDate = new Date(patientDate);
    reportDate.setDate(reportDate.getDate() + 1);

    const dateStr = reportDate.toISOString().slice(0, 10).replace(/-/g, '');
    const num = String(i + 1).padStart(3, '0');
    const sampleId = `SMPL-${dateStr}-${num}`;
    const uuidFrag = randomBytes(6).toString('hex');

    const report = await prisma.report.create({
      data: {
        sampleId,
        reportUrl: `/reports/report-${uuidFrag}.pdf`,
        patientId: patient.id,
        createdAt: reportDate,
      },
    });
    reports.push(report);
  }
  console.log(`Created ${reports.length} reports.`);

  // --- Uploads ---
  const uploads = [];
  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const uploader = labAndDoctorUsers[i % labAndDoctorUsers.length];
    const fileHash = randomBytes(16).toString('hex');
    const num = String(i + 1).padStart(3, '0');

    const upload = await prisma.upload.create({
      data: {
        imageUrl: `/uploads/blood-cell-${num}.png`,
        fileHash,
        userId: uploader.id,
        reportId: report.id,
        uploadedAt: report.createdAt,
      },
    });
    uploads.push(upload);
  }
  console.log(`Created ${uploads.length} uploads.`);

  // --- Diagnoses ---
  // ~22% cancerous (5 out of 23), rest non-cancerous
  const cancerousIndices = new Set([2, 5, 10, 15, 19]);
  const models = ['bccd', 'efficientnet'];
  const confidenceValues = [
    0.92, 0.88, 0.78, 0.95, 0.71,
    0.83, 0.90, 0.67, 0.97, 0.74,
    0.82, 0.88, 0.70, 0.94, 0.76,
    0.85, 0.68, 0.91, 0.73, 0.79,
    0.96, 0.87, 0.65,
  ];

  const diagnoses = [];
  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const isCancerous = cancerousIndices.has(i);
    const modelName = models[i % 2];
    const num = String(i + 1).padStart(3, '0');

    const wbc = 30 + Math.floor((i * 7) % 51);       // 30-80
    const rbc = 3500 + Math.floor((i * 113) % 2001);  // 3500-5500
    const platelets = 150 + Math.floor((i * 37) % 251); // 150-400

    const processingTimes = ['1.8s', '2.1s', '2.5s', '1.9s', '3.0s', '2.3s', '1.7s', '2.8s'];
    const qualities = ['good', 'excellent', 'good', 'fair', 'excellent', 'good'];

    const diagnosis = await prisma.diagnosis.create({
      data: {
        result: isCancerous ? 'Cancerous' : 'Non-Cancerous',
        confidence: confidenceValues[i],
        metadata: {
          processingTime: processingTimes[i % processingTimes.length],
          imageQuality: qualities[i % qualities.length],
        },
        modelName,
        cellBreakdown: { wbc, rbc, platelets },
        heatmapUrl: `/heatmaps/gradcam-${num}.png`,
        reportId: report.id,
        createdAt: report.createdAt,
      },
    });
    diagnoses.push(diagnosis);
  }
  console.log(`Created ${diagnoses.length} diagnoses.`);
  console.log(`  - Cancerous: ${diagnoses.filter(d => d.result === 'Cancerous').length}`);
  console.log(`  - Non-Cancerous: ${diagnoses.filter(d => d.result === 'Non-Cancerous').length}`);

  // --- AuditLogs ---
  const actions = ['LOGIN', 'UPLOAD_SAMPLE', 'VIEW_DIAGNOSIS', 'VIEW_REPORT', 'EXPORT_DATA', 'UPDATE_PROFILE'];
  const ips = ['192.168.1.10', '192.168.1.15', '192.168.1.22', '192.168.1.34', '192.168.1.45'];
  const auditDates = [
    new Date('2025-12-01'), new Date('2025-12-08'), new Date('2025-12-15'),
    new Date('2025-12-22'), new Date('2026-01-03'), new Date('2026-01-10'),
    new Date('2026-01-17'), new Date('2026-01-24'), new Date('2026-02-01'),
    new Date('2026-02-07'), new Date('2026-02-14'), new Date('2026-02-21'),
    new Date('2026-03-01'), new Date('2026-03-08'), new Date('2026-03-15'),
    new Date('2026-03-22'), new Date('2026-03-28'),
  ];

  const auditLogs = [];
  // ~2 entries per audit date across different users
  for (let i = 0; i < 34; i++) {
    const user = users[i % users.length];
    const log = await prisma.auditLog.create({
      data: {
        action: actions[i % actions.length],
        ipAddress: ips[i % ips.length],
        userId: user.id,
        createdAt: auditDates[i % auditDates.length],
      },
    });
    auditLogs.push(log);
  }
  console.log(`Created ${auditLogs.length} audit log entries.`);

  // --- ModelMetrics ---
  const metricsData = [
    // bccd model — 4 evaluation snapshots
    { modelName: 'bccd', accuracy: 0.872, precision: 0.855, recall: 0.831, f1Score: 0.843, totalPredictions: 80,  evaluatedAt: new Date('2025-12-01'), createdAt: new Date('2025-12-01') },
    { modelName: 'bccd', accuracy: 0.889, precision: 0.871, recall: 0.848, f1Score: 0.859, totalPredictions: 155, evaluatedAt: new Date('2026-01-01'), createdAt: new Date('2026-01-01') },
    { modelName: 'bccd', accuracy: 0.906, precision: 0.888, recall: 0.864, f1Score: 0.876, totalPredictions: 238, evaluatedAt: new Date('2026-02-01'), createdAt: new Date('2026-02-01') },
    { modelName: 'bccd', accuracy: 0.921, precision: 0.903, recall: 0.880, f1Score: 0.891, totalPredictions: 320, evaluatedAt: new Date('2026-03-01'), createdAt: new Date('2026-03-01') },
    // efficientnet model — 4 evaluation snapshots
    { modelName: 'efficientnet', accuracy: 0.886, precision: 0.870, recall: 0.845, f1Score: 0.857, totalPredictions: 75,  evaluatedAt: new Date('2025-12-01'), createdAt: new Date('2025-12-01') },
    { modelName: 'efficientnet', accuracy: 0.901, precision: 0.884, recall: 0.862, f1Score: 0.873, totalPredictions: 160, evaluatedAt: new Date('2026-01-01'), createdAt: new Date('2026-01-01') },
    { modelName: 'efficientnet', accuracy: 0.918, precision: 0.899, recall: 0.878, f1Score: 0.888, totalPredictions: 245, evaluatedAt: new Date('2026-02-01'), createdAt: new Date('2026-02-01') },
    { modelName: 'efficientnet', accuracy: 0.934, precision: 0.917, recall: 0.896, f1Score: 0.906, totalPredictions: 340, evaluatedAt: new Date('2026-03-01'), createdAt: new Date('2026-03-01') },
  ];

  const modelMetrics = [];
  for (const m of metricsData) {
    const metric = await prisma.modelMetrics.create({ data: m });
    modelMetrics.push(metric);
  }
  console.log(`Created ${modelMetrics.length} model metrics records.`);
  console.log('  - bccd records:', modelMetrics.filter(m => m.modelName === 'bccd').length);
  console.log('  - efficientnet records:', modelMetrics.filter(m => m.modelName === 'efficientnet').length);

  console.log('\nSeed completed successfully!');
  console.log('Summary:');
  console.log(`  Hospitals:     ${hospitals.length}`);
  console.log(`  Users:         ${users.length}`);
  console.log(`  Patients:      ${patients.length}`);
  console.log(`  Reports:       ${reports.length}`);
  console.log(`  Uploads:       ${uploads.length}`);
  console.log(`  Diagnoses:     ${diagnoses.length}`);
  console.log(`  AuditLogs:     ${auditLogs.length}`);
  console.log(`  ModelMetrics:  ${modelMetrics.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
