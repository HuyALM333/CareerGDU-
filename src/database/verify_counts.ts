import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    const counts = {
        users: await prisma.user.count(),
        pendingUsers: await prisma.pendingUser.count(),
        companies: await prisma.company.count(),
        jobs: await prisma.job.count(),
        applications: await prisma.application.count(),
        heroSlides: await prisma.heroSlide.count(),
        news: await prisma.news.count(),
        siteConfigs: await prisma.siteConfig.count(),
        visitors: await prisma.visitor.count(),
        notifications: await prisma.notification.count(),
        savedJobs: await prisma.savedJob.count(),
        userReviews: await prisma.userReview.count(),
        contacts: await prisma.contact.count(),
        reports: await prisma.report.count()
    };
    
    console.log('Database Record Counts:');
    console.table(counts);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
