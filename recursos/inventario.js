//Nombre del archivo de guardado del inventario
const inventariopc = "inventarioComputadoras";

/*Lista de computadoras en memoria*/
let registros = [] ;
/*ID del registro a editar*/
let idEditando = null;
/*================================================================== */
//PARTE DE LA FUNCIÓN EXTRA FILTROS
/*Columnas de la tabla y el dato de cada registro que muestran */
const columnas = [
    {titulo: "Marca", campo: "marca"},
    {titulo: "Modelo", campo: "modelo"},
    {titulo: "Numero de serie", campo: "numeroSerie"},
    {titulo: "Estado", campo: "estado"}

];

/*Valores del filtro*/
const filtrosOcultos = {marca: [], modelo: [], numeroSerie: [], estado: []};
let menuFiltro = null;


/*=========================================================================== */
//Función para leer el archivo de guardado del inventario
function cargarGuardado(){
    try{
        const datos = JSON.parse(localStorage.getItem(inventariopc));
        return Array.isArray(datos) ? datos : [];
    }
    catch(e){
        return [];
    }
}


//Función para guardar el inventario
function escribirGuardado(){
    localStorage.setItem(inventariopc, JSON.stringify(registros));
}

//Función para mostrar un mensaje de bienvenida al cargar la sesión
function mostrarBienvenida(){
    if(!window.sessionStorage.getItem("aquiPreviamente")){
        sessionStorage.setItem("aquiPreviamente", true);
        document.getElementById("Bienvenida").textContent =
            "Bienvenido a la app de Inventario de Computadoras realizada por Fernando Rdz Medel 1972993.";
    }
}
//Función para cargar los registros, los ordena por marca y modelo y dibuja la tabla
function cargarRegistros() {

    registros = cargarGuardado();
    registros.sort(function(a,b){
        return (a.marca + " " + a.modelo).localeCompare(b.marca + " " + b.modelo);
    });
    /*PARTE DE FUNCIÓN EXTRA FILTROS */
    quitarFiltrosObsoletos();
    dibujarTabla();
}

//Función, crear un botón con texto y una acción al hacer clic
function crearBoton(texto, accion){
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", accion, false);
    return boton;
}
 
//Función, saber si alguna columna tiene un filtro activo
function hayFiltros(){
    return columnas.some(function(columna){
        return filtrosOcultos[columna.campo].length > 0;
    });
}
 
//Función, obtener los registros que pasan todos los filtros
function registrosFiltrados(){
    return registros.filter(function(reg){
        return columnas.every(function(columna){
            return filtrosOcultos[columna.campo].indexOf(reg[columna.campo]) === -1;
        });
    });
}
 
//Función, obtener los valores distintos de una columna, ordenados
function valoresUnicos(campo){
    const valores = [];
    registros.forEach(function(reg){
        if(valores.indexOf(reg[campo]) === -1){
            valores.push(reg[campo]);
        }
    });
    return valores.sort(function(a,b){return a.localeCompare(b);});
}
 
//Función, quitar de los filtros los valores que ya no existen (por ejemplo, tras eliminar o editar)
function quitarFiltrosObsoletos(){
    columnas.forEach(function(columna){
        const existentes = valoresUnicos(columna.campo);
        filtrosOcultos[columna.campo] = filtrosOcultos[columna.campo].filter(function(valor){
            return existentes.indexOf(valor) !== -1;
        });
    });
}
 
//Función, cerrar el menú de filtro si hay uno abierto
function cerrarMenuFiltro(){
    if(menuFiltro){
        menuFiltro.remove();
        menuFiltro = null;
    }
}
/*======================================================== */
/*FUNCION EXTRA FILTROS */ 
//Función, abrir el menú de filtro 
function abrirMenuFiltro(columna, boton){
    /*Si el menú de esta misma columna ya estaba abierto, solo se cierra*/
    const abiertoAqui = menuFiltro !== null && menuFiltro.getAttribute("data-campo") === columna.campo;
    cerrarMenuFiltro();
    if(abiertoAqui){return;}
 
    const campo = columna.campo;
    const valores = valoresUnicos(campo);
    const casillas = [];
 
    const menu = document.createElement("div");
    menu.setAttribute("data-campo", campo);
    menu.style.cssText = "position:absolute; z-index:10; background:#fff; color:#000; border:1px solid #999; padding:8px; min-width:200px; box-shadow:2px 2px 6px rgba(0,0,0,0.3); font-weight:normal; text-align:left;";
 
    /*Casilla para marcar o desmarcar todos los valores*/
    const etiquetaTodos = document.createElement("label");
    const casillaTodos = document.createElement("input");
    casillaTodos.type = "checkbox";
    etiquetaTodos.appendChild(casillaTodos);
    etiquetaTodos.appendChild(document.createTextNode(" (Seleccionar todo)"));
    menu.appendChild(etiquetaTodos);
 
    /*La casilla "Seleccionar todo" refleja si todos los valores están marcados*/
    function actualizarTodos(){
        casillaTodos.checked = casillas.every(function(c){return c.casilla.checked;});
    }
    casillaTodos.addEventListener("change", function(){
        casillas.forEach(function(c){c.casilla.checked = casillaTodos.checked;});
    }, false);
 
    /*Lista de valores con casilla, con barra de desplazamiento si es larga*/
    const lista = document.createElement("div");
        /*CSS interno utilizado para las líneas internas de la tabla*/
    lista.style.cssText = "max-height:200px; overflow-y:auto; margin:6px 0; border-top:1px solid #ccc; padding-top:4px;";
    valores.forEach(function(valor){
        const etiqueta = document.createElement("label");
        etiqueta.style.display = "block";
        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.checked = filtrosOcultos[campo].indexOf(valor) === -1;
        casilla.addEventListener("change", actualizarTodos, false);
        etiqueta.appendChild(casilla);
        etiqueta.appendChild(document.createTextNode(" " + valor));
        lista.appendChild(etiqueta);
        casillas.push({valor: valor, casilla: casilla});
    });
    menu.appendChild(lista);
    actualizarTodos();
 
    /*Botones del menú*/
    menu.appendChild(crearBoton("Aceptar", function(){
        const ocultos = casillas.filter(function(c){return !c.casilla.checked;}).map(function(c){return c.valor;});
        if(ocultos.length === casillas.length){
            alert("Seleccione al menos un valor para mostrar.");
            return;
        }
        filtrosOcultos[campo] = ocultos;
        dibujarTabla();
    }));
    menu.appendChild(crearBoton("Borrar filtro", function(){
        filtrosOcultos[campo] = [];
        dibujarTabla();
    }));
    menu.appendChild(crearBoton("Cancelar", cerrarMenuFiltro));
 
    /*Colocar el menú debajo del botón, sin que se salga de la ventana por la derecha*/
    document.body.appendChild(menu);
    const posicion = boton.getBoundingClientRect();
    const izquierda = posicion.left + window.scrollX;
    const maximo = window.scrollX + document.documentElement.clientWidth - menu.offsetWidth - 10;
    menu.style.left = Math.max(0, Math.min(izquierda, maximo)) + "px";
    menu.style.top = (posicion.bottom + window.scrollY) + "px";
    menuFiltro = menu;
}
/*================================================================================================================== */

//Función crear la tabla de los registros de la computadora
function dibujarTabla(){
    cerrarMenuFiltro(); //FUNCIÓN EXTRA
    const contenedor = document.getElementById("busquedas");
    contenedor.innerHTML = "";
    /*En caso de que no existan registros, mostrará un mensaje*/
    if(registros.length === 0){
        const vacio = document.createElement("p");
        vacio.textContent = "No hay ningún registro guardado aún.";
        contenedor.appendChild(vacio);
        return;
    }

    const visibles = registrosFiltrados();

        /*Si hay filtros activos, mostrar cuántos registros se ven y un botón para quitarlos todos*/
    if(hayFiltros()){
        const barraFiltros = document.createElement("p");
        barraFiltros.appendChild(document.createTextNode("Mostrando " + visibles.length + " de " + registros.length + " registros. "));
        barraFiltros.appendChild(crearBoton("Quitar todos los filtros", function(){
            columnas.forEach(function(columna){filtrosOcultos[columna.campo] = [];});
            dibujarTabla();
        }));
        contenedor.appendChild(barraFiltros);
    }
 
    const tabla = document.createElement("table");
 
    /*Crear el encabezado de la tabla, con un botón de filtro en cada columna*/
    const encabezado = tabla.createTHead().insertRow();
    columnas.forEach(function(columna){
        const th = document.createElement("th");
        th.appendChild(document.createTextNode(columna.titulo + " "));
 
        const botonFiltro = document.createElement("button");
        botonFiltro.type = "button";
        botonFiltro.className = "botonFiltro";
        botonFiltro.textContent = "▼";
        botonFiltro.title = "Filtrar por " + columna.titulo;
        /*Resaltar el botón cuando la columna tiene un filtro activo*/
        if(filtrosOcultos[columna.campo].length > 0){
            botonFiltro.style.color = "#c00";
            botonFiltro.style.fontWeight = "bold";
            botonFiltro.title += " (filtro activo)";
        }
        botonFiltro.addEventListener("click", function(){abrirMenuFiltro(columna, botonFiltro);}, false);
 
        th.appendChild(botonFiltro);
        encabezado.appendChild(th);
    });
    const thAcciones = document.createElement("th");
    thAcciones.textContent = "Acciones";
    encabezado.appendChild(thAcciones);


    /*Crear filas de la tabla*/
    const cuerpo = tabla.createTBody();
    visibles.forEach(function(reg){
        const fila = cuerpo.insertRow();
        fila.insertCell().textContent = reg.marca;
        fila.insertCell().textContent = reg.modelo;
        fila.insertCell().textContent = reg.numeroSerie;
        fila.insertCell().textContent = reg.estado;

        const celdaAcciones = fila.insertCell();

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.textContent = "Editar";
        botonEditar.addEventListener("click", function() {editarRegistro(reg.id);}, false);

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", function() {eliminarRegistro(reg.id);}, false);

        celdaAcciones.appendChild(botonEditar);
        celdaAcciones.appendChild(botonEliminar);
    });

        /*Si los filtros ocultan todos los registros, mostrar un aviso dentro de la tabla*/
    if(visibles.length === 0){
        const celdaVacia = cuerpo.insertRow().insertCell();
        celdaVacia.colSpan = columnas.length + 1;
        celdaVacia.textContent = "Ningún registro coincide con los filtros.";
    }

    contenedor.appendChild(tabla);
}

function guardarRegistro(){

    const marca = document.getElementById("marca").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const numeroSerie = document.getElementById("numeroSerie").value.trim();
    const estado = document.getElementById("estado").value;

    /*Hacer obligatorio que se llenen todos los campos*/
    if (marca === "" || modelo === "" || numeroSerie === "" || estado === ""){
        alert("Es necesario llenar todos los campos para guardar el registro.");
        return;

    }

    /*Verificar si existe el número de serie*/
    const duplicado = registros.some(function (reg){
        return reg.id !== idEditando && reg.numeroSerie.toLowerCase () === numeroSerie.toLowerCase();            
    });
    /*Mensaje de alerta si se intenta guardar un numero de serie ya existente*/
    if(duplicado){
        alert("El número de serie " + numeroSerie + " ya está registrado.");
        document.getElementById("numeroSerie").focus();
        return;
    }

    /*Actualizar el registro */
    if(idEditando !== null){
        registros.forEach(function (reg){
            if(reg.id === idEditando){
                reg.marca = marca;
                reg.modelo = modelo;
                reg.numeroSerie = numeroSerie;
                reg.estado = estado;
            }
        });
    } else{
        /*Crear un registro nuevo con un id interno único*/
        registros.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            marca: marca,
            modelo: modelo,
            numeroSerie: numeroSerie,
            estado: estado
        });
    }

    escribirGuardado();
    limpiarCampos();
    cargarRegistros();
}

//Función, pasar los datos de un registro al formulario para editarlo
function editarRegistro(id){
    const reg= registros.filter(function (r) {return r.id===id;})[0];
    if(!reg){return;}
    document.getElementById("marca").value = reg.marca;
    document.getElementById("modelo").value = reg.modelo;
    document.getElementById("numeroSerie").value = reg.numeroSerie;
    document.getElementById("estado").value = reg.estado;

    idEditando = id;
    document.getElementById("botonGuardar").value = "Actualizar";
    document.getElementById("marca").focus();

}

//Función, eliminar registros al presionar un botón
function eliminarRegistro(id){
    /*Cancelar eliminación */
    if(!confirm("¿Desea eliminar esta computadora del inventario?")){
        return;
    }
    /*Eliminar registro*/
    registros = registros.filter(function(r){return r.id !== id;});
    escribirGuardado();

    if(idEditando === id){
        limpiarCampos();
    }

    cargarRegistros();

}

//Función, limpiar el formulario para ahorrar esfuerzos del usuario
function limpiarCampos(){
    document.getElementById("marca").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("numeroSerie").value = "";
    document.getElementById("estado").value = "";

    idEditando = null;

    document.getElementById("botonGuardar").value = "Guardar";
    
}

//Función, cargar el estado de los botones, la bienvenida y el registro
function iniciar(){
    document.getElementById("botonGuardar").addEventListener('click', guardarRegistro, false);
    document.getElementById("botonClear").addEventListener('click', limpiarCampos, false);
    
        /*Cerrar el menú de filtro al hacer clic fuera de él o al presionar Escape*/
    document.addEventListener("click", function(e){
        if(menuFiltro && !menuFiltro.contains(e.target) && !e.target.classList.contains("botonFiltro")){
            cerrarMenuFiltro();
        }
    }, false);
    document.addEventListener("keydown", function(e){
        if(e.key === "Escape"){cerrarMenuFiltro();}
    }, false);
    mostrarBienvenida();
    cargarRegistros();
}

window.addEventListener("load", iniciar, false);
