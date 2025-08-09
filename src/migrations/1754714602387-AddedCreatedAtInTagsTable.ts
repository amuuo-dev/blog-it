import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCreatedAtInTagsTable1754714602387 implements MigrationInterface {
    name = 'AddedCreatedAtInTagsTable1754714602387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" ADD "CreatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "CreatedAt"`);
    }

}
