# EMS (Next.js 15 + Prisma + Recharts + Leaflet)
1. `cp .env.example .env` → mets `DATABASE_URL` (Postgres) et un `AUTH_SECRET` long et aléatoire
2. `npm i && npx prisma db push && npm run seed && npm run dev`
3. Connexion : admin@ems.local / admin1234 (change-le dans Comptes & droits)
4. Comptes & droits : crée les comptes, coche les autorisations et les sites accessibles
5. Sites → ajoute un site, puis place-le sur la Carte (clic). Appareils → rattache chaque Raspberry à un site
6. Test ingestion :
```
curl -X POST http://localhost:3000/api/ingest -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"solar":{"power_kw":7.4},"battery":{"soc":64}}'
```
Les non-admins ne voient que les sites (et appareils, données) qui leur sont attribués.
