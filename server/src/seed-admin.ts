import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { DB, saltRounds } from './config/variables';
import { adminSchema } from './models/admin';

dotenv.config();

async function seedAdmin() {
    try {
        // Connect to MongoDB
        console.log('Connecting to database...');
        await mongoose.connect(DB as string);
        console.log('Database connected successfully');

        // Admin data (change these values as needed)
        const adminData = {
            name: 'admin',
            email: 'admin@csrkuwait.com',
            password: 'admin123', // Change this password
            role: 0, // 0 = SUPER_ADMIN
        };

        // Check if admin already exists
        const existingAdmin = await adminSchema.findOne({ 
            $or: [
                { name: adminData.name },
                { email: adminData.email }
            ]
        });

        if (existingAdmin) {
            console.log('Admin already exists. Updating password...');
            // Hash the password
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
            
            // Update the password
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            
            console.log('Admin password updated successfully!');
            console.log('Name:', adminData.name);
            console.log('Email:', adminData.email);
        } else {
            console.log('Creating new admin...');
            // Hash the password
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
            
            // Create admin
            const admin = new adminSchema({
                name: adminData.name,
                email: adminData.email,
                password: hashedPassword,
                role: adminData.role,
            });

            await admin.save();
            console.log('Admin created successfully!');
            console.log('Name:', adminData.name);
            console.log('Email:', adminData.email);
        }

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the seed function
seedAdmin();




