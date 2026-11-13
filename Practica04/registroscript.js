document.addEventListener(
    'DOMContentLoaded', 
    () => {
        const inputFecha = document.getElementById(
            'fechaNacimiento'
        );
        if (inputFecha) {
            inputFecha.addEventListener(
                'change', 
                calcularEdad
            );
            inputFecha.addEventListener(
                'blur', 
                calcularEdad
            );
            calcularEdad();
        }

        const qrInput = document.getElementById(
            'qrInput'
        );
        if (qrInput) {
            qrInput.addEventListener(
                'change', 
                mostrarVistaPreviaQR
            );
        }

        const botonesLimpiar = document.querySelectorAll(
            '.btn-limpiar'
        );
        botonesLimpiar.forEach(
            btn => {
                btn.addEventListener(
                    'click', 
                    () => {
                        const form = document.getElementById(
                            'formRegistro'
                        );
                        if (form) {
                            form.reset();
                        }

                        const mensajeEdad = document.getElementById(
                            'mensajeEdad'
                        );
                        if (mensajeEdad) {
                            mensajeEdad.textContent = '';
                            mensajeEdad.className = 'field-feedback';
                        }

                        ocultarQR();
                        ocultarAlerta();
                    }
                );
            }
        );

        const formRegistro = document.getElementById(
            'formRegistro'
        );
        if (formRegistro) {
            formRegistro.addEventListener(
                'submit', 
                (e) => {
                    e.preventDefault();

                    const terminos = document.getElementById(
                        'terminos'
                    );
                    if (!terminos || !terminos.checked) {
                        mostrarAlerta(
                            'Debes aceptar los términos y condiciones antes de enviar el registro.', 
                            'error'
                        );
                        return;
                    }

                    const datosUsuario = {
                        nombre: document.getElementById('nombre')?.value,
                        apPaterno: document.getElementById('apPaterno')?.value,
                        apMaterno: document.getElementById('apMaterno')?.value,
                        genero: document.getElementById('genero')?.value,
                        fechaNacimiento: document.getElementById('fechaNacimiento')?.value,
                        email: document.getElementById('email')?.value,
                        numTelefonico: document.getElementById('numTelefonico')?.value,
                        horarioInicio: document.getElementById('horarioInicio')?.value,
                        horarioFin: document.getElementById('horarioFin')?.value,
                        usuario: document.getElementById('usuario')?.value,
                        direccion: document.getElementById('direccion')?.value,
                        pais: document.getElementById('pais')?.value,
                        estado: document.getElementById('estado')?.value,
                        ciudad: document.getElementById('ciudad')?.value,
                        codigoPostal: document.getElementById('codigoPostal')?.value,
                        fechaRegistro: new Date().toISOString()
                    };

                    localStorage.setItem(
                        'usuarioMecaGest', 
                        JSON.stringify(datosUsuario)
                    );

                    mostrarAlerta(
                        '¡Registro guardado con éxito en localStorage del navegador!', 
                        'success'
                    );
                }
            );
        }

        const btnVerCitas = document.getElementById(
            'verCitas'
        );

        if (btnVerCitas) {
            btnVerCitas.addEventListener(
                'click', 
                () => {
                    filtrarCitasPorMes();
                }
            );
        }

        const inputColorFuente = document.getElementById(
            'colorFuente'
        );
        const inputColorFondo = document.getElementById(
            'colorFondo'
        );

        if (inputColorFuente) {
            inputColorFuente.addEventListener(
                'input', 
                (e) => {
                    document.body.style.color = e.target.value;
                }
            );
        }

        if (inputColorFondo) {
            inputColorFondo.addEventListener(
                'input', 
                (e) => {
                    document.body.style.backgroundColor = e.target.value;
                }
            );
        }
    }
);

function siguientePaso(
    pasoDestino
) {
    ocultarAlerta();

    const todasLasSecciones = document.querySelectorAll(
        '.form-step'
    );
    todasLasSecciones.forEach(
        step => {
            step.classList.remove(
                'active'
            );
        }
    );

    const todosLosBotonesPaso = document.querySelectorAll(
        '.step'
    );
    todosLosBotonesPaso.forEach(
        btn => {
            btn.classList.remove(
                'active'
            );
        }
    );

    const seccionObjetivo = document.getElementById(
        `step-${pasoDestino}`
    );
    const botonObjetivo = document.getElementById(
        `step-btn-${pasoDestino}`
    );

    if (seccionObjetivo) {
        seccionObjetivo.classList.add(
            'active'
        );
    }

    if (botonObjetivo) {
        botonObjetivo.classList.add(
            'active'
        );
    }
}

function calcularEdad() {
    const inputFecha = document.getElementById(
        'fechaNacimiento'
    );
    const mensaje = document.getElementById(
        'mensajeEdad'
    );

    if (!inputFecha || !mensaje || !inputFecha.value) {
        if (mensaje) {
            mensaje.textContent = '';
        }
        return;
    }

    const fechaNac = new Date(
        inputFecha.value + 'T00:00:00'
    );
    const hoy = new Date();
    hoy.setHours(
        0, 
        0, 
        0, 
        0
    );

    if (fechaNac > hoy) {
        mensaje.textContent = 'Error: no se puede calcular la edad con los datos elegidos. La fecha es futura.';
        mensaje.className = 'field-feedback error';
        inputFecha.value = '';
        return;
    }

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (
        mes < 0 || 
        (mes === 0 && hoy.getDate() < fechaNac.getDate())
    ) {
        edad--;
    }

    if (edad > 120) {
        mensaje.textContent = 'Error: ingrese una fecha de nacimiento válida.';
        mensaje.className = 'field-feedback error';
        inputFecha.value = '';
        return;
    }

    if (edad >= 18) {
        mensaje.textContent = `Eres mayor de edad. Tienes ${edad} años.`;
        mensaje.className = 'field-feedback success';
    } else {
        mensaje.textContent = `Eres menor de edad. Tienes ${edad} años.`;
        mensaje.className = 'field-feedback error';
    }
}

function mostrarVistaPreviaQR(
    e
) {
    const file = e.target.files[0];
    const placeholder = document.getElementById(
        'qrPlaceholder'
    );
    const qrImg = document.getElementById(
        'qrImg'
    );

    if (file) {
        const reader = new FileReader();
        reader.onload = (
            event
        ) => {
            if (qrImg) {
                qrImg.src = event.target.result;
                qrImg.classList.remove(
                    'hidden'
                );
            }
            if (placeholder) {
                placeholder.classList.add(
                    'hidden'
                );
            }
        };
        reader.readAsDataURL(
            file
        );
    } else {
        ocultarQR();
    }
}

function ocultarQR() {
    const placeholder = document.getElementById(
        'qrPlaceholder'
    );
    const qrImg = document.getElementById(
        'qrImg'
    );
    if (qrImg) {
        qrImg.classList.add(
            'hidden'
        );
    }
    if (placeholder) {
        placeholder.classList.remove(
            'hidden'
        );
    }
}

function mostrarAlerta(
    texto, 
    tipo
) {
    const banner = document.getElementById(
        'alert-banner'
    );
    if (banner) {
        banner.textContent = texto;
        banner.className = `alert-banner ${tipo}`;
    }
}

function ocultarAlerta() {
    const banner = document.getElementById(
        'alert-banner'
    );
    if (banner) {
        banner.className = 'alert-banner hidden';
    }
}

function filtrarCitasPorMes() {
    const inputMes = document.getElementById(
        'mesCitas'
    );
    const titulo = document.getElementById(
        'tituloPeriodoCitas'
    );
    const filas = document.querySelectorAll(
        '#bodyTablaCitas tr'
    );

    if (!inputMes || !inputMes.value) {
        alert(
            'Por favor selecciona un mes en el selector del calendario.'
        );
        return;
    }

    const valorMes = inputMes.value;
    const [year, month] = valorMes.split(
        '-'
    );
    
    const mesesNombre = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const nombreMes = mesesNombre[parseInt(month, 10) - 1];

    if (titulo) {
        titulo.textContent = `Las citas programadas para ${nombreMes} de ${year} son:`;
    }

    let encontradas = 0;

    filas.forEach(
        fila => {
            const mesFila = fila.getAttribute(
                'data-mes'
            );
            if (mesFila === valorMes) {
                fila.style.display = '';
                encontradas++;
            } else {
                fila.style.display = 'none';
            }
        }
    );

    if (encontradas === 0) {
        alert(
            `No existen citas registradas para ${nombreMes} de ${year}.`
        );
    }
}

function seleccionarCita(
    fila
) {
    const todasLasFilas = document.querySelectorAll(
        '#bodyTablaCitas tr'
    );
    todasLasFilas.forEach(
        f => f.classList.remove(
            'fila-seleccionada'
        )
    );

    fila.classList.add(
        'fila-seleccionada'
    );

    const columnas = fila.querySelectorAll(
        'td'
    );
    const cliente = columnas[1]?.textContent;
    const estatus = columnas[4]?.textContent;

    alert(
        `Detalles de la Cita:\n\n${cliente}\nEstatus: ${estatus}`
    );
}