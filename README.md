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

## API integratsiyasi

Default API: `https://myselina.pythonanywhere.com`

- JWT login: `POST /auth/jwt/create/`
- JWT refresh: `POST /auth/jwt/refresh/`
- Sinflar: `/api/classes/`
- O‘quvchilar: `/api/students/`
- O‘qituvchilar: `/api/teacher/`
- Fanlar: `/api/subject/`
- Testlar: `/api/test/`
- Testni boshlash: `/api/test/{id}/start/`
- Javob yuborish: `/api/test/{id}/answer/`
- Testni yakunlash: `/api/test/{id}/finish/`
- Natijalar: `/api/attempt/`

## Muhim backend cheklovi

Yuklangan Django loyihasida `config/urls.py` faqat `djoser.urls.jwt` ni ulaydi. Shu sababli frontend uchun foydalanuvchi akkauntini yaratadigan Djoser `/auth/users/` endpointi mavjud emas. `StudentViewSet` va `TeacherViewSet` esa mavjud `User` akkauntiga profil biriktiradi, yangi login/parol yaratmaydi. Hozirgi frontend admin sahifasida o‘quvchi/o‘qituvchi ro‘yxatini ko‘rsatadi, lekin yangi login/parol yaratish funksiyasini backend endpointisiz bajara olmaydi. Hozircha akkauntlarni Django Admin orqali yaratish talab etiladi.

Shuningdek, standart SimpleJWT access token odatda `is_staff` yoki `role` maydonini bermaydi. Frontend rolni student/teacher profili orqali aniqlaydi; admin rolini aniqlash uchun token ichida `is_staff`/`is_superuser`/`role` claim bo‘lishi yoki backendda alohida `/auth/users/me/` endpointi kerak. Bu holat README'da alohida qayd etildi.

## Xavfsizlik eslatmasi

Frontenddagi rolga qarab menyu yashirish faqat interfeys qulayligi uchun. Haqiqiy ruxsatlar backend permission va queryset orqali nazorat qilinishi shart. Test savollarining to‘g‘ri javoblari `start` javobida yuborilmaydi; javoblarni tekshirish backendda bajariladi.
