# Artecasa - Inmobiliaria de Lujo (Blueprint de Aplicación)

Este documento describe la arquitectura y las funcionalidades de la aplicación Artecasa, una plataforma web completa para la gestión y promoción de propiedades inmobiliarias de lujo.

## 1. Stack Tecnológico

- **Framework Frontend:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **UI:** React, ShadCN UI Components
- **Estilos:** Tailwind CSS
- **Backend (Base de Datos y Autenticación):** Firebase (Firestore, Firebase Auth, Firebase Storage)
- **Mapas:** Google Maps API

## 2. Estructura General

La aplicación se divide en dos áreas principales:

1.  **Sitio Público (`/app/(public)`):** La cara visible para los clientes y visitantes.
2.  **Panel de Administración (`/app/admin`):** Una sección privada y protegida por contraseña para gestionar todo el contenido del sitio.

---

## 3. Funcionalidades del Sitio Público

### 3.1. Página de Inicio (`/`)

- **Hero Section:**
  - Un carrusel de imágenes de pantalla completa, gestionable desde el panel de administración.
  - Título, subtítulo y un botón de llamada a la acción (`Call to Action`) prominente. Todo el texto es editable desde el panel de `Configuración`.
- **Propiedad Destacada:**
  - Una sección dedicada a mostrar una propiedad específica marcada como "destacada".
  - Muestra la imagen principal, título, dirección, precio y características clave (dormitorios, baños, etc.).
  - Incluye un botón para ver los detalles completos de la propiedad.
  - El título de esta sección y el texto del botón son personalizables.
- **Descubre Nuestras Propiedades:**
  - Muestra una selección de las 3 propiedades más recientes que no están marcadas como destacadas.
  - Cada propiedad se presenta en una `PropertyCard`.
  - Incluye un título, subtítulo y un botón para ver el catálogo completo, todo personalizable.

### 3.2. Catálogo de Propiedades (`/properties`)

- **Doble Vista:**
  - **Vista de Lista:** Presenta las propiedades en una cuadrícula de tarjetas (`PropertyCard`), ideal para una visión rápida.
  - **Vista de Mapa:** Muestra un mapa interactivo de Google Maps con marcadores para cada propiedad. El mapa se centra y ajusta el zoom automáticamente (`fitBounds`) para mostrar todas las propiedades filtradas. Al hacer clic en un marcador, aparece una ventana de información con detalles y un enlace a la página de la propiedad.
- **Filtros Avanzados:**
  - **Ubicación:** Un combobox inteligente permite buscar y filtrar por Región, Provincia y Distrito de Perú.
  - **Tipo de Operación:** Selector para filtrar por `Venta` o `Alquiler`.
  - **Tipo de Propiedad:** Selector para filtrar por `Departamento`, `Casa`, `Terreno`, etc.
  - **Dormitorios:** Selector para filtrar por número mínimo de dormitorios.
  - **Rango de Precio:** Un popover avanzado permite establecer un precio mínimo y máximo. La moneda y los rangos de precios sugeridos cambian automáticamente si se filtra por "Venta" (USD) o "Alquiler" (PEN).
- **Estado de Carga:** Muestra una animación de carga mientras se obtienen los datos iniciales de las propiedades.

### 3.3. Detalles de Propiedad (`/properties/[id]`)

- **Galería de Imágenes:** Muestra la imagen principal de la propiedad de forma destacada.
- **Información Principal:** Título, dirección completa y descripción detallada.
- **Características Clave:** Iconos y texto para `Dormitorios`, `Baños`, `Cochera`, `Área (m²)`, y `Antigüedad`.
- **Información Financiera:**
  - Muestra el precio en la moneda preferida (USD o PEN) de forma destacada.
  - Muestra el precio equivalente en la otra moneda como referencia.
  - Indica si el precio es por mes (para alquileres).
- **Mapa de Ubicación:** Un mapa de Google Maps incrustado que muestra un marcador en la ubicación exacta de la propiedad.
- **Llamada a la Acción:** Un botón prominente de "Consultar sobre esta Propiedad" que abre una conversación de WhatsApp pre-rellenada con el nombre de la propiedad y un enlace a la misma.

### 3.4. Página de Contacto (`/contact`)

- **Información de Contacto:**
  - Tarjetas informativas para la `Dirección`, `Email` y `Teléfono` de la empresa. Todo el contenido es editable desde el panel de `Configuración`.
- **Formulario de Contacto:**
  - Campos para `Nombre`, `Email`, `Teléfono` y `Mensaje`.
  - Las entradas se guardan como "Leads" en la base de datos para su posterior gestión.
- **Botón de WhatsApp:** Integrado en el formulario, permite a los usuarios iniciar una conversación directa, pre-rellenando su nombre.

### 3.5. Libro de Reclamaciones (`/claims`)

- Un formulario completo que cumple con la normativa de protección al consumidor.
- Campos para la identificación del consumidor, detalles del bien contratado y descripción del reclamo.
- Al enviar, genera un código de reclamo correlativo único.
- Simula el envío de un correo de confirmación tanto al cliente como a la empresa con todos los detalles del reclamo.

---

## 4. Funcionalidades del Panel de Administración

El acceso está restringido a usuarios autenticados a través de Firebase Auth.

### 4.1. Dashboard (`/admin`)

- **Vista General:** Presenta tarjetas con estadísticas clave:
  - Número total de propiedades.
  - Número total de contactos.
  - (Ejemplo) Visitas al sitio.
- **Acceso Rápido:** Un espacio para futuras acciones o resúmenes importantes.

### 4.2. Gestión de Propiedades (`/admin/properties`)

- **CRUD Completo:**
  - **Crear:** Un formulario modal avanzado permite añadir nuevas propiedades.
  - **Leer:** Una tabla y una vista de tarjetas (para móviles) listan todas las propiedades con su imagen, título, precio y estado.
  - **Actualizar:** El mismo formulario de creación se utiliza para editar propiedades existentes.
  - **Eliminar:** Opción para borrar propiedades, incluyendo la eliminación de las imágenes asociadas en Firebase Storage.
- **Características del Formulario:**
  - **Subida de Imágenes:** Soporte para múltiples imágenes, con vista previa, capacidad para eliminar y marcar una como imagen principal (portada).
  - **Geolocalización:** Integración con Google Maps para buscar la dirección y guardar las coordenadas `lat` y `lng` precisas.
  - **Asignación de Propietario:** Un combobox permite buscar y asignar un contacto existente (del CRM) como el propietario de la propiedad.
- **Filtros y Búsqueda:** Permite filtrar propiedades por título, propietario, modalidad y precio.

### 4.3. Gestión de Leads (`/admin/leads`)

- **Bandeja de Entrada:** Muestra en una tabla todos los envíos del formulario de contacto público.
- **Convertir a Contacto:** Una acción clave permite convertir un "Lead" en un "Contacto" completo dentro del CRM con un solo clic. Los datos del lead (nombre, email, teléfono) se transfieren automáticamente al nuevo contacto, y el lead original se elimina.
- **Eliminar Lead:** Opción para descartar consultas no deseadas.

### 4.4. Gestión de Contactos (CRM) (`/admin/contacts`)

- **Base de Datos Centralizada:** Un CRUD completo para gestionar contactos, que pueden ser `compradores`, `arrendatarios` o `propietarios`.
- **Vista de Detalles:**
  - Muestra toda la información de un contacto: nombre completo, email, teléfono, notas y tipo.
  - Presenta listas separadas de las propiedades con las que el contacto está asociado.
- **Asociación de Propiedades:**
  - Permite asociar un contacto a una o más propiedades como `Propietario`, `Interesado` o `Inquilino`.
  - Se puede editar o eliminar estas asociaciones.
  - Al asociar un `Propietario`, se actualiza automáticamente el campo `ownerId` en la propiedad correspondiente.

### 4.5. Configuración General (`/admin/settings`)

- **Panel de Control Centralizado:** Un único formulario para gestionar la configuración global del sitio. Los cambios guardados se reflejan inmediatamente en todo el sitio público.
- **Branding:** Subida de imágenes para el `logo del sitio` y la `imagen por defecto de las propiedades`.
- **Carrusel de Inicio:** Gestión completa de las imágenes del carrusel de la página de inicio (subir y eliminar).
- **Apariencia del Sitio:**
  - **Colores:** Selectores de color para el `color primario`, `de fondo` y `de énfasis`. Al guardar, se regenera el archivo `globals.css` para aplicar el nuevo tema.
  - **Tipografía:** Selectores para elegir la `fuente principal` y la `fuente de encabezados` de una lista predefinida de Google Fonts.
- **Textos del Sitio Web:** Campos de texto para editar todo el contenido de las páginas de `Inicio`, `Contacto` y `Agradecimiento`, permitiendo un control total sobre el marketing y la comunicación.
- **Redes Sociales:**
  - Campos para introducir las URLs de múltiples perfiles de redes sociales.
  - Interruptores para activar o desactivar la visibilidad de cada icono en el pie de página.
- **Información de Contacto:** Campos para definir el número de WhatsApp para consultas y el email para el libro de reclamaciones.
- **Recarga Automática:** Al guardar los cambios de tema, la página se recarga para aplicar las nuevas fuentes y estilos visuales.
