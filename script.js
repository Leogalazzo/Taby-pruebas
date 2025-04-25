document.addEventListener('DOMContentLoaded', function() {
  // Función para actualizar el carrito en todas las páginas
  function actualizarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);

    const contadorFlotante = document.querySelector('.carrito-contador');
    const carritoFlotante = document.querySelector('.carrito-flotante');

    if (contadorFlotante && carritoFlotante) {
      contadorFlotante.textContent = totalItems;
      carritoFlotante.setAttribute('data-count', totalItems);
      contadorFlotante.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (document.getElementById('lista-carrito')) {
      const listaCarrito = document.getElementById('lista-carrito');
      const totalElement = document.getElementById('total');
      listaCarrito.innerHTML = '';
      let total = 0;

      carrito.forEach((producto, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="nombre-producto">${producto.nombre}</span>
          <span class="precio-producto">$${producto.precio}</span>
          <button class="eliminar-producto" data-index="${index}">×</button>
        `;
        listaCarrito.appendChild(li);
        total += parseFloat(producto.precio) * (producto.cantidad || 1);
      });

      totalElement.textContent = total.toFixed(2);

      document.querySelectorAll('.eliminar-producto').forEach(boton => {
        boton.addEventListener('click', function () {
          const index = parseInt(this.getAttribute('data-index'));
          const producto = carrito[index];

          Swal.fire({
            title: '¿Eliminar producto?',
            html: `¿Estás seguro que deseas eliminar <strong>${producto.nombre}</strong> del carrito?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              carrito.splice(index, 1);
              localStorage.setItem('carrito', JSON.stringify(carrito));
              actualizarCarrito();
              mostrarNotificacion(`${producto.nombre} eliminado del carrito`);
            }
          });
        });
      });
    }
  }

  // Función para agregar al carrito
  function agregarAlCarrito(id, nombre, precio, tonoSeleccionado = '') {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.find(item => item.id === id && item.tono === tonoSeleccionado);

    if (productoExistente) {
      productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
    } else {
      carrito.push({ id, nombre: nombre + (tonoSeleccionado ? ` - ${tonoSeleccionado}` : ''), precio, cantidad: 1, tono: tonoSeleccionado });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
    mostrarNotificacion(`¡${nombre}${tonoSeleccionado ? ' - ' + tonoSeleccionado : ''} agregado al carrito!`);
  }

  // Función para mostrar notificaciones
  function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => notificacion.classList.add('mostrar'), 10);
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
      setTimeout(() => {
        document.body.removeChild(notificacion);
      }, 300);
    }, 3000);
  }

  function setupProductosConTonos() {
    const modal = document.getElementById('modalTonos');
    const tonosContainer = document.querySelector('.tonos-container');
    let productoSeleccionado = null;
    let tonoSeleccionado = '';
  
    document.querySelectorAll('.agregar-carrito.con-tonos').forEach(boton => {
      boton.addEventListener('click', function() {
        productoSeleccionado = {
          id: this.getAttribute('data-id'),
          nombre: this.getAttribute('data-nombre'),
          precio: this.getAttribute('data-precio')
        };
  
        // Cargar tonos dinámicamente desde data-tonos
        const tonos = this.getAttribute('data-tonos') ? this.getAttribute('data-tonos').split(',') : ['Tono 1', 'Tono 2', 'Tono 3'];
        tonosContainer.innerHTML = ''; // Limpiar tonos anteriores
        tonos.forEach(tono => {
          const tonoElement = document.createElement('div');
          tonoElement.className = 'tono';
          tonoElement.setAttribute('data-tono', tono);
          tonoElement.textContent = tono;
          tonosContainer.appendChild(tonoElement);
        });
  
        // Reasignar eventos a los nuevos tonos
        document.querySelectorAll('.tono').forEach(tono => {
          tono.addEventListener('click', function() {
            document.querySelectorAll('.tono').forEach(t => t.classList.remove('seleccionado'));
            this.classList.add('seleccionado');
            tonoSeleccionado = this.getAttribute('data-tono');
          });
        });
  
        modal.style.display = 'block';
        document.querySelectorAll('.tono').forEach(t => t.classList.remove('seleccionado'));
        tonoSeleccionado = '';
      });
    });
  
    // Confirmar selección de tono
    document.querySelector('.modal-contenido button').addEventListener('click', function() {
      if (tonoSeleccionado && productoSeleccionado) {
        agregarAlCarrito(
          productoSeleccionado.id,
          productoSeleccionado.nombre,
          productoSeleccionado.precio,
          tonoSeleccionado
        );
        modal.style.display = 'none';
        productoSeleccionado = null;
        tonoSeleccionado = '';
      } else {
        Swal.fire('Selección requerida', 'Por favor selecciona un tono', 'warning');
      }
    });
  
    // Cerrar modal
    document.querySelector('.cerrar').addEventListener('click', function() {
      modal.style.display = 'none';
      productoSeleccionado = null;
      tonoSeleccionado = '';
      document.querySelectorAll('.tono').forEach(t => t.classList.remove('seleccionado'));
    });
  }

  // Configurar productos sin tonos
  document.querySelectorAll('.agregar-carrito:not(.con-tonos)').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const nombre = this.getAttribute('data-nombre');
      const precio = this.getAttribute('data-precio');
      agregarAlCarrito(id, nombre, precio);
    });
  });

  // Enviar pedido por WhatsApp
  if (document.getElementById('btn-whatsapp')) {
    document.getElementById('btn-whatsapp').addEventListener('click', function () {
      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      const total = document.getElementById('total').textContent;

      if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío');
        return;
      }

      let mensaje = '¡Hola! Quiero hacer este pedido:\n\n';
      carrito.forEach(item => {
        mensaje += `- ${item.nombre} (${item.cantidad || 1}x): $${item.precio}\n`;
      });
      mensaje += `\nTotal: $${total}\n\nGracias!`;

      const encoded = encodeURIComponent(mensaje);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    });
  }

  // 🔁 CLONAR productos a la sección "Todos" y volver a asignar eventos
  const contenedorTodos = document.getElementById("contenedor-todos");
  const secciones = document.querySelectorAll(".seccion-productos");

  if (contenedorTodos && secciones) {
    secciones.forEach(seccion => {
      if (seccion.id !== "todos") {
        const productos = seccion.querySelectorAll(".producto");
        productos.forEach(producto => {
          const copia = producto.cloneNode(true);

          // Asegurar que los botones clonados tengan el mismo funcionamiento
          const boton = copia.querySelector('.agregar-carrito');
          if (boton) {
            const id = boton.getAttribute('data-id');
            const nombre = boton.getAttribute('data-nombre');
            const precio = boton.getAttribute('data-precio');

            // Asignar evento según si tiene tonos o no
            if (boton.classList.contains('con-tonos')) {
              boton.addEventListener('click', function () {
                const modal = document.getElementById('modalTonos');
                productoSeleccionado = { id, nombre, precio };
                modal.style.display = 'block';
                document.querySelectorAll('.tono').forEach(t => t.classList.remove('seleccionado'));
              });
            } else {
              boton.addEventListener('click', function () {
                agregarAlCarrito(id, nombre, precio);
              });
            }
          }

          contenedorTodos.appendChild(copia);
        });
      }
    });
  }

  // 🔍 BUSCADOR con productos clonados
  const searchInput = document.getElementById('searchInput');
  const todos = document.getElementById('todos');
  const productosTodos = contenedorTodos ? contenedorTodos.querySelectorAll('.producto') : [];

  if (searchInput && todos && productosTodos.length) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase().trim();
      let resultadosEncontrados = false;
      let mensajeNoResultados = document.getElementById('noResultados');

      if (searchTerm === '') {
        secciones.forEach(seccion => seccion.classList.remove('ocultar-seccion'));
        productosTodos.forEach(p => p.classList.remove('oculto'));
        if (mensajeNoResultados) mensajeNoResultados.remove();
        return;
      }

      // Mostrar solo la sección "todos"
      secciones.forEach(seccion => {
        if (seccion.id !== 'todos') {
          seccion.classList.add('ocultar-seccion');
        } else {
          seccion.classList.remove('ocultar-seccion');
        }
      });

      productosTodos.forEach(producto => {
        const nombre = producto.querySelector("h3").textContent.toLowerCase();
        if (nombre.includes(searchTerm)) {
          producto.classList.remove('oculto');
          resultadosEncontrados = true;
        } else {
          producto.classList.add('oculto');
        }
      });

      if (!resultadosEncontrados) {
        if (!mensajeNoResultados) {
          const mensaje = document.createElement("p");
          mensaje.id = "noResultados";
          mensaje.textContent = "No se encontraron productos.";
          mensaje.style.textAlign = "center";
          mensaje.style.margin = "20px 0";
          contenedorTodos.appendChild(mensaje);
        }
      } else if (mensajeNoResultados) {
        mensajeNoResultados.remove();
      }
    });
  }

  // Inicializar
  actualizarCarrito();
  setupProductosConTonos();
});
