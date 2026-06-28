ALTER TABLE "rodadas" ADD COLUMN "tipo" varchar(50) DEFAULT 'GRUPO' NOT NULL;
ALTER TABLE "partidas" ADD COLUMN "decidido_em" varchar(50) DEFAULT 'NORMAL' NOT NULL;
ALTER TABLE "palpites" ADD COLUMN "momento_previsto" varchar(50) DEFAULT 'NORMAL' NOT NULL;
