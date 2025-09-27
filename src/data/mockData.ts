import { Referral, PersonalInvestment, Lead } from '@/types';

const addDays = (date: string, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

const calculateEarnings = (amount: number): number => amount * 0.24;
const calculateUserIncome = (referralEarnings: number): number => referralEarnings * 0.20;

export const mockFirstGenReferrals: Referral[] = [
  {
    id: '1g-001',
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+1 555-0101',
    generation: 1,
    amount: 15000,
    startDate: '2024-08-15',
    expirationDate: '2024-09-12',
    status: 'active',
    earnings: calculateEarnings(15000),
    userIncome: calculateUserIncome(calculateEarnings(15000)),
    cycleCount: 1,
    totalEarned: calculateEarnings(15000)
  },
  {
    id: '1g-002',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 555-0102',
    generation: 1,
    amount: 25000,
    startDate: '2024-08-20',
    expirationDate: '2024-09-17',
    status: 'active',
    earnings: calculateEarnings(25000),
    userIncome: calculateUserIncome(calculateEarnings(25000)),
    cycleCount: 1,
    totalEarned: calculateEarnings(25000)
  },
  {
    id: '1g-003',
    name: 'Jose Martinez',
    email: 'jose.martinez@email.com',
    phone: '+1 555-0103',
    generation: 1,
    amount: 12000,
    startDate: '2024-08-25',
    expirationDate: '2024-09-22',
    status: 'active',
    earnings: calculateEarnings(12000),
    userIncome: calculateUserIncome(calculateEarnings(12000)),
    cycleCount: 1,
    totalEarned: calculateEarnings(12000)
  },
  {
    id: '1g-004',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '+1 555-0104',
    generation: 1,
    amount: 30000,
    startDate: '2024-09-01',
    expirationDate: '2024-09-29',
    status: 'active',
    earnings: calculateEarnings(30000),
    userIncome: calculateUserIncome(calculateEarnings(30000)),
    cycleCount: 1,
    totalEarned: calculateEarnings(30000)
  },
  {
    id: '1g-005',
    name: 'Luis Hernandez',
    email: 'luis.hernandez@email.com',
    generation: 1,
    amount: 18000,
    startDate: '2024-09-03',
    expirationDate: '2024-10-01',
    status: 'active',
    earnings: calculateEarnings(18000),
    userIncome: calculateUserIncome(calculateEarnings(18000)),
    cycleCount: 1,
    totalEarned: calculateEarnings(18000)
  },
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `1g-${String(i + 6).padStart(3, '0')}`,
    name: `Referido ${i + 6} Gen1`,
    email: `referido${i + 6}@email.com`,
    phone: `+1 555-0${String(i + 105).padStart(3, '0')}`,
    generation: 1 as const,
    amount: 10000 + (i * 2000) + Math.floor(Math.random() * 5000),
    startDate: addDays('2024-08-01', i * 2),
    expirationDate: addDays('2024-08-01', (i * 2) + 28),
    status: 'active' as const,
    earnings: 0,
    userIncome: 0,
    cycleCount: 1,
    totalEarned: 0
  })).map(referral => ({
    ...referral,
    earnings: calculateEarnings(referral.amount),
    userIncome: calculateUserIncome(calculateEarnings(referral.amount)),
    totalEarned: calculateEarnings(referral.amount)
  }))
];

export const mockSecondGenReferrals: Referral[] = [
  {
    id: '2g-001',
    name: 'Pedro Lopez',
    email: 'pedro.lopez@email.com',
    phone: '+1 555-0201',
    generation: 2,
    amount: 8000,
    startDate: '2024-08-18',
    expirationDate: '2024-09-15',
    status: 'active',
    referredBy: '1g-001',
    earnings: calculateEarnings(8000),
    userIncome: calculateUserIncome(calculateEarnings(8000)) * 0.5, 
    cycleCount: 1,
    totalEarned: calculateEarnings(8000)
  },
  {
    id: '2g-002',
    name: 'Sofia Diaz',
    email: 'sofia.diaz@email.com',
    phone: '+1 555-0202',
    generation: 2,
    amount: 12000,
    startDate: '2024-08-22',
    expirationDate: '2024-09-19',
    status: 'active',
    referredBy: '1g-002',
    earnings: calculateEarnings(12000),
    userIncome: calculateUserIncome(calculateEarnings(12000)) * 0.5,
    cycleCount: 1,
    totalEarned: calculateEarnings(12000)
  },
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `2g-${String(i + 3).padStart(3, '0')}`,
    name: `Referido ${i + 3} Gen2`,
    email: `referido2g${i + 3}@email.com`,
    phone: `+1 555-0${String(i + 203).padStart(3, '0')}`,
    generation: 2 as const,
    amount: 5000 + (i * 1000) + Math.floor(Math.random() * 3000),
    startDate: addDays('2024-08-10', i * 3),
    expirationDate: addDays('2024-08-10', (i * 3) + 28),
    status: 'active' as const,
    referredBy: `1g-${String(Math.floor(i / 2) + 1).padStart(3, '0')}`,
    earnings: 0,
    userIncome: 0,
    cycleCount: 1,
    totalEarned: 0
  })).map(referral => ({
    ...referral,
    earnings: calculateEarnings(referral.amount),
    userIncome: calculateUserIncome(calculateEarnings(referral.amount)) * 0.5,
    totalEarned: calculateEarnings(referral.amount)
  }))
];

export const mockPersonalInvestments: PersonalInvestment[] = [
  {
    id: 'inv-001',
    amount: 50000,
    startDate: '2024-08-01',
    expirationDate: '2024-08-29',
    status: 'active',
    earnings: calculateEarnings(50000),
    cycleCount: 1,
    totalEarned: calculateEarnings(50000)
  },
  {
    id: 'inv-002',
    amount: 75000,
    startDate: '2024-08-15',
    expirationDate: '2024-09-12',
    status: 'active',
    earnings: calculateEarnings(75000),
    cycleCount: 1,
    totalEarned: calculateEarnings(75000)
  }
];

export const mockInterestedLeads: Lead[] = [
  {
    id: 'lead-int-001',
    name: 'Roberto Jimenez',
    email: 'roberto.jimenez@email.com',
    phone: '+1 555-0301',
    status: 'interested',
    notes: 'Muy interesado, pidió más información sobre los ciclos',
    contactDate: '2024-09-20',
    lastContact: '2024-09-23',
    source: 'Referencia de Carlos Rodriguez'
  },
  {
    id: 'lead-int-002',
    name: 'Carmen Ruiz',
    email: 'carmen.ruiz@email.com',
    phone: '+1 555-0302',
    status: 'interested',
    notes: 'Quiere empezar con una inversión pequeña',
    contactDate: '2024-09-18',
    lastContact: '2024-09-22',
    source: 'Facebook'
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `lead-int-${String(i + 3).padStart(3, '0')}`,
    name: `Interesado ${i + 3}`,
    email: `interesado${i + 3}@email.com`,
    phone: `+1 555-0${String(i + 303).padStart(3, '0')}`,
    status: 'interested' as const,
    notes: `Contactado el ${addDays('2024-09-15', i)}`,
    contactDate: addDays('2024-09-15', i),
    lastContact: addDays('2024-09-15', i + 2),
    source: ['Instagram', 'WhatsApp', 'Referencia'][i % 3]
  }))
];

export const mockDoubtfulLeads: Lead[] = [
  {
    id: 'lead-doubt-001',
    name: 'Miguel Torres',
    email: 'miguel.torres@email.com',
    phone: '+1 555-0401',
    status: 'doubtful',
    notes: 'Tiene dudas sobre la rentabilidad, necesita más explicaciones',
    contactDate: '2024-09-10',
    lastContact: '2024-09-20',
    source: 'LinkedIn'
  },
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `lead-doubt-${String(i + 2).padStart(3, '0')}`,
    name: `Dudoso ${i + 2}`,
    email: `dudoso${i + 2}@email.com`,
    phone: `+1 555-0${String(i + 402).padStart(3, '0')}`,
    status: 'doubtful' as const,
    notes: `En proceso de decisión desde ${addDays('2024-09-01', i * 3)}`,
    contactDate: addDays('2024-09-01', i * 3),
    lastContact: addDays('2024-09-01', i * 3 + 7),
    source: ['Email', 'Llamada fría', 'Evento'][i % 3]
  }))
];

export const mockRejectedLeads: Lead[] = [
  {
    id: 'lead-rej-001',
    name: 'Elena Morales',
    email: 'elena.morales@email.com',
    status: 'rejected',
    notes: 'No le interesa el modelo de negocio',
    contactDate: '2024-09-05',
    lastContact: '2024-09-10',
    source: 'Instagram'
  },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `lead-rej-${String(i + 2).padStart(3, '0')}`,
    name: `Rechazado ${i + 2}`,
    email: `rechazado${i + 2}@email.com`,
    status: 'rejected' as const,
    notes: `Rechazó la propuesta el ${addDays('2024-08-15', i * 4)}`,
    contactDate: addDays('2024-08-15', i * 4),
    lastContact: addDays('2024-08-15', i * 4 + 3),
    source: ['WhatsApp', 'Referencia', 'Facebook'][i % 3]
  }))
];

export const mockReferrals = [...mockFirstGenReferrals, ...mockSecondGenReferrals];
export const mockLeads = [...mockInterestedLeads, ...mockDoubtfulLeads, ...mockRejectedLeads];