/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyPromoDto, CreatePromoDto, UpdatePromoDto } from './dto/promo.dto';
import { Promo } from '@prisma/client';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}


  async createPromoForProduct(createPromoDto: CreatePromoDto) {
    const { promo_name, promo_type, promo_value, product_id, start_date, end_date } = createPromoDto;

    if (end_date && start_date && end_date < start_date) {
      throw new BadRequestException("End date cannot be before the start date.");
    }
    
    const promo = await this.prisma.promo.create({
      data: {
        promo_name,
        promo_type,
        promo_value,
        product_id: product_id || null, 
        start_date: start_date || new Date(),
        end_date: end_date || new Date(),
      },
    });

    return promo;
  }

  async getAllPromos(page: number, limit: number) {
    const maxLimit = 10;
    const normalLimit = Math.min(limit, maxLimit)
    const skip = (page - 1) * normalLimit;
    const [promos, totalCount] = await this.prisma.$transaction([
      this.prisma.promo.findMany({
        where: {
          deleted_at: null,
        },
        skip: skip,
        take: normalLimit,
      }),
      this.prisma.promo.count({
        where: {
          deleted_at: null,
        },
      }),
    ]);

    return {
      data: promos,
      meta: {
        currentPage: page,
        itemsPerPage: normalLimit,
        totalPages: Math.ceil(totalCount / normalLimit ),
        totalItems: totalCount,
      },
    };
  }

  async getPromoById(promo_id: number): Promise<Promo> {
    const promo = await this.prisma.promo.findFirst({
      where: {
        promo_id,
        deleted_at: null,
      },
    });

    if (!promo) {
      throw new NotFoundException(`Payment with ID ${promo_id} not found or has been deleted.`);
    }

    return promo;
  }

  async updatePromo(promo_id: number, data: UpdatePromoDto) {
    return this.prisma.promo.update({
      where: { promo_id },
      data,
    });
  }

  async softDeletePromo(promo_id: number): Promise<Promo> {
    return this.prisma.promo.update({
      where: {
        promo_id: promo_id
      },
      data: {
        deleted_at: new Date()
      }
    });
  }

  async applyPromoGlobal(promo_id: number) {
    const promo_global = await this.prisma.promo.findUnique({
      where: { promo_id },
    });

    if(!promo_global) {
      throw new NotFoundException('Promo not found');
    }

    const products = await this.prisma.product.findMany ({
      where: { deleted_at: null },
    });

    for (const product of products) {
      let new_price;
      if (promo_global.promo_type === 'Discount') {
        new_price = product.product_price - (product.product_price * promo_global.promo_value) / 100;
      } else {
        new_price = product.product_price - promo_global.promo_value;
      }

      await this.prisma.product.update({
        where: { product_id: product.product_id },
        data: { product_price: new_price },
      });

      await this.prisma.productPromo.upsert({
        where: {
          product_id_promo_id: {
            product_id: product.product_id,
            promo_id: promo_global.promo_id,
          },
        },
        update: {},
        create: {
          product_id: product.product_id,
          promo_id: promo_global.promo_id,
        },
      });
    }

    return { message: 'Promo applied to all products successfully' };
}

  async applyPromo(applyPromoDto: ApplyPromoDto) {
    const { product_id, promo_id } = applyPromoDto;

    const promo = await this.prisma.promo.findUnique({ where: { promo_id } });
    if (!promo) throw new Error('Promo not found');

    const product = await this.prisma.product.findUnique({ where: { product_id } });
    if (!product) throw new Error('Product not found');

    let newPrice;
    if (promo.promo_type === 'Discount') {
      newPrice = product.product_price - (product.product_price * promo.promo_value) / 100;
    } else {
      newPrice = product.product_price - promo.promo_value;
    }

    const discounted_price = await this.prisma.product.update({
      where: { product_id: product_id },
      data: { product_price: newPrice },
    });

    await this.prisma.product.update({
      where: { product_id: product_id },
      data: { product_price: newPrice },
    });

    await this.prisma.productPromo.upsert({
      where: {
        product_id_promo_id: {
          product_id: product_id,
          promo_id: promo_id,
        },
      },
      update: {},
      create: {
        product_id: product_id,
        promo_id: promo_id,
      },
    });


    return this.prisma.product.findUnique({
      where: { product_id: product_id },
      include: {
        product_promos: {
          include: {
            promo: true,
          },
        },
      },
    });
  }
}