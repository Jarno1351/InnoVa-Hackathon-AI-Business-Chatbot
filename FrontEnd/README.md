# Nel-Jay React Frontend

React/Vite migration of the static Nel-Jay chatbot and merchant dashboard prototype.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Make sure the Express backend is running on `http://localhost:3000` and the Python Flask AI service is running on `http://localhost:8000`.

## Important environment variable

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## Main integrated endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`
- `POST /api/chat/message`
- `GET /api/branch/all`
- `POST /api/branch/add`
- `GET /api/supply/branch/:branchId`
- `GET /api/service/branch/:branchId`
- `POST /api/supply/add`
- `POST /api/service/add`

## Notes

The backend chat endpoint currently returns `matchedBranches` as branch/business IDs, not full shop details. The frontend adapter supports that response, but the drawer will show fuller information once the backend returns branch name, business name, address, contact number, and matching products/services directly.
