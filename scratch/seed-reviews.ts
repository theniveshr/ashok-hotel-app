import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Adding customer reviews for items...');

  const reviews = [
    {
      menuItemId: 'bakery-black-forest',
      userName: 'Kavitha Ramasamy',
      rating: 5,
      comment: 'Super fresh and fluffy cake! The dark chocolate shavings and cherries were generous.',
      commentTa: 'மிகவும் சுவையான புதிய கேக்! சாக்லேட் மற்றும் செர்ரி பழங்கள் அருமை.',
    },
    {
      menuItemId: 'bakery-black-forest',
      userName: 'Senthil Kumar',
      rating: 5,
      comment: 'Ordered for birthday celebration in Kalaiyarkoil. Perfectly packed and delivered on time.',
      commentTa: 'பிறந்தநாள் கொண்டாட்டத்திற்கு வாங்கினேன். அருமையான பேக்கிங் மற்றும் சுவை.',
    },
    {
      menuItemId: 'bakery-ghee-halwa',
      userName: 'Muruganandam P.',
      rating: 5,
      comment: 'Authentic pure ghee wheat halwa! Melts in the mouth with rich roasted cashews.',
      commentTa: 'சுத்தமான பசு நெய் கோதுமை அல்வா, நாவில் கரையும் சுவை!',
    },
    {
      menuItemId: 'bakery-pani-puri',
      userName: 'Divya Bharathi',
      rating: 5,
      comment: 'Crispiest puris in town with authentic spicy mint water. Street food at its finest.',
      commentTa: 'காளையார்கோவிலில் மிகச்சிறந்த காரசாரமான பானி பூரி!',
    },
    {
      menuItemId: 'bakery-jigarthanda',
      userName: 'Raja Mohammed',
      rating: 5,
      comment: 'Authentic Madurai taste in Kalaiyarkoil! The badam pisin and basundi quality is exceptional.',
      commentTa: 'பாரம்பரிய மதுரை சுவை, பாதாம் பிசின் மற்றும் பாசுந்தி சுவை அற்புதம்!',
    },
    {
      menuItemId: 'rest-ghee-dosa',
      userName: 'Karthik Subramanian',
      rating: 5,
      comment: 'Crispiest ghee roast in Kalaiyarkoil! Sambar flavor is outstanding.',
      commentTa: 'காளையார்கோவிலில் மிகச்சிறந்த நெய் ரோஸ்ட்! சாம்பார் மணம் அற்புதம்.',
    },
    {
      menuItemId: 'rest-mutton-biryani',
      userName: 'Anand Pandian',
      rating: 5,
      comment: 'Seeraga samba aroma is irresistible. Mutton pieces were so tender and juicy.',
      commentTa: 'சீரக சம்பா மணமும் மென்மையான ஆட்டுக்கறியும் அற்புதம்.',
    },
    {
      menuItemId: 'veg-banana-leaf-meals',
      userName: 'Meenakshi Sundaram',
      rating: 5,
      comment: 'Complete traditional meals on fresh banana leaf. The drumstick sambar and payasam were heavenly.',
      commentTa: 'பாரம்பரிய வாழை இலை சாப்பாடு, முருங்கைக்காய் சாம்பாரும் பாயாசமும் அற்புதம்.',
    },
  ];

  await prisma.menuItemReview.deleteMany({});
  for (const r of reviews) {
    await prisma.menuItemReview.create({
      data: r,
    });
  }
  console.log(`✅ Seeded ${reviews.length} customer reviews`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
