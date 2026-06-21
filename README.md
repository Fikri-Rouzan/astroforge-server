# AstroForge Server

## 📌 Description

The core backend engine for AstroForge, a Web3 space-mining game. It manages the primary gameplay loops, secure player authentication, account progression, and spaceport logistics. The architecture processes resource gathering mechanics and incorporates dedicated services to verify in-game actions against decentralized data layers for Web3 transactions.

---

## 🛠️ Tech Stack

| Category                    | Technologies Used                             |
| :-------------------------- | :-------------------------------------------- |
| 🌐 **Programming Language** | `TypeScript`                                  |
| 🧩 **Framework**            | `Hono`                                        |
| ⚛️ **Libraries**            | `dotenv`, `ethers`, `Prisma`, `node-postgres` |
| 🗄️ **Database**             | `Neon (PostgreSQL)`                           |

---

## ⚙️ Setup Instructions

1. **Prerequisites**
   - Node.js 24 or higher.
   - Git installed on your system.
   - PNPM 10 installed on your system (Optional).
   - A valid `Connection string` from your Neon Database dashboard.

2. **Clone the Repository**

```bash
git clone https://github.com/Fikri-Rouzan/astroforge-server.git
cd astroforge-server
```

3. **Install Packages**

```bash
# Using npm
npm i

# Using pnpm
pnpm i
```

4. **Configure Environment Variables**

```bash
cp .env.example .env
```

- Open the `.env` file and configure the following variables

  ```env
  PORT=3000
  DATABASE_URL=
  JWT_SECRET=
  TOKEN_CONTRACT_ADDRESS=
  SERVER_ADMIN_PRIVATE_KEY=
  ```

5. **Generate Database Client**

```bash
# Using npm
npx prisma generate

# Using pnpm
pnpm prisma generate
```

6. **Run Database Migration**

```bash
# Using npm
npx prisma migrate dev

# Using pnpm
pnpm prisma migrate dev
```

7. **Run the Program**

```bash
# Using npm
npm run dev

# Using pnpm
pnpm run dev
```

---

## 🧪 Running Tests

```bash
# Using npm
npx tsx scripts/test-auth.ts

# Using pnpm
pnpm tsx scripts/test-auth.ts
```
