CREATE TABLE IF NOT EXISTS "palpites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"partida_id" uuid NOT NULL,
	"gols_time_a" integer NOT NULL,
	"gols_time_b" integer NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL,
	"data_atualizacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partidas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rodada_id" uuid NOT NULL,
	"time_a" varchar(100) NOT NULL,
	"time_b" varchar(100) NOT NULL,
	"gols_time_a" integer,
	"gols_time_b" integer,
	"data_inicio" timestamp NOT NULL,
	"status" varchar(50) NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rodadas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer NOT NULL,
	"nome" varchar(100) NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens_convite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL,
	"usado" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"cargo" varchar(50) NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "palpites" ADD CONSTRAINT "palpites_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "palpites" ADD CONSTRAINT "palpites_partida_id_partidas_id_fk" FOREIGN KEY ("partida_id") REFERENCES "public"."partidas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partidas" ADD CONSTRAINT "partidas_rodada_id_rodadas_id_fk" FOREIGN KEY ("rodada_id") REFERENCES "public"."rodadas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens_convite" ADD CONSTRAINT "tokens_convite_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "palpites_usuario_partida_idx" ON "palpites" USING btree ("usuario_id","partida_id");