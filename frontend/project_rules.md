# Project: CellPhoneRepairERP
# Tech Stack: React + Vite + TailwindCSS + Shadcn/UI + Lucide Icons.
# Data Strategy: Use LocalStorage for MVP (migrate to Supabase later).

# Core Entities:
1. Client (id, name, phone, cpf)
2. Device (id, brand, model, imei, condition_notes)
3. ServiceOrder (id, client_id, device_id, status, price, description, created_at)

# Rules:
- Keep components small and modular.
- Use TypeScript interfaces for all data.
- Mobile-first design is mandatory.
- DO NOT generate backend code yet. Focus on Frontend logic.