# Artecasa - Inmobiliaria de Lujo (Blueprint de Aplicación Multi-Tenant)

Este documento describe la arquitectura y las funcionalidades de la aplicación Artecasa, una plataforma web **multi-tenant** diseñada para que múltiples agencias inmobiliarias gestionen sus operaciones de forma independiente.

## 1. Arquitectura Multi-Tenant

La aplicación se divide en dos grandes ámbitos de datos para garantizar el aislamiento y la seguridad entre los diferentes "tenants" (inquilinos o agencias).

### 1.1. Ámbito de Plataforma (Platform Scope)

Este es el nivel más alto, gestionado por los administradores de Artecasa. Controla la configuración global de la plataforma y la lista de inquilinos.

**Colecciones de Firestore:**
- `tenants/{tenantId}`: Documento que contiene la información de cada agencia (nombre, estado, etc.).
- `platformUsers/{userId}`: Usuarios con roles para administrar toda la plataforma (dueños, administradores, soporte).
- `platformSettings/{singleton}`: Un único documento para la configuración global de la plataforma.

### 1.2. Ámbito de Inquilino (Tenant Scope)

Cada inquilino tiene su propio conjunto de datos completamente aislado, anidado dentro de su documento en la colección `tenants`. Esto significa que una agencia no puede ver ni modificar los datos de otra.

**Colecciones de Firestore (anidadas bajo `tenants/{tenantId}`):**
- `properties/{propertyId}`: Propiedades listadas por la agencia.
- `contacts/{contactId}`: La base de datos de contactos (CRM) de la agencia.
- `leads/{leadId}`: Clientes potenciales generados a través del formulario de contacto.
- `users/{userId}`: Usuarios que pertenecen a la agencia, con roles específicos (admin, vendedor, etc.).
- `domains/{domainId}`: Dominios personalizados que la agencia puede asociar a su sitio.
- `settings/{singleton}`: Configuración específica de la agencia (branding, textos, colores, etc.).

---

## 2. Stack Tecnológico

- **Framework Frontend:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **UI:** React, ShadCN UI Components
- **Estilos:** Tailwind CSS
- **Backend (Base de Datos y Autenticación):** Firebase (Firestore, Firebase Auth, Firebase Storage)
- **Mapas:** Google Maps API

---

## 3. Funcionalidades del Sitio Público

Cada inquilino tendrá su propio sitio web público, potencialmente accesible a través de un subdominio o un dominio personalizado.

### 3.1. Página de Inicio (`/`)

- **Hero Section:** Un carrusel de imágenes, título, subtítulo y botón, todo gestionable desde el panel de `Configuración` del inquilino.
- **Propiedad Destacada:** Muestra una propiedad marcada como "destacada" por la agencia.
- **Descubre Nuestras Propiedades:** Muestra las propiedades más recientes de la agencia.

### 3.2. Catálogo de Propiedades (`/properties`)

- **Doble Vista:**
  - **Vista de Lista:** Presenta las propiedades de la agencia en una cuadrícula.
  - **Vista de Mapa:** Muestra un mapa interactivo con marcadores para cada propiedad de la agencia. Se ajusta automáticamente para mostrar todas las propiedades filtradas.
- **Filtros Avanzados:** Filtros por ubicación, tipo, dormitorios y precio, aplicados únicamente a las propiedades del inquilino actual.

### 3.3. Detalles de Propiedad (`/properties/[id]`)

- **Galería de Imágenes:** Muestra las imágenes de la propiedad.
- **Información y Características:** Descripción, detalles, precio y mapa de ubicación.
- **Llamada a la Acción:** Botón de WhatsApp pre-configurado con el número de la agencia.

### 3.4. Página de Contacto (`/contact`)

- **Información de Contacto:** Muestra la dirección, email y teléfono de la agencia.
- **Formulario de Contacto:** Las entradas se guardan como "Leads" en la colección del inquilino.
- **Botón de WhatsApp:** Pre-rellenado con el número y nombre de la agencia.

### 3.5. Libro de Reclamaciones (`/claims`)

- Un formulario que genera un reclamo asociado al inquilino, notificando a su email configurado.

---

## 4. Funcionalidades del Panel de Administración

El acceso está restringido a los usuarios de cada inquilino, autenticados a través de Firebase Auth y autorizados por roles.

### 4.1. Dashboard (`/admin`)

- **Vista General:** Presenta estadísticas clave del inquilino: número de propiedades, leads, contactos, etc.

### 4.2. Gestión de Propiedades (`/admin/properties`)

- **CRUD Completo:** Permite a los usuarios del inquilino gestionar su propio inventario de propiedades, incluyendo la subida de imágenes a una carpeta específica del inquilino en Firebase Storage.
- **Geolocalización:** Integración con Google Maps para guardar coordenadas.
- **Asignación de Propietario:** Asigna un contacto del CRM del inquilino como propietario.

### 4.3. Gestión de Leads (`/admin/leads`)

- **Bandeja de Entrada:** Muestra los leads del formulario de contacto del inquilino.
- **Convertir a Contacto:** Convierte un lead en un contacto dentro del CRM del mismo inquilino.

### 4.4. Gestión de Contactos (CRM) (`/admin/contacts`)

- **Base de Datos del Inquilino:** CRUD para gestionar los contactos del inquilino (`compradores`, `arrendatarios`, `propietarios`).
- **Asociación de Propiedades:** Asocia contactos a propiedades dentro del mismo inquilino.

### 4.5. Configuración General (`/admin/settings`)

- **Panel de Control del Inquilino:** Formulario para que cada agencia gestione la configuración de su sitio público.
- **Branding:** Subida de su `logo` y `imagen por defecto`.
- **Carrusel de Inicio:** Gestión de las imágenes del carrusel de su página de inicio.
- **Apariencia del Sitio:** Personalización de `colores` y `tipografía` para su sitio.
- **Textos y Redes Sociales:** Control total sobre el contenido y los enlaces sociales que se muestran en su sitio público.
