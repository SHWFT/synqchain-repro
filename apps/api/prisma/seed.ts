import { PrismaClient, UserRole, POStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'SynqChain Demo Company',
    },
  });

  console.log(`📊 Created/Updated tenant: ${tenant.name} (${tenant.id})`);

  // Create Demo Admin user
  const hashedPassword = await bcrypt.hash('demo', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@demo.com' },
    update: {
      password: hashedPassword, // Update password in case it changed
    },
    create: {
      email: 'demo@demo.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log(`👤 Created/Updated demo admin: ${demoUser.email}`);

  // Create suppliers
  const suppliers = [];
  const supplierData = [
    { name: 'Acme Corp', category: 'Manufacturing', location: 'New York, NY', contact: 'John Smith', phone: '+1-555-0101' },
    { name: 'Global Logistics Ltd', category: 'Logistics', location: 'Los Angeles, CA', contact: 'Sarah Johnson', phone: '+1-555-0102' },
    { name: 'Tech Solutions Inc', category: 'Technology', location: 'San Francisco, CA', contact: 'Mike Wilson', phone: '+1-555-0103' },
    { name: 'Premium Materials Co', category: 'Raw Materials', location: 'Chicago, IL', contact: 'Emily Davis', phone: '+1-555-0104' },
    { name: 'Efficient Transport', category: 'Transportation', location: 'Atlanta, GA', contact: 'David Brown', phone: '+1-555-0105' },
    { name: 'Quality Parts LLC', category: 'Components', location: 'Detroit, MI', contact: 'Lisa Anderson', phone: '+1-555-0106' },
    { name: 'Reliable Services', category: 'Services', location: 'Houston, TX', contact: 'Tom Miller', phone: '+1-555-0107' },
    { name: 'Fast Delivery Co', category: 'Logistics', location: 'Phoenix, AZ', contact: 'Jennifer Garcia', phone: '+1-555-0108' },
    { name: 'Industrial Supply', category: 'Manufacturing', location: 'Philadelphia, PA', contact: 'Robert Martinez', phone: '+1-555-0109' },
    { name: 'Smart Systems', category: 'Technology', location: 'Seattle, WA', contact: 'Amanda Wilson', phone: '+1-555-0110' },
  ];

  for (const supplierInfo of supplierData) {
    const supplier = await prisma.supplier.create({
      data: {
        ...supplierInfo,
        tenantId: tenant.id,
      },
    });
    suppliers.push(supplier);
  }

  // Create projects
  const projects = [];
  const projectData = [
    { name: 'Supply Chain Optimization', description: 'Streamline procurement processes', client: 'Acme Corp', priority: 'High', savingsTarget: 50000, status: 'In Progress' },
    { name: 'Cost Reduction Initiative', description: 'Reduce operational costs by 15%', client: 'Tech Solutions Inc', priority: 'Medium', savingsTarget: 75000, status: 'Planning' },
    { name: 'Vendor Consolidation', description: 'Consolidate supplier base', client: 'Global Logistics Ltd', priority: 'High', savingsTarget: 30000, status: 'Completed' },
    { name: 'Digital Transformation', description: 'Modernize procurement systems', client: 'Premium Materials Co', priority: 'Low', savingsTarget: 25000, status: 'In Progress' },
    { name: 'Quality Improvement', description: 'Enhance supplier quality standards', client: 'Quality Parts LLC', priority: 'Medium', savingsTarget: 40000, status: 'Planning' },
    { name: 'Logistics Optimization', description: 'Optimize delivery routes and timing', client: 'Efficient Transport', priority: 'High', savingsTarget: 60000, status: 'In Progress' },
    { name: 'Contract Negotiation', description: 'Renegotiate major supplier contracts', client: 'Reliable Services', priority: 'Medium', savingsTarget: 35000, status: 'Completed' },
    { name: 'Risk Management', description: 'Implement supplier risk assessment', client: 'Fast Delivery Co', priority: 'High', savingsTarget: 20000, status: 'Planning' },
    { name: 'Sustainability Initiative', description: 'Green supply chain implementation', client: 'Industrial Supply', priority: 'Low', savingsTarget: 45000, status: 'In Progress' },
    { name: 'Performance Analytics', description: 'Advanced supplier performance tracking', client: 'Smart Systems', priority: 'Medium', savingsTarget: 55000, status: 'Completed' },
  ];

  for (const projectInfo of projectData) {
    const project = await prisma.project.create({
      data: {
        ...projectInfo,
        tenantId: tenant.id,
        startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within next 90 days
      },
    });
    projects.push(project);
  }

  // Create purchase orders
  const statuses = [POStatus.DRAFT, POStatus.PENDING_APPROVAL, POStatus.APPROVED, POStatus.ACKNOWLEDGED, POStatus.IN_FULFILLMENT, POStatus.DELIVERED];
  
  for (let i = 1; i <= 20; i++) {
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const total = Math.floor(Math.random() * 50000) + 1000; // Random total between $1,000 and $51,000

    const po = await prisma.purchaseOrder.create({
      data: {
        number: `PO-${i.toString().padStart(4, '0')}`,
        supplierId: randomSupplier.id,
        status: randomStatus,
        total: total,
        currency: 'USD',
        tenantId: tenant.id,
      },
    });

    // Create some events for each PO
    const eventTypes = ['created', 'submitted', 'approved', 'acknowledged', 'shipped', 'delivered'];
    const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 events per PO

    for (let j = 0; j < numEvents; j++) {
      await prisma.pOEvent.create({
        data: {
          poId: po.id,
          type: eventTypes[j],
          payload: {
            message: `PO ${eventTypes[j]} successfully`,
            timestamp: new Date(),
            user: demoUser.email,
          },
        },
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📧 Demo user: demo@demo.com / demo`);
  console.log(`🏢 Tenant: ${tenant.name}`);
  console.log(`🏪 Created ${suppliers.length} suppliers`);
  console.log(`📋 Created ${projects.length} projects`);
  console.log(`📦 Created 20 purchase orders`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
