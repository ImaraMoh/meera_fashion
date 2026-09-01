<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Meera Fashion Boutique

This project is a React storefront with a Node.js backend ready for PostgreSQL on Neon.

## Run the frontend

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`

## Run the backend with PostgreSQL/Neon

1. Create a Neon project and database.
2. Copy your Neon connection string.
3. In the project root, set `.env` like:
   ```env
   PORT=4000
   CLIENT_URL=http://localhost:3000
   DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
   ```
4. Run the SQL from `db/schema.sql` in your Neon database.
5. Start the backend:
   `npm run server`
6. Check API health:
   `http://localhost:4000/api/health`

## Backend endpoints

- `GET /api/health` — checks the PostgreSQL status
- `GET /api/products` — fetches products from PostgreSQL
- `GET /api/settings` — fetches store settings
- `GET /api/enquiries` — fetches enquiries
- `POST /api/enquiries` — creates a new enquiry

## Notes

- The frontend still falls back to localStorage when the backend is not connected yet.
- Once your Neon database is live, the API will use PostgreSQL tables for shared data across users.
