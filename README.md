# 🛡️ Shelby AI DataVault

<div align="center">

![Shelby AI DataVault](https://img.shields.io/badge/Shelby-AI%20DataVault-00d4ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMyA3djEwbDkgNSA5LTV2LTEweiIvPjwvc3ZnPg==)
![Aptos](https://img.shields.io/badge/Network-Shelbynet-4CAF50?style=for-the-badge)
![Shelby Protocol](https://img.shields.io/badge/Shelby-Protocol-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)

**Decentralized Marketplace for AI Training Datasets**

*Buy, sell, and discover high-quality datasets with cryptographic integrity, powered by Shelby Protocol and Aptos blockchain.*

[🌐 Live Demo](https://shelby.xyz) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/hoasine/Shelby-Vault/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Smart Contracts](#-smart-contracts)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Shelby AI DataVault** is a decentralized marketplace that enables AI researchers, data scientists, and machine learning practitioners to buy and sell training datasets with full cryptographic integrity guarantees.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SHELBY AI DATAVAULT                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   SELLER                          BUYER                                 │
│   ┌──────┐                       ┌──────┐                              │
│   │ Data │──┐                ┌──▶│ Data │                              │
│   └──────┘  │                │   └──────┘                              │
│             ▼                │                                          │
│   ┌──────────────────┐       │   ┌──────────────────┐                  │
│   │  Shelby Storage  │◀──────┼───│  Download API    │                  │
│   │  (Decentralized) │       │   │  (Access-Gated)  │                  │
│   └────────┬─────────┘       │   └──────────────────┘                  │
│            │                 │                                          │
│            ▼                 │                                          │
│   ┌──────────────────┐       │   ┌──────────────────┐                  │
│   │  Aptos Blockchain │◀─────┴───│  Purchase TX     │                  │
│   │  (Ownership)      │          │  (APT Payment)   │                  │
│   └──────────────────┘           └──────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Sellers** upload datasets to Shelby Protocol's decentralized storage
2. **Metadata & pricing** are registered on Aptos blockchain via Move smart contracts
3. **Buyers** pay in APT tokens and receive a `PurchaseReceipt` on-chain
4. **Downloads** are access-gated — only buyers with valid receipts can retrieve data
5. **Integrity** is guaranteed by cryptographic commitments (Clay Codes erasure coding)

---

## ✨ Features

### 🏪 Marketplace
- **Browse & Search** — Discover datasets with real-time search
- **Dataset Details** — View size, downloads, pricing, and provenance
- **One-Click Purchase** — Pay with APT using your Aptos wallet
- **Instant Download** — Access purchased datasets immediately

### 📤 For Sellers
- **Easy Upload** — Drag & drop any file format (CSV, JSONL, Parquet, ZIP)
- **Template Library** — 7 pre-configured dataset templates for quick start
- **Flexible Pricing** — Set your own price or list for free
- **Earnings Dashboard** — Track downloads and revenue in real-time

### 🔐 Security & Trust
- **On-Chain Ownership** — Dataset ownership verified on Aptos blockchain
- **Cryptographic Integrity** — Shelby's erasure coding ensures data authenticity
- **Access Control** — Smart contract enforces purchase verification
- **No Trusted Third Party** — Fully decentralized architecture

### 🎨 Modern UI/UX
- **Dashboard Layout** — Professional Web3 SaaS-style interface
- **Collapsible Sidebar** — Clean navigation with icons and tooltips
- **Dark Theme** — Premium glassmorphism and gradient effects
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

### System Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 + React | User interface and interactions |
| **Smart Contracts** | Aptos Move | Dataset registry, marketplace, access control |
| **Blob Storage** | Shelby Protocol | Decentralized, erasure-coded file storage |
| **Wallet** | Aptos Wallet Adapter | User authentication and transaction signing |

### Data Flow

```
User Action          Frontend              API Route             Blockchain/Storage
─────────────────────────────────────────────────────────────────────────────────
Upload Dataset   →   /upload page    →   /api/datasets/upload  →  Shelby + Aptos
                                                                   (blob + metadata)

Purchase         →   /datasets/[id]  →   Wallet Sign TX        →  Aptos
                                                                   (APT transfer)

Download         →   /datasets/[id]  →   /api/datasets/download →  Shelby
                     (button click)      (access verification)    (blob retrieval)
```

---

## 🛠️ Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.x | React framework with App Router |
| `react` | 18.x | UI library |
| `@aptos-labs/wallet-adapter-react` | latest | Wallet connection |
| `@aptos-labs/ts-sdk` | latest | Aptos blockchain SDK |
| `tailwindcss` | 3.x | Utility-first CSS |
| `shadcn/ui` | latest | Accessible UI components |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| `@shelby-protocol/sdk` | latest | Decentralized blob storage |
| `next/server` | 14.x | API routes |

### Smart Contracts
| Module | Language | Purpose |
|--------|----------|---------|
| `dataset_registry` | Move | Dataset metadata, ownership |
| `marketplace` | Move | Purchase, access control, earnings |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** or **pnpm**
- **Aptos Wallet** (Petra, Pontem, or Martian)
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hoasine/Shelby-Vault.git
cd Shelby-Vault

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Configure environment variables (see below)
# Edit .env.local with your values

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Quick Start with Templates

1. Navigate to **List Data** in the sidebar
2. Choose **Use a Template**
3. Select from 7 pre-configured dataset types
4. Edit metadata and pricing as needed
5. Click **List Dataset on Marketplace**

---

## 📁 Project Structure

```
shelby-secure-storage/
├── 📂 contract/                    # Move smart contracts
│   ├── 📂 sources/
│   │   ├── dataset_registry.move   # Dataset metadata & ownership
│   │   └── marketplace.move        # Purchase & access control
│   └── 📂 tests/
│       └── test_end_to_end.move    # 29 integration tests
│
├── 📂 public/                      # Static assets
│   ├── 📂 images/                  # Logo and icons
│   ├── 📂 templates/               # Sample dataset templates
│   └── 📂 samples/                 # Demo dataset files
│
├── 📂 src/
│   ├── 📂 app/                     # Next.js App Router
│   │   ├── 📂 api/                 # API routes
│   │   │   ├── 📂 datasets/
│   │   │   │   ├── upload/         # POST - Upload to Shelby
│   │   │   │   └── [id]/download/  # GET - Download with access check
│   │   │   └── 📂 auth/
│   │   │       └── nonce/          # GET - Download auth nonce
│   │   ├── 📂 dashboard/           # Portfolio page
│   │   ├── 📂 datasets/[id]/       # Dataset detail page
│   │   ├── 📂 upload/              # List dataset page
│   │   ├── page.tsx                # Home / Explore page
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── globals.css             # Global styles & theme
│   │
│   ├── 📂 components/
│   │   ├── 📂 layout/              # Dashboard layout components
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── SidebarItem.tsx     # Menu item component
│   │   │   ├── TopHeader.tsx       # Global header
│   │   │   └── DashboardLayout.tsx # Layout wrapper
│   │   ├── 📂 marketplace/         # Marketplace components
│   │   │   ├── DatasetCard.tsx     # Dataset listing card
│   │   │   └── Header.tsx          # Legacy header
│   │   ├── 📂 ui/                  # shadcn/ui components
│   │   ├── WalletSelector.tsx      # Wallet connect button
│   │   └── WalletProvider.tsx      # Aptos wallet context
│   │
│   ├── 📂 lib/                     # Utilities
│   │   ├── shelby.ts               # Shelby client & helpers
│   │   └── nonceStore.ts           # Download auth nonces
│   │
│   └── 📂 utils/
│       └── aptosClient.ts          # Aptos client factory
│
├── 📂 scripts/move/                # Move CLI scripts
│   ├── compile.js
│   ├── publish.js
│   ├── test.js
│   └── upgrade.js
│
├── .env.local.example              # Environment template
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 📜 Smart Contracts

### Module Address

```
0x7c897bf8eeac967ec590c57c5ab4464f683def2a7bd088e42a889631d079e84f
```

### dataset_registry.move

Manages dataset metadata and ownership:

```move
// Register a new dataset
public entry fun register_dataset(
    seller: &signer,
    name: String,
    description: String,
    shelby_blob_name: String,
    blob_commitment: vector<u8>,
    size_bytes: u64,
    price_octas: u64,
    tags: vector<String>,
    license: String
)

// Query functions
public fun get_dataset_count(): u64
public fun get_dataset_address(index: u64): address
public fun get_dataset_info(dataset_addr: address): (...)
```

### marketplace.move

Handles purchases and access control:

```move
// Purchase a dataset
public entry fun purchase_dataset(
    buyer: &signer,
    dataset_addr: address
)

// Check access
public fun has_access(buyer: address, dataset_addr: address): bool

// Seller earnings
public fun get_seller_earnings(seller: address): u64
public entry fun withdraw_earnings(seller: &signer)
```

### Move Commands

```bash
# Compile contracts
npm run move:compile

# Run tests (29 tests)
npm run move:test

# Deploy to network
npm run move:publish

# Upgrade existing deployment
npm run move:upgrade
```

---

## 🔌 API Reference

### POST `/api/datasets/upload`

Upload a dataset to Shelby storage and prepare for on-chain registration.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Dataset file (any format) |
| `sellerAddress` | string | Seller's Aptos address |

**Response:**
```json
{
  "shelbyBlobName": "0x.../datasets/abc123/file.csv",
  "commitmentBytes": [1, 2, 3, ...],
  "blobSize": 1024
}
```

### GET `/api/datasets/[datasetAddr]/download`

Download a purchased dataset with access verification.

**Headers:**
| Header | Description |
|--------|-------------|
| `x-buyer-address` | Buyer's Aptos address |
| `x-nonce` | Auth nonce from `/api/auth/nonce` |
| `x-signature` | Signed message from wallet |
| `x-public-key` | Buyer's public key |

**Response:** Binary file stream

### GET `/api/auth/nonce`

Generate a one-time nonce for download authentication.

**Response:**
```json
{
  "nonce": "abc123..."
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
# ═══════════════════════════════════════════════════════════════════════
# REQUIRED
# ═══════════════════════════════════════════════════════════════════════

# Deployed Move module address
NEXT_PUBLIC_MODULE_ADDRESS=0x7c897bf8eeac967ec590c57c5ab4464f683def2a7bd088e42a889631d079e84f

# Publisher account for Shelby blob registration
NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=0x_YOUR_ADDRESS
NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=ed25519-priv-0x_YOUR_PRIVATE_KEY

# Shelby API key (from geomi.dev — network: shelbynet)
SHELBY_API_KEY=AG-...
NEXT_PUBLIC_SHELBY_API_KEY=AG-...

# ═══════════════════════════════════════════════════════════════════════
# OPTIONAL
# ═══════════════════════════════════════════════════════════════════════

# Aptos node URL — marketplace on Shelbynet (defaults in code)
# NEXT_PUBLIC_APTOS_NODE_URL=https://api.shelbynet.shelby.xyz/v1

# Wallet network (defaults to shelbynet)
# NEXT_PUBLIC_APP_NETWORK=shelbynet

# Optional Geomi key for Shelbynet fullnode
# NEXT_PUBLIC_APTOS_API_KEY=

# App URL (defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Shelby write location hint (SDK 0.6+, e.g. us-east-1)
# SHELBY_LOCATION_HINT=us-east-1
```

### Getting API Keys

| Key | Where to Get |
|-----|--------------|
| Shelby API Key | https://geomi.dev → Create project → API Resource → **shelbynet** |
| Aptos API Key | https://build.aptoslabs.com → Create project → API key |
| Publisher Key | Export from your Aptos wallet (Petra, Pontem, etc.) |

---

## 🌐 Deployment

### Current Deployment

| Field | Value |
|-------|-------|
| Network | **Shelbynet** (marketplace + blobs, chain ID 110) |
| Module Address | Redeploy with `npm run move:publish` — old Aptos Testnet address is invalid |
| Node URL | `https://api.shelbynet.shelby.xyz/v1` |
| Shelby RPC | `https://shelby.shelbynet.shelby.xyz/shelby` |

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy Contracts to Mainnet

```bash
# Update Move.toml with mainnet addresses
# Then publish
npm run move:publish
```

---

## 🔐 Security

### Smart Contract Security

- ✅ **CEI Pattern** — Checks-Effects-Interactions on all state-changing functions
- ✅ **Overflow Protection** — u128 intermediate arithmetic for fee calculations
- ✅ **Price Limits** — MAX_PRICE_OCTAS = 100,000,000,000,000 (1M APT)
- ✅ **Access Control** — On-chain verification before any download
- ✅ **29 Test Cases** — Comprehensive test coverage

### API Security

- ✅ **Signature Verification** — Download requests require wallet signature
- ✅ **Nonce System** — One-time nonces prevent replay attacks
- ✅ **Access Gating** — On-chain `has_access()` check before streaming

### Data Integrity

- ✅ **Erasure Coding** — Clay Codes (10 data + 6 parity chunks)
- ✅ **Merkle Commitments** — Cryptographic proof of data authenticity
- ✅ **Decentralized Storage** — No single point of failure

See [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md) for the full security audit report.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Website:** https://shelby.xyz
- **Twitter:** [@HoaTranRom](https://x.com/HoaTranRom)
- **GitHub:** [hoasine/Shelby-Vault](https://github.com/hoasine/Shelby-Vault)
- **Discord:** RomRom

---

<div align="center">

**Built with ❤️ on [Aptos](https://aptos.dev) & [Shelby Protocol](https://shelby.xyz)**

</div>
