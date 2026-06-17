CREATE TABLE IF NOT EXISTS "eventos_partida" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partida_id" uuid NOT NULL,
	"tipo" varchar(30) NOT NULL,
	"time_id" uuid,
	"jogador" varchar(100),
	"minuto" integer NOT NULL,
	"acrescimos" integer,
	"info" varchar(255),
	"data_criacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "eventos_partida" ADD CONSTRAINT "eventos_partida_partida_id_partidas_id_fk" FOREIGN KEY ("partida_id") REFERENCES "public"."partidas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_partida" ADD CONSTRAINT "eventos_partida_time_id_times_id_fk" FOREIGN KEY ("time_id") REFERENCES "public"."times"("id") ON DELETE set null ON UPDATE no action;
