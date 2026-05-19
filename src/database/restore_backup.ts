import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('DATABASE_URL found:', !!process.env.DATABASE_URL);

const prisma = new PrismaClient();

const BACKUP_DIR = path.join(process.cwd(), 'backups/2026-03-02_12-13-43');

function sanitize(data: any) {
    const sanitized = { ...data };
    if (sanitized.avatar && sanitized.avatar.length > 500) sanitized.avatar = sanitized.avatar.substring(0, 50) + "...";
    if (sanitized.image && sanitized.image.length > 500) sanitized.image = sanitized.image.substring(0, 50) + "...";
    if (sanitized.cvBase64 && sanitized.cvBase64.length > 500) sanitized.cvBase64 = sanitized.cvBase64.substring(0, 50) + "...";
    return sanitized;
}

async function readJsonFile(filename: string) {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filename}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mapSingle(item: any, allowedFields?: string[]) {
    const newItem = { ...item };
    if (newItem._id) {
        newItem.id = newItem._id;
        delete newItem._id;
    }
    
    // Convert dates
    for (const key in newItem) {
        const val = newItem[key];
        if (val && typeof val === 'string' && (key.toLowerCase().endsWith('at') || key.toLowerCase().endsWith('expiry') || key === 'deadline' || key === 'date' || key === 'timestamp' || key === 'savedAt' || key === 'appliedAt')) {
             if (val.match(/^\d{4}-\d{2}-\d{2}/)) {
                 newItem[key] = new Date(val);
             }
        } else if (val && typeof val === 'object' && val.$date) {
            newItem[key] = new Date(val.$date);
        }
    }
    
    delete newItem.__v;
    
    if (allowedFields) {
        const filtered: any = {};
        for (const key of allowedFields) {
            if (newItem[key] !== undefined) filtered[key] = newItem[key];
        }
        return filtered;
    }
    
    return newItem;
}

async function ensureUserExists(id: string) {
    if (!id || id === 'admin_system' || id === 'unknown_user') return;
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
        await prisma.user.create({
            data: {
                id,
                name: `Legacy User [${id.substring(0, 8)}]`,
                email: `legacy_${id}@system.internal`,
                password: 'no-password',
                role: 'student'
            }
        });
    }
}

async function ensureJobExists(id: string) {
    if (!id || id === 'unknown_job') return;
    const exists = await prisma.job.findUnique({ where: { id } });
    if (!exists) {
        await prisma.job.create({
            data: {
                id,
                title: `Legacy Job [${id.substring(0, 8)}]`,
                company: 'Legacy System',
                location: 'Unknown',
                type: 'full-time',
                field: 'other',
                creatorId: 'admin_system'
            }
        });
    }
}

async function main() {
    console.log('Starting data restoration...');

    // 1. Users
    const users = await readJsonFile('users.json');
    console.log(`Importing ${users.length} users...`);
    const userFields = ['id', 'name', 'email', 'password', 'role', 'phone', 'avatar', 'emailVerified', 'status', 'createdAt', 'updatedAt', 'studentId', 'major', 'faculty', 'cohort', 'contactPerson', 'companyName', 'companyType', 'companySize', 'foreignCapital', 'province', 'industry', 'address', 'website', 'description', 'size', 'emailOtp', 'emailOtpExpires', 'resetToken', 'resetTokenExpiry', 'passwordChangeOtp', 'passwordChangeOtpExpires', 'totpSecret', 'totpEnabled', 'pendingTotpSecret', 'recoveryCodes', 'pendingRecoveryCodes', 'notificationSettings', 'phoneVerified'];
    
    for (const user of users) {
        const data = mapSingle(user, userFields);
        try {
            await prisma.user.upsert({
                where: { email: data.email },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing user ${data.email}:`, error.message);
            console.error('Data:', JSON.stringify(sanitize(data), null, 2));
        }
    }

    // Ensure unknown_user exists if used
    try {
        await prisma.user.upsert({
            where: { id: 'unknown_user' },
            update: {},
            create: {
                id: 'unknown_user',
                name: 'System User (Import)',
                email: 'unknown@system.internal',
                password: 'no-password',
                role: 'student'
            }
        });
        await prisma.user.upsert({
            where: { id: 'admin_system' },
            update: {},
            create: {
                id: 'admin_system',
                name: 'Admin System',
                email: 'admin@system.internal',
                password: 'no-password',
                role: 'admin'
            }
        });
    } catch (e: any) {
        console.error('Error creating system user:', e.message);
    }

    // 2. Pending Users
    const pendingUsers = await readJsonFile('pending_users.json');
    console.log(`Importing ${pendingUsers.length} pending users...`);
    const pendingUserFields = ['id', 'name', 'email', 'password', 'role', 'phone', 'avatar', 'emailVerified', 'status', 'createdAt', 'studentId', 'major', 'contactPerson', 'companyName', 'companyType', 'companySize', 'foreignCapital', 'province', 'industry', 'address', 'emailOtp', 'emailOtpExpires'];
    for (const pUser of pendingUsers) {
        const data = mapSingle(pUser, pendingUserFields);
        try {
            await prisma.pendingUser.upsert({
                where: { email: data.email },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing pending user ${data.email}:`, error.message);
        }
    }

    // 3. Companies
    const companies = await readJsonFile('companies.json');
    console.log(`Importing ${companies.length} companies...`);
    const companyFields = ['id', 'name', 'logo', 'website', 'description', 'industry', 'size', 'address', 'status', 'verified', 'rating', 'benefits', 'openPositions', 'createdAt', 'updatedAt'];
    for (const company of companies) {
        // Map location to address
        if (company.location && !company.address) company.address = company.location;
        const data = mapSingle(company, companyFields);
        try {
            await prisma.company.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing company ${data.id}:`, error.message);
        }
    }

    // 4. Hero Slides
    const slides = await readJsonFile('hero_slides.json');
    console.log(`Importing ${slides.length} hero slides...`);
    const slideFields = ['id', 'title', 'subtitle', 'image', 'link', 'cta', 'order', 'isActive', 'page', 'createdAt', 'updatedAt'];
    for (const slide of slides) {
        const data = mapSingle(slide, slideFields);
        try {
            await prisma.heroSlide.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing hero slide ${data.id}:`, error.message);
        }
    }

    // 5. News
    const newsItems = await readJsonFile('news.json');
    console.log(`Importing ${newsItems.length} news items...`);
    const newsFields = ['id', 'title', 'content', 'category', 'author', 'slug', 'image', 'publishedAt', 'status', 'views', 'createdAt', 'updatedAt'];
    for (const news of newsItems) {
        if (news.summary && !news.content) news.content = news.summary;
        if (!news.content) news.content = news.title || 'No content';
        if (news.imageUrl && !news.image) news.image = news.imageUrl;
        
        const data = mapSingle(news, newsFields);
        if (!data.slug) data.slug = `news-${data.id || Math.random().toString(36).substring(7)}`;

        try {
            await prisma.news.upsert({
                where: { slug: data.slug },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing news ${data.slug}:`, error.message);
        }
    }

    // 6. Site Config
    const configs = await readJsonFile('site_configs.json');
    console.log(`Importing ${configs.length} site configs...`);
    for (const config of configs) {
        // Collect all fields into value except id, key, isActive, updatedAt, _id
        const value = { ...config };
        delete value._id;
        delete value.id;
        delete value.key;
        delete value.isActive;
        delete value.updatedAt;
        
        const data = {
            id: config._id || config.id,
            key: config.key,
            value: value,
            isActive: config.isActive !== undefined ? config.isActive : true,
            description: config.description || null,
        };
        try {
            await prisma.siteConfig.upsert({
                where: { key: data.key },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing site config ${data.key}:`, error.message);
        }
    }

    // 7. Jobs
    const jobs = await readJsonFile('jobs.json');
    console.log(`Importing ${jobs.length} jobs...`);
    const jobFields = ['id', 'title', 'company', 'companyId', 'logo', 'location', 'type', 'field', 'experience', 'education', 'salary', 'salaryMin', 'salaryMax', 'isNegotiable', 'deadline', 'description', 'requirements', 'benefits', 'detailedBenefits', 'relatedMajors', 'postedAt', 'status', 'applicants', 'views', 'quantity', 'contactEmail', 'contactPhone', 'documentUrl', 'documentName', 'logoFit', 'adminFeedback', 'creatorId'];
    for (const job of jobs) {
        // Ensure required fields
        if (!job.title) job.title = 'Untitled Job';
        if (!job.company) job.company = 'Unknown Company';
        if (!job.location) job.location = 'Unknown';
        if (!job.type) job.type = 'full-time';
        if (!job.field) job.field = 'other';

        // Ensure creatorId exists
        if (!job.creatorId && job.userId) job.creatorId = job.userId;
        if (!job.creatorId) job.creatorId = 'admin_system';
        
        await ensureUserExists(job.creatorId);

        const data = mapSingle(job, jobFields);
        
        // Fix deadline being converted to Date when it should be String
        if (data.deadline instanceof Date) {
            data.deadline = data.deadline.toISOString();
        }

        // Sanitize numeric fields
        data.applicants = data.applicants ? parseInt(data.applicants.toString()) || 0 : 0;
        data.views = data.views ? parseInt(data.views.toString()) || 0 : 0;
        data.quantity = data.quantity ? parseInt(data.quantity.toString()) || 1 : 1;
        if (data.salaryMin !== undefined) data.salaryMin = parseFloat(data.salaryMin.toString()) || 0;
        if (data.salaryMax !== undefined) data.salaryMax = parseFloat(data.salaryMax.toString()) || 0;

        try {
            await prisma.job.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing job ${data.id}:`, error.message);
        }
    }

    // Ensure unknown_job exists if used
    try {
        await prisma.job.upsert({
            where: { id: 'unknown_job' },
            update: {},
            create: {
                id: 'unknown_job',
                title: 'Unknown Job (Import)',
                company: 'System',
                location: 'System',
                type: 'full-time',
                field: 'other',
                creatorId: 'admin_system'
            }
        });
    } catch (e: any) {
        console.error('Error creating system job:', e.message);
    }

    // 8. Applications
    const apps = await readJsonFile('applications.json');
    console.log(`Importing ${apps.length} applications...`);
    const appFields = ['id', 'jobId', 'userId', 'name', 'email', 'phone', 'studentId', 'major', 'gpa', 'coverLetter', 'cvUrl', 'cvName', 'cvBase64', 'cvType', 'cvOriginalName', 'status', 'appliedAt', 'updatedAt', 'notes'];
    for (const app of apps) {
        if (app.fullname && !app.name) app.name = app.fullname;
        if (app.applicantId && !app.userId) app.userId = app.applicantId;
        
        if (!app.jobId) app.jobId = 'unknown_job';
        if (!app.userId) {
             if (app.email) {
                const user = await prisma.user.findUnique({ where: { email: app.email } });
                if (user) app.userId = user.id;
             }
             if (!app.userId) app.userId = 'unknown_user';
        }

        await ensureUserExists(app.userId);
        await ensureJobExists(app.jobId);

        const data = mapSingle(app, appFields);
        try {
            await prisma.application.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing application ${data.id}:`, error.message);
        }
    }

    // 9. Notifications
    const notifications = await readJsonFile('notifications.json');
    console.log(`Importing ${notifications.length} notifications...`);
    const notifyFields = ['id', 'userId', 'targetRole', 'type', 'title', 'message', 'link', 'read', 'createdAt', 'contactId', 'applicationId'];
    for (const notify of notifications) {
        if (notify.userId) await ensureUserExists(notify.userId);
        const data = mapSingle(notify, notifyFields);
        try {
            await prisma.notification.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            // console.error(`Error importing notification ${data.id}:`, error.message);
        }
    }

    // 10. Saved Jobs
    const savedJobs = await readJsonFile('saved_jobs.json');
    console.log(`Importing ${savedJobs.length} saved jobs...`);
    for (const sj of savedJobs) {
        if (!sj.userId || !sj.jobId) continue;
        await ensureUserExists(sj.userId);
        await ensureJobExists(sj.jobId);

        const data = mapSingle(sj, ['userId', 'jobId', 'savedAt']);
        if (!data.savedAt && sj.createdAt) data.savedAt = new Date(sj.createdAt);
        
        try {
            await prisma.savedJob.upsert({
                where: { userId_jobId: { userId: data.userId, jobId: data.jobId } },
                update: data,
                create: data
            });
        } catch (error: any) {
            // console.error(`Error importing saved job ${data.userId}_${data.jobId}:`, error.message);
        }
    }

    // 11. User Reviews
    const reviews = await readJsonFile('user_reviews.json');
    console.log(`Importing ${reviews.length} user reviews...`);
    const reviewFields = ['id', 'userId', 'rating', 'comment', 'createdAt', 'status', 'likes'];
    for (const review of reviews) {
        if (!review.userId) review.userId = 'unknown_user';
        if (review.content && !review.comment) review.comment = review.content;
        
        await ensureUserExists(review.userId);
        
        const data = mapSingle(review, reviewFields);
        try {
            await prisma.userReview.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing review ${data.id}:`, error.message);
        }
    }

    // 12. Review Likes
    const rLikes = await readJsonFile('review_likes.json');
    console.log(`Importing ${rLikes.length} review likes...`);
    for (const like of rLikes) {
        if (!like.userId || !like.reviewId) continue;
        await ensureUserExists(like.userId);
        // We could also ensureReviewExists, but usually userReviews are imported first.
        
        const data = mapSingle(like, ['reviewId', 'userId', 'createdAt']);
        try {
            await prisma.reviewLike.upsert({
                where: { reviewId_userId: { reviewId: data.reviewId, userId: data.userId } },
                update: data,
                create: data
            });
        } catch (error: any) {
            // console.error(`Error importing like ${data.reviewId}_${data.userId}:`, error.message);
        }
    }

    // 13. Review Comments
    const rComments = await readJsonFile('review_comments.json');
    console.log(`Importing ${rComments.length} review comments...`);
    const rCommentFields = ['id', 'reviewId', 'userId', 'comment', 'createdAt'];
    for (const comment of rComments) {
        if (!comment.userId) comment.userId = 'unknown_user';
        await ensureUserExists(comment.userId);
        
        if (comment.content && !comment.comment) comment.comment = comment.content;
        const data = mapSingle(comment, rCommentFields);
        try {
            await prisma.reviewComment.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            // console.error(`Error importing comment ${data.id}:`, error.message);
        }
    }

    // 14. Contacts
    const contacts = await readJsonFile('contacts.json');
    console.log(`Importing ${contacts.length} contacts...`);
    const contactFields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'createdAt', 'userId'];
    for (const contact of contacts) {
        if (contact.userId) await ensureUserExists(contact.userId);
        const data = mapSingle(contact, contactFields);
        try {
            await prisma.contact.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            // console.error(`Error importing contact ${data.id}:`, error.message);
        }
    }

    // 15. Reports
    const reports = await readJsonFile('reports.json');
    console.log(`Importing ${reports.length} reports...`);
    const reportFields = ['id', 'jobId', 'jobTitle', 'companyName', 'reporterName', 'reporterPhone', 'reporterEmail', 'reporterUserId', 'content', 'status', 'adminResponse', 'jobAction', 'createdAt', 'resolvedAt'];
    for (const report of reports) {
        if (!report.jobId) report.jobId = 'unknown_job';
        if (report.reporterUserId) await ensureUserExists(report.reporterUserId);
        await ensureJobExists(report.jobId);
        
        const data = mapSingle(report, reportFields);
        try {
            await prisma.report.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            console.error(`Error importing report ${data.id}:`, error.message);
        }
    }

    // 16. Visitors
    const visitors = await readJsonFile('visitors.json');
    console.log(`Importing ${visitors.length} visitors...`);
    const visitorFields = ['id', 'ip', 'userAgent', 'page', 'referrer', 'userId', 'userName', 'country', 'device', 'visitedAt'];
    for (const visitor of visitors) {
        if (visitor.timestamp && !visitor.visitedAt) visitor.visitedAt = visitor.timestamp;
        const data = mapSingle(visitor, visitorFields);
        try {
            await prisma.visitor.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        } catch (error: any) {
            // console.error(`Error importing visitor ${data.id}:`, error.message);
        }
    }

    console.log('Restoration complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
