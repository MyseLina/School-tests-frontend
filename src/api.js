const BASE = (import.meta.env.VITE_API_URL || 'https://myselina.pythonanywhere.com').replace(/\/$/, '');
const ACCESS = 'schooltests_access';
const REFRESH = 'schooltests_refresh';
export const authStore = {
  get access(){ return localStorage.getItem(ACCESS); },
  get refresh(){ return localStorage.getItem(REFRESH); },
  set(a,r){ localStorage.setItem(ACCESS,a); if(r) localStorage.setItem(REFRESH,r); },
  clear(){ localStorage.removeItem(ACCESS); localStorage.removeItem(REFRESH); }
};
async function request(path, options={}) {
  const headers = { 'Content-Type':'application/json', ...(options.headers||{}) };
  if(authStore.access) headers.Authorization = `Bearer ${authStore.access}`;
  let response = await fetch(`${BASE}${path}`, { ...options, headers });
  if(response.status === 401 && authStore.refresh && !options.noRefresh){
    const renewed = await fetch(`${BASE}/auth/jwt/refresh/`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh:authStore.refresh})});
    if(renewed.ok){ const data=await renewed.json(); authStore.set(data.access, data.refresh || authStore.refresh); headers.Authorization=`Bearer ${data.access}`; response=await fetch(`${BASE}${path}`,{...options,headers}); }
    else authStore.clear();
  }
  const raw = await response.text(); let data=null;
  try { data=raw ? JSON.parse(raw) : null; } catch { data=raw; }
  if(!response.ok){ const msg=typeof data==='string'?data:(data?.detail || Object.entries(data||{}).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(', '):v}`).join('\n') || `Server xatosi (${response.status})`); throw new Error(msg); }
  return data;
}
export const api = {
  base:BASE,
  get:(p)=>request(p), post:(p,b)=>request(p,{method:'POST',body:JSON.stringify(b)}),
  patch:(p,b)=>request(p,{method:'PATCH',body:JSON.stringify(b)}), del:(p)=>request(p,{method:'DELETE'}),
  login: async(username,password)=>{const d=await request('/auth/jwt/create/',{method:'POST',body:JSON.stringify({username,password}),noRefresh:true});authStore.set(d.access,d.refresh);return d;},
  me: async()=>{
    const [students,teachers]=await Promise.allSettled([request('/api/students/'),request('/api/teacher/')]);
    const s=students.status==='fulfilled'?unwrap(students.value):[]; const t=teachers.status==='fulfilled'?unwrap(teachers.value):[];
    const payload=decode(authStore.access); const uid=payload?.user_id ?? payload?.userId;
    const student=s.find(x=>String(x.user)===String(uid)); const teacher=t.find(x=>String(x.user)===String(uid));
    if(student) return {role:'student',profile:student};
    if(teacher) return {role:'teacher',profile:teacher};
    if(payload?.is_staff || payload?.is_superuser || payload?.role==='admin') return {role:'admin',profile:{first_name:'Administrator',last_name:''}};
    // Staff JWTs in the current backend do not include a role claim. Admins can be distinguished
    // because the API exposes all student records while ordinary student requests are self-scoped.
    if(students.status==='fulfilled' && s.length>0) return {role:'admin',profile:{first_name:'Administrator',last_name:''}};
    throw new Error('Foydalanuvchi profili topilmadi. Admin, o‘qituvchi yoki o‘quvchi akkaunti bilan kiring.');
  },
  students:()=>request('/api/students/'), teachers:()=>request('/api/teacher/'), classes:()=>request('/api/classes/'), subjects:()=>request('/api/subject/'), tests:()=>request('/api/test/'), attempts:()=>request('/api/attempt/'),
  createTest:(body)=>request('/api/test/',{method:'POST',body:JSON.stringify(body)}), deleteTest:(id)=>request(`/api/test/${id}/`,{method:'DELETE'}),
  startTest:(id)=>request(`/api/test/${id}/start/`,{method:'POST',body:'{}'}), answer:(id,question_id,variant)=>request(`/api/test/${id}/answer/`,{method:'POST',body:JSON.stringify({question_id,variant})}), finish:(id)=>request(`/api/test/${id}/finish/`,{method:'POST',body:'{}'}),
  createClass:(b)=>request('/api/classes/',{method:'POST',body:JSON.stringify(b)}), createSubject:(b)=>request('/api/subject/',{method:'POST',body:JSON.stringify(b)}),
};
export function unwrap(d){ if(Array.isArray(d))return d; return d?.results || d?.data || []; }
function decode(token){try{return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch{return {}}}
export const getUserId=()=>decode(authStore.access)?.user_id;
