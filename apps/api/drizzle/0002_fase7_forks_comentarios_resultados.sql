CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"match_id" text,
	"won" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strategies" ADD COLUMN "based_on_id" uuid;--> statement-breakpoint
ALTER TABLE "strategies" ADD COLUMN "games" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "strategies" ADD COLUMN "wins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_strategy_idx" ON "comments" USING btree ("strategy_id","created_at");--> statement-breakpoint
CREATE INDEX "results_strategy_idx" ON "results" USING btree ("strategy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "results_user_match_idx" ON "results" USING btree ("user_id","match_id");--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_based_on_id_strategies_id_fk" FOREIGN KEY ("based_on_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;