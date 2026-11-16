# School Tests — Frontend

React + Vite frontend for the Django REST Framework backend in this repository.

## Ishga tushirish

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL qiymatini backend manziliga moslang
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Xavfsizlik eslatmasi

Frontenddagi rolga qarab menyu yashirish faqat interfeys qulayligi uchun. Haqiqiy ruxsatlar backend permission va queryset orqali nazorat qilinishi shart. Test savollarining to‘g‘ri javoblari `start` javobida yuborilmaydi; javoblarni tekshirish backendda bajariladi.
