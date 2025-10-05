console.log("Tasks Enhancer (Local) cargado.");

/**
 * Función principal que se ejecuta para encontrar y mejorar las tareas en la página.
 */
function enhanceTasks() {

  const taskRows = document.querySelectorAll('div[role="listitem"][data-id]');

  taskRows.forEach(taskRow => {
    // Evitar procesar la misma tarea múltiples veces.
    if (taskRow.dataset.enhanced) {
      return;
    }
    taskRow.dataset.enhanced = 'true';

    // Usamos 'dataset.id' para obtener directamente el valor del atributo 'data-id'. Es más limpio.
    const taskId = taskRow.dataset.id;
    if (!taskId) return; // Si por alguna razón no hay ID, saltamos esta tarea.

    // El contenedor del título es un buen lugar para inyectar nuestros elementos.
    // Buscamos un elemento con la clase 'lCEjKc' que contiene el título.
    const taskTitleContainer = taskRow.querySelector('.lCEjKc');
    if (!taskTitleContainer) return;

    // Buscamos en el almacenamiento si hay datos para esta tarea.
    chrome.storage.sync.get([taskId], (result) => {
      if (result[taskId]) {
        const metadata = result[taskId];
        metadata.tags.forEach(tagText => {
          const tagElement = document.createElement('span');
          tagElement.textContent = tagText.toUpperCase();
          tagElement.className = 'task-enhancer-tag';
          taskTitleContainer.appendChild(tagElement);
        });
      }
    });

    const button = document.createElement('button');
    button.textContent = 'Meta';
    button.className = 'task-enhancer-button';
    
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      const sampleMetadata = {
        priority: 'alta',
        tags: ['importante'],
        lastUpdated: new Date().toISOString()
      };
      chrome.storage.sync.set({ [taskId]: sampleMetadata }, () => {
        console.log(`Metadata guardada para la tarea ${taskId}:`, sampleMetadata);
        // Recargamos las etiquetas visuales para esta fila sin recargar toda la página.
        alert('Metadata guardada. La etiqueta aparecerá al instante.');
        // Para una actualización instantánea (avanzado, pero lo haremos después):
        // 1. Eliminar etiquetas viejas de esta fila.
        // 2. Volver a leer del storage y añadir las nuevas.
        // Por ahora, la alerta y recargar la página funcionan para probar.
        location.reload(); // Recarga la página para mostrar el cambio.
      });
    });

    taskTitleContainer.appendChild(button);
  });
}

const observer = new MutationObserver((mutations) => {
  clearTimeout(window.enhanceTasksTimeout);
  window.enhanceTasksTimeout = setTimeout(enhanceTasks, 200);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});