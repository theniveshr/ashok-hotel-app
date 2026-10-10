import type { FastifyPluginAsync } from 'fastify';

export const adminMenuRoutes: FastifyPluginAsync = async (app) => {
  // Helper to invalidate all menu-related cache keys in Redis
  const invalidateMenuCache = async () => {
    try {
      if (app.redis) {
        const keys = await app.redis.keys('menu:*');
        if (keys.length > 0) {
          await app.redis.del(...keys);
          app.log.info(`Invalidated ${keys.length} menu cache keys in Redis`);
        }
      }
    } catch (err) {
      app.log.warn({ err }, 'Redis cache invalidation warning');
    }
  };

  // ── CATEGORIES ADMIN CRUD ──────────────────────────────────────────────────

  // POST /admin/categories — Create Category
  app.post('/categories', async (req, reply) => {
    const body = req.body as any;
    const category = await app.prisma.menuCategory.create({
      data: {
        name: body.name,
        nameTa: body.nameTa,
        description: body.description,
        descriptionTa: body.descriptionTa,
        imageUrl: body.imageUrl,
        displayOrder: body.displayOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    await invalidateMenuCache();

    return reply.status(201).send({
      success: true,
      data: category,
      message: 'Menu category created successfully',
    });
  });

  // PUT /admin/categories/:id — Update Category
  app.put('/categories/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;

    const category = await app.prisma.menuCategory.update({
      where: { id },
      data: body,
    });

    await invalidateMenuCache();

    return reply.send({
      success: true,
      data: category,
      message: 'Menu category updated successfully',
    });
  });

  // DELETE /admin/categories/:id — Soft Delete Category (in transaction)
  app.delete('/categories/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    await app.prisma.$transaction([
      app.prisma.menuCategory.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      }),
      app.prisma.menuItem.updateMany({
        where: { categoryId: id },
        data: { deletedAt: new Date(), isAvailable: false },
      }),
    ]);

    await invalidateMenuCache();

    return reply.send({
      success: true,
      message: 'Menu category and associated items soft deleted successfully',
    });
  });

  // ── MENU ITEMS ADMIN CRUD ──────────────────────────────────────────────────

  // POST /admin/items — Create Menu Item with Addons in Transaction
  app.post('/items', async (req, reply) => {
    const body = req.body as any;

    const item = await app.prisma.$transaction(async (tx: any) => {
      const createdItem = await tx.menuItem.create({
        data: {
          categoryId: body.categoryId,
          name: body.name,
          nameTa: body.nameTa,
          description: body.description,
          descriptionTa: body.descriptionTa,
          price: body.price,
          discountPercentage: body.discountPercentage ?? 0,
          imageUrl: body.imageUrl,
          isVegetarian: body.isVegetarian ?? false,
          isVegan: body.isVegan ?? false,
          isGlutenFree: body.isGlutenFree ?? false,
          isSpicy: body.isSpicy ?? false,
          isBestseller: body.isBestseller ?? false,
          isFeatured: body.isFeatured ?? false,
          preparationTimeMinutes: body.preparationTimeMinutes ?? 20,
          isAvailable: body.isAvailable ?? true,
          displayOrder: body.displayOrder ?? 0,
          calories: body.calories,
          ingredients: body.ingredients ?? [],
          allergens: body.allergens ?? [],
          tags: body.tags ?? [],
        },
      });

      if (body.addons && Array.isArray(body.addons)) {
        for (const addon of body.addons) {
          await tx.menuItemAddon.create({
            data: {
              menuItemId: createdItem.id,
              name: addon.name,
              nameTa: addon.nameTa,
              price: addon.price,
              isRequired: addon.isRequired ?? false,
              maxSelect: addon.maxSelect ?? 1,
            },
          });
        }
      }

      return createdItem;
    });

    await invalidateMenuCache();

    return reply.status(201).send({
      success: true,
      data: item,
      message: 'Menu item created successfully',
    });
  });

  // PUT /admin/items/:id — Update Menu Item
  app.put('/items/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;

    const item = await app.prisma.menuItem.update({
      where: { id },
      data: body,
    });

    await invalidateMenuCache();

    return reply.send({
      success: true,
      data: item,
      message: 'Menu item updated successfully',
    });
  });

  // PATCH /admin/items/:id/availability — Fast Availability Toggle
  app.patch('/items/:id/availability', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { isAvailable } = req.body as { isAvailable: boolean };

    const item = await app.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });

    await invalidateMenuCache();

    return reply.send({
      success: true,
      data: item,
      message: `Item availability updated to ${isAvailable}`,
    });
  });

  // DELETE /admin/items/:id — Soft Delete Menu Item
  app.delete('/items/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    await app.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), isAvailable: false },
    });

    await invalidateMenuCache();

    return reply.send({
      success: true,
      message: 'Menu item soft deleted successfully',
    });
  });
};
