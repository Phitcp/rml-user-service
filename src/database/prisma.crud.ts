import { PrismaService } from "@root/prisma/prisma.service";

export class BasePrismaCrud {
    constructor(private prismaService: PrismaService) {
    }
}