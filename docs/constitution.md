# Constitución del Proyecto

1. **Stack simple**: solo HTML, CSS y JS vanilla; cero dependencias instaladas (sin `package.json` ni `node_modules`); fuentes por CDN.
2. **Spec = código**: `AGENTS.md` describe lo que el código hace hoy; todo cambio de comportamiento se refleja allí y se apunta en `MEMORY.md`.
3. **Lógica e interfaz separadas**: HTML estructura, CSS presentación (valores en variables `:root`), JS comportamiento con clases; la JS no pinta contenido ni fija colores.
4. **Tests sin instalar nada**: prohibido añadir librerías de testing; los tests se escriben con el runner incluido en Node (`node --test`) y la revisión visual abre `index.html` con Chrome DevTools (consola y red limpias, sin overflow); resultado anotado en `MEMORY.md`.
5. **Datos del usuario**: el proyecto no pide, guarda ni envía datos personales; no se añaden formularios, cookies, `localStorage` ni analítica sin documentarlo antes en `AGENTS.md`.
6. **Idioma**: identificadores, clases y funciones en inglés; comentarios, textos visibles y documentación en español.
7. **Nada se registra ni se publica sin permiso**: ni `git commit` ni `git push` se ejecutan sin autorización explícita del usuario. Antes hay que entregarle el resumen de lo implementado con el nombre del commit propuesto, y esperar su confirmación. La frontera está en el commit y no solo en el push porque un commit ya creado convierte cualquier ajuste posterior en un `amend` o en un force-push, mientras que un cambio sin commitear se devuelve intacto con `git checkout`. Se registra y se publica solo lo aprobado, y lo aprobado es lo que queda. Los secretos no se escriben ni en el repositorio ni en la conversación: si hay que comprobar una credencial, se consulta enmascarada.
