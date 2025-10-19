# 🦊 MetaMask Monad Envio - Smart Account Delegation Dashboard

Ứng dụng quản lý delegation và redemption cho MetaMask Smart Accounts trên Monad testnet, sử dụng Envio indexer để theo dõi events real-time.

## 🚀 Demo

- **Live App:** https://metamask-monad-envio.vercel.app
- **Dashboard:** https://metamask-monad-envio.vercel.app/dashboard
- **Delegation:** https://metamask-monad-envio.vercel.app/delegation

## ✨ Features

### ✅ Hoàn thành
- 🏦 **Smart Account Integration:** Tích hợp MetaMask Delegation Toolkit
- 🔐 **EIP-7702 Delegation:** Tạo và quản lý delegation
- 💰 **Redemption:** Redeem delegated tokens
- 📊 **Real-time Dashboard:** Hiển thị transfers, delegations, redemptions
- 🔄 **Auto-refresh:** Cập nhật data mỗi 5 giây
- 📈 **Stats Cards:** Tổng quan số liệu
- 🎨 **Modern UI:** Giao diện đẹp, responsive

### ⏳ Đang hoàn thiện
- 🐛 **CORS Fix:** Cần redeploy Envio sau khi hết giới hạn Vercel (chi tiết trong `TODO_FIX_CORS.md`)

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Blockchain:** Viem, Monad testnet
- **Indexer:** Envio (HyperIndex)
- **Smart Account:** MetaMask Delegation Toolkit
- **Deployment:** Vercel

## 📦 Setup

### Prerequisites
```bash
Node.js >= 18
npm or pnpm
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd metamask-monad-envio

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Add your env vars:
# NEXT_PUBLIC_ENVIO_GRAPHQL=<your-envio-endpoint>
```

### Run Development
```bash
npm run dev
```

Visit: http://localhost:3000

## 🔧 Envio Indexer

### Deploy Envio
```bash
cd envio
envio deploy
```

Copy GraphQL endpoint và update vào Vercel env vars.

### Configuration
- **Config:** `envio/config.yaml`
- **Schema:** `envio/schema.graphql`
- **Handlers:** `envio/src/EventHandlers.ts`

## 📁 Project Structure

```
├── app/
│   ├── dashboard/         # Dashboard page
│   └── delegation/        # Delegation creation
├── components/
│   ├── EnvioFeed.tsx     # Display delegations/redemptions
│   ├── DelegationForm.tsx
│   └── ...
├── lib/
│   ├── envio.ts          # Envio GraphQL queries
│   ├── delegation.ts     # Delegation logic
│   └── smartAccount.ts   # Smart account setup
├── envio/
│   ├── config.yaml       # Indexer configuration
│   ├── schema.graphql    # GraphQL schema
│   └── src/EventHandlers.ts
└── abis/                 # Contract ABIs
```

## 🎯 Smart Contracts

### Monad Testnet
- **MonUSDC:** `0x3A13C20987Ac0e6840d9CB6e917085F72D17E698`
- **DelegationManager:** `0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3`
- **RPC:** https://rpc.ankr.com/monad_testnet
- **Chain ID:** 10143

## 📊 Indexed Events

1. **Transfer** (MonUSDC)
   - `Transfer(address indexed from, address indexed to, uint256 value)`

2. **RedeemedDelegation** (DelegationManager)
   - `RedeemedDelegation(address indexed rootDelegator, address indexed redeemer, tuple delegation)`

3. **EnabledDelegation** (DelegationManager)
   - `EnabledDelegation(bytes32 indexed delegationHash, address indexed delegator, address indexed delegate)`

## 🔍 GraphQL Queries

### Get Delegations
```graphql
query {
  Delegation(where: { delegator: "0x..." }) {
    id
    delegator
    delegate
    token
    periodAmount
    remaining
    createdAt
  }
}
```

### Get Redemptions
```graphql
query {
  Redemption(where: { delegator: "0x..." }) {
    id
    delegator
    to
    amount
    timestamp
  }
}
```

## 🐛 Known Issues

### CORS Error with old Envio endpoint
**Status:** Đang chờ Vercel deployment limit reset

**Solution:** Xem `TODO_FIX_CORS.md` để biết chi tiết

## 📝 Documentation

- `PROJECT_STATUS.md` - Tổng quan dự án
- `TODO_FIX_CORS.md` - Hướng dẫn fix CORS
- `CHECK_VERCEL_AUTODEPLOY.md` - Troubleshoot Vercel auto-deploy

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Auto-deploy on push to main
git push origin main

# Or manual deploy
vercel --prod
```

### Indexer (Envio)
```bash
cd envio
envio deploy
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT

## 🙏 Credits

- MetaMask Delegation Toolkit
- Envio (HyperIndex)
- Monad Network
- Viem

---

**Status:** 95% complete - Fully functional, chỉ còn CORS fix

**Built with ❤️ for Monad testnet**

