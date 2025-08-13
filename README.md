# Casora - Inmobiliaria de Lujo (Arquitectura Multi-Tenant)

Este documento describe la arquitectura y las funcionalidades de la aplicación Casora, una plataforma web **multi-tenant** diseñada para que múltiples agencias inmobiliarias gestionen sus operaciones de forma independiente, mientras que un portal centralizado sirve a los usuarios finales (clientes).

## 1. Arquitectura Multi-Tenant y Ámbitos de Datos

La aplicación se divide en tres grandes ámbitos de datos para garantizar el aislamiento y la funcionalidad adecuada para cada tipo de usuario.

### 1.1. Ámbito de Plataforma (Platform Scope)

Este es el nivel más alto, gestionado por los administradores de Casora. Controla la configuración global de la plataforma, la lista de inquilinos (tenants) y los usuarios administradores.

**Colecciones Raíz de Firestore:**
- `platformUsers/{userId}`: Usuarios con roles para administrar toda la plataforma (equipo de Casora).
- `platformSettings/{singleton}`: Un único documento para la configuración global de la plataforma.

### 1.2. Ámbito de Cliente (Client Scope)

Este ámbito gestiona a los usuarios finales del portal público (`casora.pe`). Estos usuarios pueden buscar propiedades en todos los tenants, guardar favoritos y definir sus preferencias de búsqueda.

**Colecciones Raíz de Firestore:**
- `clients/{clientId}`: Perfil de un usuario final. Almacena sus datos básicos, sus propiedades de interés (`interestedProperties`) y, opcionalmente, sus criterios de búsqueda (`lookingFor`).

### 1.3. Ámbito de Inquilino (Tenant Scope)

Cada inquilino (agencia inmobiliaria) tiene su propio conjunto de datos completamente aislado, anidado dentro de un documento en la colección `tenants`. Esto significa que una agencia no puede ver ni modificar los datos de otra, con la excepción de las propiedades publicadas que son visibles en el portal central.

**Colecciones Anidadas bajo `tenants/{tenantId}`:**
- `properties/{propertyId}`: Propiedades listadas por la agencia.
- `contacts/{contactId}`: La base de datos de contactos (CRM) de la agencia. **Importante:** Un `contact` es un registro del CRM, distinto de un `client` del portal.
- `leads/{leadId}`: Clientes potenciales generados a través del formulario de contacto del sitio del tenant.
- `agents/{agentId}`: Usuarios que pertenecen a la agencia (agentes, gerentes).
- `domains/{domainId}`: Dominios personalizados que la agencia puede asociar a su sitio.
- `settings/{singleton}`: Configuración específica de la agencia (branding, textos, colores, etc.).
- `relations/{relationId}`: **Nueva y clave.** Vincula a un `client` o a un `contact` con una propiedad (que puede ser de este o de otro tenant). Define el tipo de relación (`Owner`, `Interested`, `Tenant`, etc.).
- `shares/{shareId}`: **Opcional.** Listas de propiedades curadas por un agente, compartibles a través de un enlace público.

---

## 2. Diferencia Clave: `Client` vs. `Contact`

- **Client**: Es un usuario final que se registra en el portal principal (`casora.pe`). Gestiona su propio perfil, sus búsquedas y sus propiedades favoritas.
- **Contact**: Es un registro en el CRM interno de una agencia (tenant). Es gestionado por un agente y puede representar a un propietario, un comprador, un arrendatario, etc.

Un `client` y un `contact` pueden ser la misma persona en la vida real, pero en el sistema son entidades separadas. La colección `relations` es la que permite conectar a ambos con propiedades, creando un ecosistema de datos interconectado pero bien estructurado.

---

## 3. Flujos de Datos Principales

- **Favoritos de un Cliente:** Cuando un `client` marca una propiedad como favorita, se actualiza su perfil y, si ha dado consentimiento, se crea una `relation` en el tenant dueño de la propiedad para notificar al agente.
- **Gestión de Agentes:** Un agente puede crear `relations` para vincular a sus `contacts` con cualquier propiedad pública del sistema, facilitando el seguimiento y la gestión de su cartera.
- **Rol 'Owner' en Relations:** Un agente puede designar a uno de sus `contacts` como 'Owner' de una propiedad a través de una `relation`. Esto sirve para gestionar la cartera de propiedades que administra la agencia.

---

## 4. Stack Tecnológico (Sin cambios)

- **Framework Frontend:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **UI:** React, ShadCN UI Components
- **Estilos:** Tailwind CSS
- **Backend (Base de Datos y Autenticación):** Firebase (Firestore, Firebase Auth, Firebase Storage)
- **Mapas:** Google Maps API

---
## 5. Separación de Lógica (Services vs. Actions)

- **`services/`**: Contiene la lógica que se ejecuta en el **lado del cliente** (navegador). Utiliza el SDK de Firebase para web y todas sus operaciones están sujetas a las Reglas de Seguridad de Firestore. Se encarga de leer datos públicos y realizar las operaciones permitidas para el usuario autenticado (sea `client` o `agent`).
- **`actions/`**: Contiene la lógica que se ejecuta en el **lado del servidor**. Utiliza el Firebase Admin SDK, lo que le otorga acceso privilegiado a la base de datos, saltándose las reglas de seguridad. Se utiliza para operaciones sensibles o complejas como la creación de tenants, la gestión de dominios, la creación automática de `relations` entre tenants, etc.
