-- Promote the owner account to superadmin (requested by the owner). No-op if the account does not exist.
-- The DO block tolerates a brand-new database, where the "superadmin" enum value was added in the same
-- migration transaction and cannot be used yet (there are no users to update in that case).
DO $$
BEGIN
	UPDATE "users" SET "role" = 'superadmin', "updated_at" = now()
	WHERE lower("email") = 'nico.alex.ha@gmail.com' AND "role" <> 'superadmin';
EXCEPTION WHEN SQLSTATE '55P04' THEN
	NULL;
END
$$;
