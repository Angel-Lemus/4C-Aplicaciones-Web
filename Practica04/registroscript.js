let catalogoInternacional = {};

document.addEventListener('DOMContentLoaded', () => {
    const inputFecha = document.getElementById('fechaNacimiento');
    if (inputFecha) {
        inputFecha.addEventListener('change', validarEdadActual);
        inputFecha.addEventListener('blur', validarEdadActual);
        validarEdadActual();
    }

    const qrInput = document.getElementById('qrInput');
    if (qrInput) {
        qrInput.addEventListener('change', procesarArchivoWhatsApp);
    }

    const inputConfirmPass = document.getElementById('confirmarContrasena');
    const inputPass = document.getElementById('contrasena');
    const errorPassMsg = document.getElementById('errorPassMsg');
    if (inputConfirmPass && inputPass) {
        inputConfirmPass.addEventListener('input', () => {
            if (inputPass.value !== inputConfirmPass.value) {
                errorPassMsg.textContent = '⚠️ Las contraseñas aún no coinciden...';
                errorPassMsg.classList.remove('hidden');
                inputConfirmPass.classList.add('input-error-borde');
            } else {
                errorPassMsg.classList.add('hidden');
                inputPass.classList.remove('input-error-borde');
                inputConfirmPass.classList.remove('input-error-borde');
            }
        });
    }

    // Limpiar solo el paso actual sin borrar los demás
    document.querySelectorAll('.btn-limpiar').forEach(btn => {
        btn.addEventListener('click', function () {
            const pasoActual = this.closest('.form-step');
            if (!pasoActual) return;

            pasoActual.querySelectorAll('input, select').forEach(campo => {
                if (campo.type === 'checkbox' || campo.type === 'radio') {
                    campo.checked = false;
                } else if (campo.id !== 'pais') {
                    campo.value = '';
                }
                campo.classList.remove('input-error-borde');
            });

            if (pasoActual.id === 'step-1') {
                const mensajeEdad = document.getElementById('mensajeEdad');
                if (mensajeEdad) mensajeEdad.textContent = '';
            }
            if (pasoActual.id === 'step-2') {
                quitarFotoWhatsApp();
            }
        });
    });

    // Configurar colores dinámicos en el apartado 4
    const colorFuente = document.getElementById('colorFuente');
    const colorFondo = document.getElementById('colorFondo');
    if (colorFuente) {
        colorFuente.addEventListener('input', (e) => {
            document.body.style.color = e.target.value;
        });
    }
    if (colorFondo) {
        colorFondo.addEventListener('input', (e) => {
            document.body.style.backgroundColor = e.target.value;
        });
    }

    // Cargar catálogo de países, estados y ciudades desde domicilios.json
    const selectPais = document.getElementById('pais');
    const selectEstado = document.getElementById('estado');
    const selectCiudad = document.getElementById('ciudad');

    if (selectPais && selectEstado && selectCiudad) {
        fetch('domicilios.json')
            .then(res => res.json())
            .then(data => {
                catalogoInternacional = data;
                cargarEstadosDelPais();
            })
            .catch(err => console.error('Error cargando domicilios.json:', err));

        selectPais.addEventListener('change', cargarEstadosDelPais);
        selectEstado.addEventListener('change', cargarCiudadesDelEstado);
        selectCiudad.addEventListener('change', asignarCodigoPostal);
    }
});

// =========================================================
// FUNCIONES DE UBICACIÓN (domicilios.json)
// =========================================================
function cargarEstadosDelPais() {
    const selectPais = document.getElementById('pais');
    const selectEstado = document.getElementById('estado');
    const selectCiudad = document.getElementById('ciudad');
    const inputCp = document.getElementById('codigoPostal');

    const paisActual = selectPais.value;
    const estadosObj = catalogoInternacional[paisActual] || {};
    const listaEstados = Object.keys(estadosObj);

    selectEstado.innerHTML = '<option value="">-- Selecciona un estado --</option>';
    selectCiudad.innerHTML = '<option value="">-- Selecciona primero un estado --</option>';
    inputCp.value = '';

    listaEstados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        selectEstado.appendChild(option);
    });
}

function cargarCiudadesDelEstado() {
    const paisActual = document.getElementById('pais').value;
    const estadoElegido = document.getElementById('estado').value;
    const selectCiudad = document.getElementById('ciudad');
    const inputCp = document.getElementById('codigoPostal');

    const ciudadesLista = (catalogoInternacional[paisActual] && catalogoInternacional[paisActual][estadoElegido]) || [];

    selectCiudad.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';
    inputCp.value = '';

    ciudadesLista.forEach(item => {
        const option = document.createElement('option');
        option.value = item.ciudad;
        option.textContent = `${item.ciudad} (${item.colonia})`;
        selectCiudad.appendChild(option);
    });
}

function asignarCodigoPostal() {
    const paisActual = document.getElementById('pais').value;
    const estadoElegido = document.getElementById('estado').value;
    const ciudadElegida = document.getElementById('ciudad').value;
    const inputCp = document.getElementById('codigoPostal');

    const ciudadesLista = (catalogoInternacional[paisActual] && catalogoInternacional[paisActual][estadoElegido]) || [];
    const encontrado = ciudadesLista.find(item => item.ciudad === ciudadElegida);

    if (encontrado) {
        inputCp.value = encontrado.cp;
    }
}

// =========================================================
// VALIDACIÓN DE EDAD (MENOR DE EDAD Y FECHA FUTURA)
// =========================================================
function validarEdadActual() {
    const inputFecha = document.getElementById('fechaNacimiento');
    const mensajeEdad = document.getElementById('mensajeEdad');
    const valor = inputFecha.value;

    inputFecha.classList.remove('input-error-borde');

    if (!valor) {
        mensajeEdad.textContent = '';
        return true;
    }

    const partes = valor.split('-');
    const anio = parseInt(partes[0], 10);
    if (partes[0].length < 4 || anio < 1900) {
        mensajeEdad.textContent = '';
        return true;
    }

    const fechaNac = new Date(anio, parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaNac > hoy) {
        inputFecha.classList.add('input-error-borde');
        mensajeEdad.style.color = '#dc2626';
        mensajeEdad.textContent = '⚠️ La fecha de nacimiento no puede ser futura.';
        return false;
    }

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const difMes = hoy.getMonth() - fechaNac.getMonth();
    if (difMes < 0 || (difMes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }

    if (edad < 18) {
        inputFecha.classList.add('input-error-borde');
        mensajeEdad.style.color = '#dc2626';
        mensajeEdad.textContent = `⚠️ ¡Alto ahí! Tienes ${edad} años y eres MENOR DE EDAD. Debes tener al menos 18 años para registrarte.`;
        return false;
    }

    mensajeEdad.style.color = '#15803d';
    mensajeEdad.textContent = `✔ Edad calculada: ${edad} años (Mayor de edad)`;
    return true;
}

// =========================================================
// VALIDACIÓN DE IMAGEN QR WHATSAPP (SOLO FOTOS)
// =========================================================
function esArchivoDeImagenValido(archivo) {
    if (!archivo) return false;
    const extensionesPermitidas = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    const tipoValido = archivo.type && archivo.type.startsWith('image/');
    const nombreValido = extensionesPermitidas.test(archivo.name);
    return Boolean(tipoValido && nombreValido);
}

function quitarFotoWhatsApp() {
    const qrInput = document.getElementById('qrInput');
    const qrImg = document.getElementById('qrImg');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const btnQuitarQr = document.getElementById('btnQuitarQr');
    const errorQrMsg = document.getElementById('errorQrMsg');

    if (qrInput) {
        qrInput.value = '';
        qrInput.classList.remove('input-error-borde');
    }
    if (qrImg) {
        qrImg.src = '';
        qrImg.classList.add('hidden');
    }
    if (qrPlaceholder) qrPlaceholder.classList.remove('hidden');
    if (btnQuitarQr) btnQuitarQr.classList.add('hidden');
    if (errorQrMsg) {
        errorQrMsg.classList.add('hidden');
        errorQrMsg.textContent = '';
    }
}

function procesarArchivoWhatsApp(e) {
    const qrInput = e.target;
    const archivo = qrInput.files[0];
    const qrImg = document.getElementById('qrImg');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const btnQuitarQr = document.getElementById('btnQuitarQr');
    const errorQrMsg = document.getElementById('errorQrMsg');

    if (!archivo) {
        quitarFotoWhatsApp();
        return;
    }

    if (!esArchivoDeImagenValido(archivo)) {
        quitarFotoWhatsApp();
        qrInput.classList.add('input-error-borde');
        errorQrMsg.textContent = `⚠️ ¡Ey! El archivo "${archivo.name}" NO es una imagen. No puedes subir documentos aquí, selecciona únicamente una foto (JPG, PNG, WEBP, GIF).`;
        errorQrMsg.classList.remove('hidden');
        alert(`⚠️ ¡Archivo rechazado!\n\n"${archivo.name}" NO es una imagen.\nPor favor selecciona únicamente una foto válida (JPG, PNG, etc.).`);
        return;
    }

    qrInput.classList.remove('input-error-borde');
    errorQrMsg.classList.add('hidden');
    errorQrMsg.textContent = '';

    const lector = new FileReader();
    lector.onload = function (evento) {
        qrImg.src = evento.target.result;
        qrImg.classList.remove('hidden');
        qrPlaceholder.classList.add('hidden');
        btnQuitarQr.classList.remove('hidden');
    };
    lector.readAsDataURL(archivo);
}

// =========================================================
// CONTRASEÑAS, PASOS Y REGISTRO DE CITA
// =========================================================
function verPassword(idCampo) {
    const input = document.getElementById(idCampo);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function verificarCoincidenciaPass() {
    const inputPass = document.getElementById('contrasena');
    const inputConfirmPass = document.getElementById('confirmarContrasena');
    const errorPassMsg = document.getElementById('errorPassMsg');
    const p1 = inputPass.value;
    const p2 = inputConfirmPass.value;

    if (p1 === '' || p2 === '') {
        errorPassMsg.textContent = '⚠️ ¡Oye! Debes escribir y confirmar tu contraseña antes de pasar al siguiente paso.';
        errorPassMsg.classList.remove('hidden');
        inputPass.classList.add('input-error-borde');
        inputConfirmPass.classList.add('input-error-borde');
        return false;
    }

    if (p1 !== p2) {
        errorPassMsg.textContent = '⚠️ ¡Ey! Las contraseñas NO coinciden. Tienen que ser exactamente iguales para poder avanzar.';
        errorPassMsg.classList.remove('hidden');
        inputPass.classList.add('input-error-borde');
        inputConfirmPass.classList.add('input-error-borde');
        return false;
    }

    if (!/[A-Z]/.test(p1)) {
        errorPassMsg.textContent = '⚠️ ¡Falta seguridad! La contraseña debe incluir al menos una letra MAYÚSCULA.';
        errorPassMsg.classList.remove('hidden');
        inputPass.classList.add('input-error-borde');
        return false;
    }

    errorPassMsg.classList.add('hidden');
    errorPassMsg.textContent = '';
    inputPass.classList.remove('input-error-borde');
    inputConfirmPass.classList.remove('input-error-borde');
    return true;
}

function validarYContinuarPaso4() {
    if (!verificarCoincidenciaPass()) {
        alert('⚠️ ¡Alto ahí! Las contraseñas no coinciden o les falta una mayúscula. Corrígelas para poder continuar.');
        return;
    }
    cambiarVistaPaso(4);
}

function irAPasoValidado(destino) {
    if (destino > 1 && !validarEdadActual()) {
        cambiarVistaPaso(1);
        alert('⚠️ ¡Alto ahí! Eres menor de edad (o pusiste una fecha futura). No puedes continuar con el registro hasta ser mayor de 18 años.');
        return;
    }

    if (destino === 4 && !verificarCoincidenciaPass()) {
        cambiarVistaPaso(3);
        alert('⚠️ No puedes pasar al paso 4 hasta que tus contraseñas coincidan.');
        return;
    }

    cambiarVistaPaso(destino);
}

function cambiarVistaPaso(numPaso) {
    document.querySelectorAll('.form-step').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.stepper .step').forEach(btn => btn.classList.remove('active'));
    const secDestino = document.getElementById('step-' + numPaso);
    const btnDestino = document.getElementById('step-btn-' + numPaso);
    if (secDestino) secDestino.classList.add('active');
    if (btnDestino) btnDestino.classList.add('active');
}

function finalizarYRegistrarCita() {
    if (!validarEdadActual()) {
        cambiarVistaPaso(1);
        alert('⚠️ No se puede completar el registro porque eres menor de edad.');
        return;
    }

    if (!verificarCoincidenciaPass()) {
        cambiarVistaPaso(3);
        alert('⚠️ Tus contraseñas no coinciden. Revísalas en el Paso 3.');
        return;
    }

    const chkTerminos = document.getElementById('terminos');
    if (!chkTerminos.checked) {
        alert('⚠️ Debes aceptar los términos y condiciones de MecaGest antes de enviar la solicitud.');
        chkTerminos.focus();
        return;
    }

    const nombre = document.getElementById('nombre').value.trim() || 'Angel Leonardo';
    const apPaterno = document.getElementById('apPaterno').value.trim() || 'Lemus';
    const apMaterno = document.getElementById('apMaterno').value.trim() || 'Escamilla';
    const nombreCompleto = `${nombre} ${apPaterno} ${apMaterno}`.trim();

    const pais = document.getElementById('pais').value;
    const estado = document.getElementById('estado').value || 'Sin estado';
    const ciudad = document.getElementById('ciudad').value || 'Sin ciudad';
    const direccion = document.getElementById('direccion').value.trim() || 'Domicilio registrado en sistema';
    const telefono = document.getElementById('numTelefonico').value.trim() || '4427394140';

    const tbodyCitas = document.getElementById('bodyTablaCitas');
    const nuevoNumero = tbodyCitas.rows.length + 1;

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const hoy = new Date();
    const fechaFormateada = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
    const mesData = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const nuevaFila = tbodyCitas.insertRow();
    nuevaFila.setAttribute('data-mes', mesData);
    nuevaFila.setAttribute('onclick', 'seleccionarCita(this)');
    nuevaFila.style.backgroundColor = '#fef2f2';
    nuevaFila.innerHTML = `
        <td>${nuevoNumero}</td>
        <td>Cita de alta y valoración inicial con el cliente: <strong>${nombreCompleto}</strong> (Tel: ${telefono})</td>
        <td>Registro de nuevo usuario desde ${ciudad}, ${estado} (${pais}). Dirección: ${direccion}</td>
        <td>${fechaFormateada}</td>
        <td><span class="badge badge-warning">Programada</span></td>
    `;

    alert(`✔ ¡Solicitud enviada correctamente!\n\nTu cita quedó registrada como la No. ${nuevoNumero} a nombre de ${nombreCompleto}.`);
    document.getElementById('tab-citas').checked = true;
    nuevaFila.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cambiarFiltroCitas(tipo) {
    document.getElementById('filtro-mes-box').style.display = tipo === 'mes' ? 'inline-block' : 'none';
    document.getElementById('filtro-semana-box').style.display = tipo === 'semana' ? 'inline-block' : 'none';
}

function seleccionarCita(fila) {
    document.querySelectorAll('#bodyTablaCitas tr').forEach(tr => tr.style.outline = 'none');
    fila.style.outline = '2px solid #dc2626';
}

function agregarHerramienta() {
    const categoria = document.querySelector('input[name="catRecurso"]:checked').value;
    const pieza = document.getElementById('selectPieza').value;
    const cantidad = parseInt(document.getElementById('cantidadRecurso').value, 10) || 1;
    const tbody = document.getElementById('bodyHerramientas');
    const numFila = tbody.rows.length + 1;

    const fila = tbody.insertRow();
    fila.innerHTML = `
        <td>${numFila}</td>
        <td>${pieza}</td>
        <td>${categoria}</td>
        <td class="cant-celda">${cantidad}</td>
        <td>Piezas</td>
    `;

    let suma = 0;
    document.querySelectorAll('.cant-celda').forEach(td => {
        suma += parseInt(td.textContent, 10);
    });
    document.getElementById('totalUnidades').innerHTML = `<strong>${suma}</strong>`;
}