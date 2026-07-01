# eXperience Padel MVP

App de reservas de canchas de padel. Los jugadores reservan un turno sin registrarse y confirman por WhatsApp; el club gestiona reservas, horarios, torneos, productos, ventas y metricas desde un panel de administracion.

## Stack

- React 19 + TypeScript + Vite
- React Router (rutas publicas y `/admin`)
- Zustand (estado del cliente)
- Supabase (base de datos + autenticacion del panel admin)
- Recharts (metricas)
- Tailwind CSS

Los datos viven en Supabase; los stores de Zustand (`src/store/`) son una capa delgada sobre el cliente de Supabase (`src/lib/supabaseClient.ts`) — toda lectura/escritura pasa por las acciones de cada store.

## Uso

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env` y completa con los datos de tu proyecto de Supabase (Project Settings > API):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Configurar Supabase

1. Corre `supabase/schema.sql` en el SQL Editor del proyecto (crea las tablas, las politicas de RLS y datos iniciales minimos: configuracion, 4 canchas, productos de ejemplo).
2. Crea el usuario admin en Authentication > Users (email + password). Ese es el login de `/admin/login` — la app no tiene alta publica de usuarios.

Lectura de datos (canchas, configuracion, productos, torneos, reservas, ventas) es publica. Los turnos que crea un jugador desde el flujo publico se insertan como `anon`; cualquier otra escritura (editar/borrar) requiere estar logueado como admin.

## Estructura

- `src/features/booking` — flujo publico de reserva (`/`, `/reservar`)
- `src/features/admin` — panel de administracion (`/admin/*`)
- `src/store` — estado global por entidad (canchas, reservas, productos, ventas, torneos, slides, configuracion, sesion admin), respaldado por Supabase
- `src/lib` — utilidades (cliente de Supabase, disponibilidad de turnos, formato de fecha/moneda, link de WhatsApp)
- `src/types` — modelos de datos compartidos
- `supabase/schema.sql` — tablas, RLS y seed inicial

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — chequeo de tipos + build de produccion
- `npm run lint` — oxlint
- `npm run preview` — sirve el build de produccion
