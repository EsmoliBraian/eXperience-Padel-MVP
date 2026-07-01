# eXperience Padel MVP

App de reservas de canchas de padel. Los jugadores reservan un turno sin registrarse y confirman por WhatsApp; el club gestiona reservas, horarios, torneos, productos, ventas y metricas desde un panel de administracion.

## Stack

- React 19 + TypeScript + Vite
- React Router (rutas publicas y `/admin`)
- Zustand (con persistencia en `localStorage`)
- Recharts (metricas)
- Tailwind CSS

Los datos se guardan en `localStorage` mediante los stores de Zustand (`src/store/`). Esta pensado para reemplazarse mas adelante por Supabase (ya esta instalado como dependencia) sin tocar los componentes: toda lectura/escritura pasa por las acciones de cada store.

## Uso

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env` para configurar el usuario y contrasena del panel admin (`/admin/login`):

```
VITE_ADMIN_USER=admin
VITE_ADMIN_PASSWORD=admin123
```

Esta autenticacion es un mock local para el MVP, no un sistema de auth seguro.

## Estructura

- `src/features/booking` — flujo publico de reserva (`/`, `/reservar`)
- `src/features/admin` — panel de administracion (`/admin/*`)
- `src/store` — estado global por entidad (reservas, productos, ventas, torneos, slides, configuracion, sesion admin)
- `src/lib` — utilidades (disponibilidad de turnos, formato de fecha/moneda, link de WhatsApp)
- `src/types` — modelos de datos compartidos

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — chequeo de tipos + build de produccion
- `npm run lint` — oxlint
- `npm run preview` — sirve el build de produccion
