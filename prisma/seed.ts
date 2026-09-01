import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settingCount = await prisma.setting.count();

  if (settingCount === 0) {
    await prisma.setting.create({
      data: {
        brandName: "Meera's Fashion",
        tagline: 'Traditional Clothing And Jewelleries',
        phone: '00447463151533',
        formattedPhone: '+44 7463 151533',
        whatsappNumber: '447463151533',
        email: 'meerasfashion26@gmail.com',
        address: 'London, United Kingdom',
        instagramHandle: '@meere_f21',
        instagramUrl: 'https://www.instagram.com/meere_f21',
        tiktokHandle: '@mf202126',
        tiktokUrl: 'https://www.tiktok.com/@mf202126',
        facebookUrl: 'https://facebook.com/meerasfashion',
        announcementText: '🌸 Welcome to Meera Fashion Boutique — Free UK Royal Mail Delivery on Orders over £100 | WhatsApp Concierge Available',
        showAnnouncement: true,
        enableRentalMode: false,
        currencySymbol: '£',
        currencyCode: 'GBP',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
