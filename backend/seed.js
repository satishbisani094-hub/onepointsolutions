const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create Users (Staff/Admins)
  const user1 = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@onepoint.com',
      password_hash: 'hashedpassword',
      role: 'Admin',
    }
  });

  const staff1 = await prisma.user.create({
    data: {
      name: 'Mike Johnson',
      email: 'mike.j@onepoint.com',
      password_hash: 'hashedpassword',
      role: 'DeliveryStaff',
      staffDetails: {
        create: {
          phone: '+1 234 567 8901',
          availability_status: 'On Duty',
          current_location: 'Warehouse A'
        }
      }
    }
  });

  const staff2 = await prisma.user.create({
    data: {
      name: 'Sarah Williams',
      email: 'sarah.w@onepoint.com',
      password_hash: 'hashedpassword',
      role: 'DeliveryStaff',
      staffDetails: {
        create: {
          phone: '+1 234 567 8902',
          availability_status: 'Available',
          current_location: 'Downtown Hub'
        }
      }
    }
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'TechCorp Solutions',
      phone: '+1 555 123 4567',
      email: 'jane@techcorp.com',
      address: 'Downtown Business Park'
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'EventMasters Inc.',
      phone: '+1 555 987 6543',
      email: 'robert@eventmasters.com',
      address: 'Westside Convention Center'
    }
  });

  // Create Devices
  const device1 = await prisma.device.create({
    data: {
      name: 'MacBook Pro M2 16"',
      category: 'Laptops',
      serial_number: 'MBP-2023-001',
      rental_price: 150,
      availability_status: 'Available',
      condition: 'Excellent'
    }
  });

  const device2 = await prisma.device.create({
    data: {
      name: 'Epson Pro L1070U',
      category: 'Projectors',
      serial_number: 'EPS-PRJ-042',
      rental_price: 200,
      availability_status: 'Rented',
      condition: 'Good'
    }
  });

  const device3 = await prisma.device.create({
    data: {
      name: 'JBL EON612 PA System',
      category: 'Audio',
      serial_number: 'JBL-PA-015',
      rental_price: 80,
      availability_status: 'Available',
      condition: 'Good'
    }
  });

  // Create Tasks
  await prisma.task.create({
    data: {
      type: 'Delivery',
      status: 'Assigned',
      priority: 'High',
      scheduled_time: new Date(),
      location_address: 'Tech Park, Building A',
      notes: 'Urgent delivery for conference',
      customer_id: customer1.id,
      device_id: device1.id,
      assigned_staff_id: staff1.id
    }
  });

  await prisma.task.create({
    data: {
      type: 'Pickup',
      status: 'Pending',
      priority: 'Medium',
      scheduled_time: new Date(new Date().getTime() + 1000 * 60 * 60 * 2),
      location_address: 'Downtown Conf Center',
      customer_id: customer2.id,
      device_id: device2.id
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
