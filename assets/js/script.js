document.addEventListener('DOMContentLoaded', () => {
    const calendarBody = document.getElementById('calendarBody');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const modal = new bootstrap.Modal(document.getElementById('modalAgendamento'));
    const confirmButton = document.getElementById('confirmarAgendamento');
    const barberShopId = '5e51932c-b7e3-11ef-b363-a8a159004237'; // ID da barbearia

    window.appointments = {}; // Armazena os agendamentos em memória global
    let currentDate = new Date();
    let selectedTimeSlot = null;

    // Função para buscar e renderizar os agendamentos
    function initializeCalendar() {
        loadAppointments(barberShopId); // Buscar os agendamentos
    }

    // Inicializar calendário ao carregar a página
    initializeCalendar();


        // Navegar entre meses
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
    
        document.getElementById('nextMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });

    // Carregar agendamentos do backend
    function loadAppointments(barberShopId) {
        fetch(`https://192.168.2.242:7035/api/appointments/barbershop/${barberShopId}`)
            .then(response => response.json())
            .then(data => {
                // Transformar array em um objeto organizado por data
                const appointmentsByDate = {};
    
                data.forEach(appointment => {
                    // Extrair a data no formato YYYY-MM-DD
                    const dateKey = new Date(appointment.date).toISOString().split('T')[0];
    
                    if (!appointmentsByDate[dateKey]) {
                        appointmentsByDate[dateKey] = [];
                    }
    
                    appointmentsByDate[dateKey].push({
                        startTime: appointment.startTime.slice(0, 5), // Exemplo: "08:30"
                        endTime: appointment.endTime.slice(0, 5),
                        customerName: appointment.customerName,
                        customerPhone: appointment.customerPhone,
                        serviceDescription: appointment.serviceDescription,
                    });
                });
    
                // Armazenar os dados no formato esperado
                window.appointments = appointmentsByDate;
    
                console.log('Agendamentos processados:', window.appointments); // Para debug
    
                // Re-renderizar o calendário
                renderCalendar(currentDate, barberShopId);
            })
            .catch(error => console.error('Erro ao carregar agendamentos:', error));
    }
    

    // Salvar agendamento no backend
    function saveAppointment(appointment) {
        fetch(`https://192.168.2.242:7035/api/appointments`, {  // Substitua pela URL real do seu endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointment),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Agendamento salvo:', data);
            loadAppointments(barberShopId);  // Atualiza os agendamentos depois de salvar
        })
        .catch(error => console.error('Erro ao salvar agendamento:', error));
    }

    function renderCalendar(date, barberShopId) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        calendarBody.innerHTML = '';
        currentMonthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
        let dayCount = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < firstDay || dayCount > daysInMonth) {
                    row.appendChild(cell);
                    continue;
                }
    
                const cellDate = new Date(year, month, dayCount);
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                cell.textContent = dayCount;
                cell.dataset.date = dateKey;
                cell.classList.add('date-cell');
    
                // Bloquear dias anteriores
                if (cellDate < yesterday) {
                    cell.classList.add('disabled-day'); // Adicionar classe para dia desativado
                    cell.style.backgroundColor = 'gray'; // Estilo de cor cinza
                    cell.style.pointerEvents = 'none'; // Desabilitar interatividade
                }
    
                // Exibir horários ocupados no dia
                if (window.appointments[dateKey]) {
                    const appointmentsContainer = document.createElement('div');
                    appointmentsContainer.className = 'appointments-container';
    
                    window.appointments[dateKey].forEach(app => {
                        const appointmentDiv = document.createElement('div');
                        appointmentDiv.className = 'occupied-time';
                        appointmentDiv.textContent = `${app.startTime} - ${app.endTime}`;
                        appointmentDiv.title = `Agendado por: ${app.customerName}`;
                        appointmentDiv.addEventListener('click', () => displayAppointmentDetails(app));
                        appointmentsContainer.appendChild(appointmentDiv);
                    });
    
                    cell.appendChild(appointmentsContainer);
                }
    
                cell.addEventListener('click', () => openModal(dateKey));
                row.appendChild(cell);
                dayCount++;
            }
            calendarBody.appendChild(row);
        }
    }
        

    // Criar slots de tempo baseados no serviço
    function createTimeSlots(dateKey) {
        const serviceType = document.getElementById('service')?.value || 30;
        const serviceDuration = parseInt(serviceType);
        const startOfDay = 8 * 60; // 08:00
        const endOfDay = 17 * 60; // 17:00
        const timeSlots = [];

        for (let time = startOfDay; time + serviceDuration <= endOfDay; time += 30) {
            const startTime = formatTime(time);
            const endTime = formatTime(time + serviceDuration);
            timeSlots.push({ startTime, endTime });
        }

        return timeSlots;
    }

    // Verificar se o horário está ocupado
    function isOccupied(dateKey, startTime, endTime) {
        if (!window.appointments[dateKey]) return false;
        return window.appointments[dateKey].some(app => {
            const appStart = app.startTime;
            const appEnd = app.endTime;
            return (startTime < appEnd && endTime > appStart); // Verifica conflito
        });
    }

    // Abrir a modal para agendamento
  // Abrir a modal para agendamento
function openModal(dateKey) {
    document.getElementById('selectedDate').value = dateKey;
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    timeSlotsContainer.innerHTML = ''; // Limpa os slots de tempo

    // Criar slots de tempo disponíveis
    const slots = createTimeSlots(dateKey);
    
    // Adicionar os slots à modal
    slots.forEach(slot => {
        const timeSlotDiv = document.createElement('div');
        timeSlotDiv.classList.add('available-time');
        timeSlotDiv.textContent = `${slot.startTime} - ${slot.endTime}`;

        // Verificar se o horário está ocupado
        if (isOccupied(dateKey, slot.startTime, slot.endTime)) {
            // Não exibir horários ocupados na modal
            timeSlotDiv.style.display = 'none'; // Ocultar o slot ocupado
        } else {
            timeSlotDiv.addEventListener('click', () => {
                if (selectedTimeSlot) {
                    selectedTimeSlot.classList.remove('selected-time');
                }
                timeSlotDiv.classList.add('selected-time');
                selectedTimeSlot = timeSlotDiv;
            });
        }

        timeSlotsContainer.appendChild(timeSlotDiv);
    });

    modal.show();
}

    

    // Exibir detalhes do agendamento
    function displayAppointmentDetails(appointment) {
        const message = `**Detalhes do Agendamento**\nNome: ${appointment.name}\nWhatsApp: ${appointment.whatsapp}`;
        alert(message);
    }

    // Confirmar agendamento
    confirmButton.addEventListener('click', () => {
        const selectedDate = document.getElementById('selectedDate').value; // Data selecionada
        const nameField = document.getElementById('nome');
        const whatsappField = document.getElementById('whatsapp');
        const serviceField = document.getElementById('service');
        const barberShopField ='Barbearia XYZ';
        const serviceDescriptionField = document.getElementById('service');

    
        if (!nameField || !whatsappField || !serviceField || !barberShopField || !serviceDescriptionField) {
            console.error('Um ou mais campos obrigatórios não foram encontrados.');
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
    
        const name = nameField.value;               // Nome do cliente
        const whatsapp = whatsappField.value;       // WhatsApp do cliente
        const barberShop = barberShopField;         
        const service = serviceField;          // Tipo de serviço

        const serviceDescription =  serviceField;        // Descrição do serviço
    
        const selectedSlot = selectedTimeSlot ? selectedTimeSlot.textContent.split(' - ') : [];
        const startTime = selectedSlot[0] || '';
        const endTime = selectedSlot[1] || '';
    
        if (startTime && endTime) {
            const startTimeMinutes = convertToMinutes(startTime);
            const endTimeMinutes = convertToMinutes(endTime);
            const timeSpan = endTimeMinutes - startTimeMinutes; // Diferença em minutos
            
            // Agora você pode enviar `timeSpan` como o valor para o backend
        } else {
            alert('Por favor, selecione um horário válido.');
        }
        
        // Função para converter o horário no formato HH:mm para minutos
        function convertToMinutes(startTime) {
            const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));
            return hours * 60 + minutes; // Converte para minutos
        }
        
        // Validar se todos os campos obrigatórios foram preenchidos
        if (!startTime || !endTime) {
            alert('Por favor, selecione um horário!');
            return;
        }
    
        if (!name || !whatsapp || !service || !barberShop || !serviceDescription) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
    
        // Verificar se o cliente já tem agendamento
        if (window.appointments[selectedDate]) {
            const existingAppointment = window.appointments[selectedDate].find(
                app => app.whatsapp === whatsapp
            );
    
            if (existingAppointment) {
                alert(`Este cliente já está agendado no dia ${selectedDate} para o horário ${existingAppointment.time} - ${existingAppointment.endTime}.`);
                return;
            }
        }
    
        // Verificar se o horário já está ocupado
        if (isOccupied(selectedDate, startTime, endTime)) {
            alert('Este horário já está ocupado. Por favor, escolha outro horário.');
            return;
        }
    
        // Garantir que o formato da data está correto (YYYY-MM-DD)
        const formattedDate = new Date(selectedDate).toISOString().split('T')[0]; // Formatar como YYYY-MM-DD
    
        // Preencher o objeto appointment com os dados necessários
        const appointment = {
            model: "Appointment",  // Substitua com o valor correto
            barberShop: barberShopField,
            barberShopId: barberShopId,
            date: formattedDate,
            customerName: name,
            customerPhone: whatsapp,
            serviceDescription: "serviceDescription",
            startTime: startTime,
            endTime: endTime
        };
        
    
        // Garantir que a estrutura do objeto está correta
        console.log(appointment);  // Verifique no console se os campos estão corretamente preenchidos
    
        // Adicionar o agendamento ao array de agendamentos do dia
        if (!window.appointments[selectedDate]) {
            window.appointments[selectedDate] = [];
        }
    
        window.appointments[selectedDate].push(appointment);
    
        // Salvar o agendamento no backend
        saveAppointment(appointment);
        loadAppointments(barberShopId); // Atualizar a agenda após salvar o agendamento
    
        // Limpar o formulário e fechar o modal
        document.getElementById('formAgendamento').reset();
        modal.hide();
    });
    
    
    
    

    // Formatar hora
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // Atualizar horários ao mudar o serviço
    document.getElementById('service').addEventListener('change', () => {
        const selectedDate = document.getElementById('selectedDate').value;
        openModal(selectedDate);
    });


});
