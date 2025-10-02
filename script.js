// Dati dell'applicazione
let subjects = JSON.parse(localStorage.getItem('schoolSubjects')) || [];
let currentDate = new Date();
let currentWeek = 0;
let currentMonth = 0;
let editingSubjectId = null;
let currentLanguage = localStorage.getItem('language') || 'it';
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

// Testi multilingua
const translations = {
    it: {
        appTitle: "Calendario Scolastico",
        appSubtitle: "Organizza le tue materie, compiti e voti",
        week: "Settimana",
        today: "Oggi",
        monthly: "Mensile",
        stats: "Statistiche",
        subject: "Materia",
        day: "Giorno",
        homework: "Compiti",
        homeworkDesc: "Descrizione compiti",
        homeworkDeadline: "Scadenza (opzionale)",
        homeworkPriority: "Priorità",
        homeworkDone: "Compiti completati",
        note: "Note",
        noteDesc: "Note sulla materia",
        grade: "Voti",
        gradeQuarter: "Quadrimestre",
        addGrade: "+ Aggiungi Voto",
        save: "Salva Materia",
        addSubject: "Aggiungi Materia",
        editSubject: "Modifica Materia",
        noSubjects: "Nessuna materia programmata",
        addTodaySubject: "Aggiungi Materia",
        statsTitle: "Statistiche Voti",
        statsSubject: "Materia",
        statsFirst: "Media 1° Quad.",
        statsSecond: "Media 2° Quad.",
        statsTotal: "Media Annuale",
        days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
        dayNames: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
        months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
                "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        remove: "Rimuovi",
        priority: {
            high: "Alta",
            medium: "Media",
            low: "Bassa"
        }
    },
    en: {
        appTitle: "School Calendar",
        appSubtitle: "Organize your subjects, homework and grades",
        week: "Week",
        today: "Today",
        monthly: "Monthly",
        stats: "Statistics",
        subject: "Subject",
        day: "Day",
        homework: "Homework",
        homeworkDesc: "Homework description",
        homeworkDeadline: "Deadline (optional)",
        homeworkPriority: "Priority",
        homeworkDone: "Homework completed",
        note: "Notes",
        noteDesc: "Notes about the subject",
        grade: "Grades",
        gradeQuarter: "Quarter",
        addGrade: "+ Add Grade",
        save: "Save Subject",
        addSubject: "Add Subject",
        editSubject: "Edit Subject",
        noSubjects: "No subjects scheduled",
        addTodaySubject: "Add Subject",
        statsTitle: "Grade Statistics",
        statsSubject: "Subject",
        statsFirst: "1st Quarter Avg.",
        statsSecond: "2nd Quarter Avg.",
        statsTotal: "Annual Average",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        months: ["January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"],
        remove: "Remove",
        priority: {
            high: "High",
            medium: "Medium",
            low: "Low"
        }
    }
};

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateLanguage();
    updateTheme();
    renderWeeklyView();
    renderDailyView();
    renderMonthlyView();
    renderStatsView();
    
    // Gestione dinamica della materia personalizzata
    const subjectSelect = document.getElementById('subject-name');
    const customSubjectInput = document.getElementById('custom-subject');
    subjectSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customSubjectInput.style.display = 'block';
            customSubjectInput.focus();
        } else {
            customSubjectInput.style.display = 'none';
            customSubjectInput.value = '';
        }
    });
});

function initializeApp() {
    if (subjects.length === 0) {
        subjects = [
            {
                id: generateId(),
                name: 'Italiano',
                day: 1,
                homework: 'Pagina 45 esercizi 1-5',
                homeworkDeadline: getDateString(3),
                homeworkPriority: 'high',
                homeworkDone: false,
                note: 'Portare il libro di testo',
                grades: [
                    { value: 7.5, quarter: 1 },
                    { value: 8, quarter: 1 },
                    { value: 7, quarter: 2 },
                    { value: 8.5, quarter: 2 }
                ]
            },
            {
                id: generateId(),
                name: 'Storia',
                day: 1,
                homework: 'Analisi del testo pagina 32',
                homeworkDeadline: getDateString(2),
                homeworkPriority: 'medium',
                homeworkDone: true,
                note: '',
                grades: [
                    { value: 6.5, quarter: 1 },
                    { value: 7, quarter: 2 }
                ]
            },
            {
                id: generateId(),
                name: 'Geografia',
                day: 2,
                homework: '',
                homeworkDone: false,
                note: 'Studiare capitolo 3',
                grades: []
            },
            {
                id: generateId(),
                name: 'Chimica',
                day: 3,
                homework: 'Esperimento sui composti',
                homeworkDeadline: getDateString(7),
                homeworkPriority: 'medium',
                homeworkDone: false,
                note: 'Portare il camice',
                grades: [
                    { value: 9, quarter: 1 },
                    { value: 8.5, quarter: 2 }
                ]
            }
        ];
        saveSubjects();
    }
}

function setupEventListeners() {
    // Navigazione tra tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
        });
    });
    
    // Navigazione giornaliera
    document.getElementById('prev-day').addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 1);
        if (currentDate.getDay() === 0) {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderDailyView();
    });
    
    document.getElementById('next-day').addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        renderDailyView();
    });
    
    // Navigazione settimanale
    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeek--;
        renderWeeklyView();
    });
    
    document.getElementById('next-week').addEventListener('click', function() {
        currentWeek++;
        renderWeeklyView();
    });
    
    // Navigazione mensile
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        renderMonthlyView();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        renderMonthlyView();
    });
    
    // Apri modale per aggiungere materia
    document.getElementById('add-subject-btn').addEventListener('click', function() {
        openSubjectModal();
    });
    
    // Chiudi modale
    document.querySelector('.close-modal').addEventListener('click', function() {
        closeSubjectModal();
    });
    
    // Salva materia
    document.getElementById('subject-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSubject();
    });
    
    // Chiudi modale cliccando fuori
    document.getElementById('subject-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSubjectModal();
        }
    });
    
    // Aggiungi voto
    document.getElementById('add-grade').addEventListener('click', function() {
        addGradeInput();
    });
    
    // Cambia lingua
    document.getElementById('language-select').addEventListener('change', function() {
        currentLanguage = this.value;
        localStorage.setItem('language', currentLanguage);
        updateLanguage();
        renderWeeklyView();
        renderDailyView();
        renderMonthlyView();
        renderStatsView();
    });
    
    // Cambia tema
    document.getElementById('theme-toggle').addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        localStorage.setItem('darkTheme', isDarkTheme);
        updateTheme();
    });
}

function updateLanguage() {
    const t = translations[currentLanguage];
    
    // Aggiorna i testi dell'interfaccia
    document.getElementById('app-title').textContent = t.appTitle;
    document.getElementById('app-subtitle').textContent = t.appSubtitle;
    document.getElementById('tab-weekly').textContent = t.week;
    document.getElementById('tab-daily').textContent = t.today;
    document.getElementById('tab-monthly').textContent = t.monthly;
    document.getElementById('tab-stats').textContent = t.stats;
    document.getElementById('stats-title').textContent = t.statsTitle;
    document.getElementById('stats-subject').textContent = t.statsSubject;
    document.getElementById('stats-first').textContent = t.statsFirst;
    document.getElementById('stats-second').textContent = t.statsSecond;
    document.getElementById('stats-total').textContent = t.statsTotal;
    
    // Aggiorna i testi del modale
    document.getElementById('label-subject').textContent = t.subject;
    document.getElementById('label-day').textContent = t.day;
    document.getElementById('homework-title').textContent = t.homework;
    document.getElementById('label-homework').textContent = t.homeworkDesc;
    document.getElementById('label-homework-deadline').textContent = t.homeworkDeadline;
    document.getElementById('label-homework-priority').textContent = t.homeworkPriority;
    document.getElementById('label-homework-done').textContent = t.homeworkDone;
    document.getElementById('note-title').textContent = t.note;
    document.getElementById('label-note').textContent = t.noteDesc;
    document.getElementById('grade-title').textContent = t.grade;
    document.getElementById('label-grade-quarter').textContent = t.gradeQuarter;
    document.getElementById('add-grade').textContent = t.addGrade;
    document.getElementById('save-subject').textContent = t.save;
    
    // Aggiorna i giorni della settimana
    document.getElementById('day-monday').textContent = t.days[1];
    document.getElementById('day-tuesday').textContent = t.days[2];
    document.getElementById('day-wednesday').textContent = t.days[3];
    document.getElementById('day-thursday').textContent = t.days[4];
    document.getElementById('day-friday').textContent = t.days[5];
    document.getElementById('day-saturday').textContent = t.days[6];
    
    // Aggiorna le opzioni di priorità
    const prioritySelect = document.getElementById('homework-priority');
    prioritySelect.innerHTML = `
        <option value="low">${t.priority.low}</option>
        <option value="medium" selected>${t.priority.medium}</option>
        <option value="high">${t.priority.high}</option>
    `;
    
    // Imposta la lingua selezionata
    document.getElementById('language-select').value = currentLanguage;
}

function updateTheme() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        document.getElementById('theme-toggle').textContent = '🌙';
    }
}

function renderWeeklyView() {
    const today = new Date();
    let startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7));
    if (startOfWeek.getDay() === 0) {
        startOfWeek.setDate(startOfWeek.getDate() + 1);
    }
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5);
    
    const t = translations[currentLanguage];
    const weekTitle = `${t.week} ${getWeekNumber(startOfWeek)}: ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    document.getElementById('week-title').textContent = weekTitle;
    
    const calendarContainer = document.getElementById('weekly-calendar');
    calendarContainer.innerHTML = '';
    
    const dayNames = t.dayNames;
    
    for (let i = 0; i < 6; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        if (dayDate.toDateString() === today.toDateString()) {
            dayColumn.classList.add('today');
        }
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = `${dayNames[i]} ${dayDate.getDate()}`;
        
        dayColumn.appendChild(dayHeader);
        
        const daySubjects = document.createElement('div');
        daySubjects.className = 'day-subjects';
        
        const dayOfWeek = i + 1; // 1 = Lunedì, 2 = Martedì, ..., 6 = Sabato
        const dailySubjects = subjects.filter(subject => subject.day === dayOfWeek);
        
        if (dailySubjects.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'weekly-subject';
            emptyMsg.textContent = t.noSubjects;
            emptyMsg.style.opacity = '0.6';
            emptyMsg.style.fontStyle = 'italic';
            daySubjects.appendChild(emptyMsg);
        } else {
            dailySubjects.forEach(subject => {
                const subjectElement = document.createElement('div');
                subjectElement.className = 'weekly-subject';
                subjectElement.textContent = subject.name;
                subjectElement.addEventListener('click', function() {
                    editSubject(subject.id);
                });
                daySubjects.appendChild(subjectElement);
            });
        }
        
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary';
        addButton.textContent = '+';
        addButton.style.width = '100%';
        addButton.style.marginTop = '0.5rem';
        addButton.style.padding = '0.25rem';
        addButton.addEventListener('click', function() {
            openSubjectModal(dayOfWeek);
        });
        
        dayColumn.appendChild(daySubjects);
        dayColumn.appendChild(addButton);
        calendarContainer.appendChild(dayColumn);
    }
}

function renderDailyView() {
    let day = currentDate.getDay();
    if (day === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        day = 1;
    }
    
    const t = translations[currentLanguage];
    const dayNames = t.days;
    const monthNames = t.months;
    
    const dateString = `${dayNames[day]} ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    document.getElementById('current-date').textContent = dateString;
    
    const today = new Date();
    const todayIndicator = document.createElement('span');
    todayIndicator.className = 'today-highlight';
    todayIndicator.textContent = t.today.toUpperCase();
    
    if (currentDate.toDateString() === today.toDateString()) {
        if (!document.getElementById('current-date').querySelector('.today-highlight')) {
            document.getElementById('current-date').appendChild(todayIndicator);
        }
    } else {
        const existingIndicator = document.getElementById('current-date').querySelector('.today-highlight');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
    
    const dailySubjects = subjects.filter(subject => subject.day === day);
    const subjectsContainer = document.getElementById('daily-subjects');
    subjectsContainer.innerHTML = '';
    
    if (dailySubjects.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <p>${t.noSubjects}</p>
            <button class="btn btn-primary" id="add-today-subject">${t.addTodaySubject}</button>
        `;
        subjectsContainer.appendChild(emptyState);
        
        document.getElementById('add-today-subject').addEventListener('click', function() {
            openSubjectModal(day);
        });
    } else {
        dailySubjects.forEach(subject => {
            const subjectCard = createSubjectCard(subject, true);
            subjectsContainer.appendChild(subjectCard);
        });
    }
}

function renderMonthlyView() {
    const today = new Date();
    const viewDate = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
    
    const t = translations[currentLanguage];
    const monthTitle = `${t.months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    document.getElementById('month-title').textContent = monthTitle;
    
    const calendarContainer = document.getElementById('month-calendar');
    calendarContainer.innerHTML = '';
    
    // Intestazioni giorni (Lunedì - Sabato)
    const dayHeaders = t.dayNames;
    dayHeaders.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayName;
        dayHeader.style.textAlign = 'center';
        dayHeader.style.fontWeight = 'bold';
        dayHeader.style.padding = '0.5rem';
        calendarContainer.appendChild(dayHeader);
    });
    
    // Primo giorno del mese
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    let startingDay = firstDay.getDay(); // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
    
    // Converti in Lunedì=0, Martedì=1, ..., Sabato=5
    startingDay = startingDay === 0 ? 6 : startingDay - 1;
    
    // Ultimo giorno del mese
    const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Calcola il numero di giorni da visualizzare (escludendo domeniche)
    let currentDay = 1;
    let gridPosition = 0;
    
    // Crea una griglia per 6 settimane (36 celle, 6x6)
    for (let i = 0; i < 36; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (i >= startingDay && currentDay <= daysInMonth) {
            const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), currentDay);
            
            // Salta le domeniche
            if (dayDate.getDay() === 0) {
                currentDay++;
                i--; // Ripeti la posizione della griglia per il prossimo giorno valido
                continue;
            }
            
            // Aggiungi classe 'today' se è oggi
            if (dayDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'day-number';
            dayNumberElement.textContent = currentDay;
            dayElement.appendChild(dayNumberElement);
            
            const eventsElement = document.createElement('div');
            eventsElement.className = 'calendar-events';
            
            // Trova materie per questo giorno (converti da Domenica=0 a Lunedì=1)
            const dayOfWeek = dayDate.getDay();
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek;
            const daySubjects = subjects.filter(s => s.day === adjustedDayOfWeek);
            
            // Raggruppa per materia
            const subjectMap = new Map();
            daySubjects.forEach(subject => {
                if (!subjectMap.has(subject.name)) {
                    subjectMap.set(subject.name, []);
                }
                subjectMap.get(subject.name).push(subject);
            });
            
            // Crea eventi raggruppati per materia
            subjectMap.forEach((subjects, subjectName) => {
                const eventElement = document.createElement('div');
                eventElement.className = 'calendar-event';
                eventElement.textContent = subjectName;
                eventElement.addEventListener('click', function() {
                    showSubjectDetails(subjects);
                });
                eventsElement.appendChild(eventElement);
                
                // Aggiungi indicatori per compiti, note e voti
                const hasHomework = subjects.some(s => s.homework && s.homework.trim() !== '');
                const hasNote = subjects.some(s => s.note && s.note.trim() !== '');
                const hasGrades = subjects.some(s => s.grades && s.grades.length > 0);
                
                if (hasHomework) {
                    const homeworkIndicator = document.createElement('div');
                    homeworkIndicator.className = 'calendar-event homework';
                    // Verifica se tutti i compiti sono completati
                    const allHomeworkDone = subjects.every(s => !s.homework || s.homeworkDone);
                    homeworkIndicator.style.backgroundColor = allHomeworkDone ? 'var(--grade)' : 'var(--homework)';
                    homeworkIndicator.textContent = t.homework;
                    homeworkIndicator.style.marginTop = '0.25rem';
                    homeworkIndicator.style.fontSize = '0.6rem';
                    homeworkIndicator.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showHomeworkDetails(subjects);
                    });
                    eventsElement.appendChild(homeworkIndicator);
                }
                
                if (hasNote) {
                    const noteIndicator = document.createElement('div');
                    noteIndicator.className = 'calendar-event note';
                    noteIndicator.textContent = t.note;
                    noteIndicator.style.marginTop = '0.25rem';
                    noteIndicator.style.fontSize = '0.6rem';
                    noteIndicator.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showSubjectDetails(subjects);
                    });
                    eventsElement.appendChild(noteIndicator);
                }
                
                if (hasGrades) {
                    const gradeIndicator = document.createElement('div');
                    gradeIndicator.className = 'calendar-event grade';
                    gradeIndicator.textContent = t.grade;
                    gradeIndicator.style.marginTop = '0.25rem';
                    gradeIndicator.style.fontSize = '0.6rem';
                    gradeIndicator.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showSubjectDetails(subjects);
                    });
                    eventsElement.appendChild(gradeIndicator);
                }
            });
            
            dayElement.appendChild(eventsElement);
            currentDay++;
        } else {
            dayElement.style.opacity = '0.3';
        }
        
        calendarContainer.appendChild(dayElement);
    }
}

function renderStatsView() {
    const tableBody = document.querySelector('#stats-table tbody');
    tableBody.innerHTML = '';
    
    // Raggruppa materie per nome
    const subjectMap = new Map();
    subjects.forEach(subject => {
        if (!subjectMap.has(subject.name)) {
            subjectMap.set(subject.name, []);
        }
        subjectMap.get(subject.name).push(subject);
    });
    
    // Calcola statistiche per ogni materia
    subjectMap.forEach((subjectGroup, subjectName) => {
        const firstQuarterGrades = [];
        const secondQuarterGrades = [];
        
        subjectGroup.forEach(subject => {
            if (subject.grades && subject.grades.length > 0) {
                subject.grades.forEach(grade => {
                    if (grade.quarter === 1) {
                        firstQuarterGrades.push(parseFloat(grade.value));
                    } else if (grade.quarter === 2) {
                        secondQuarterGrades.push(parseFloat(grade.value));
                    }
                });
            }
        });
        
        const firstQuarterAvg = firstQuarterGrades.length > 0 
            ? (firstQuarterGrades.reduce((sum, grade) => sum + grade, 0) / firstQuarterGrades.length).toFixed(2)
            : '-';
            
        const secondQuarterAvg = secondQuarterGrades.length > 0 
            ? (secondQuarterGrades.reduce((sum, grade) => sum + grade, 0) / secondQuarterGrades.length).toFixed(2)
            : '-';
            
        const allGrades = [...firstQuarterGrades, ...secondQuarterGrades];
        const totalAvg = allGrades.length > 0 
            ? (allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length).toFixed(2)
            : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subjectName}</td>
            <td>${firstQuarterAvg}</td>
            <td>${secondQuarterAvg}</td>
            <td>${totalAvg}</td>
        `;
        tableBody.appendChild(row);
    });
}

function createSubjectCard(subject, showActions = false) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    
    if (subject.homework && subject.homework.trim() !== '' && !subject.homeworkDone) {
        card.classList.add('has-homework');
    } else if (subject.note && subject.note.trim() !== '') {
        card.classList.add('has-note');
    } else if (subject.grades && subject.grades.length > 0) {
        card.classList.add('has-grade');
    }
    
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.style.display = 'flex';
    indicatorsContainer.style.alignItems = 'center';
    indicatorsContainer.style.marginRight = '10px';
    
    if (subject.homework && subject.homework.trim() !== '') {
        const homeworkIndicator = document.createElement('div');
        homeworkIndicator.className = 'homework-indicator';
        if (subject.homeworkDone) {
            homeworkIndicator.classList.add('done');
        }
        homeworkIndicator.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleHomework(subject.id);
        });
        indicatorsContainer.appendChild(homeworkIndicator);
    }
    
    const subjectInfo = document.createElement('div');
    subjectInfo.className = 'subject-info';
    subjectInfo.innerHTML = `
        <h3>${subject.name}</h3>
    `;
    
    const t = translations[currentLanguage];
    
    if (subject.homework && subject.homework.trim() !== '') {
        const homeworkSection = document.createElement('div');
        homeworkSection.className = 'container-section homework';
        
        let homeworkText = `<strong>${t.homework}:</strong> ${subject.homework}`;
        if (subject.homeworkDeadline) {
            const deadline = new Date(subject.homeworkDeadline);
            homeworkText += ` <em>(Scadenza: ${deadline.toLocaleDateString()})</em>`;
        }
        if (subject.homeworkDone) {
            homeworkText += ` <strong>(${t.homeworkDone})</strong>`;
        }
        
        homeworkSection.innerHTML = homeworkText;
        subjectInfo.appendChild(homeworkSection);
    }
    
    if (subject.note && subject.note.trim() !== '') {
        const noteSection = document.createElement('div');
        noteSection.className = 'container-section note';
        noteSection.innerHTML = `<strong>${t.note}:</strong> ${subject.note}`;
        subjectInfo.appendChild(noteSection);
    }
    
    if (subject.grades && subject.grades.length > 0) {
        const gradeSection = document.createElement('div');
        gradeSection.className = 'container-section grade';
        
        const firstQuarterGrades = subject.grades.filter(g => g.quarter === 1);
        const secondQuarterGrades = subject.grades.filter(g => g.quarter === 2);
        
        let gradesText = `<strong>${t.grade}:</strong> `;
        if (firstQuarterGrades.length > 0) {
            gradesText += `1° Quad: ${firstQuarterGrades.map(g => g.value).join(', ')} `;
        }
        if (secondQuarterGrades.length > 0) {
            gradesText += `2° Quad: ${secondQuarterGrades.map(g => g.value).join(', ')}`;
        }
        
        gradeSection.innerHTML = gradesText;
        subjectInfo.appendChild(gradeSection);
    }
    
    card.appendChild(indicatorsContainer);
    card.appendChild(subjectInfo);
    
    if (showActions) {
        const actions = document.createElement('div');
        actions.className = 'subject-actions';
        actions.innerHTML = `
            <button class="action-btn edit" data-id="${subject.id}">✏️</button>
            <button class="action-btn delete" data-id="${subject.id}">🗑️</button>
        `;
        card.appendChild(actions);
        
        actions.querySelector('.edit').addEventListener('click', function(e) {
            e.stopPropagation();
            editSubject(subject.id);
        });
        
        actions.querySelector('.delete').addEventListener('click', function(e) {
            e.stopPropagation();
            deleteSubject(subject.id);
        });
    }
    
    return card;
}

function showSubjectDetails(subjects) {
    const t = translations[currentLanguage];
    let message = `Dettagli per ${subjects[0].name}:\n\n`;
    
    subjects.forEach((subject, index) => {
        if (index > 0) message += '\n';
        if (subject.homework && subject.homework.trim() !== '') {
            message += `Compiti: ${subject.homework}\n`;
            if (subject.homeworkDeadline) {
                const deadline = new Date(subject.homeworkDeadline);
                message += `Scadenza: ${deadline.toLocaleDateString()}\n`;
            }
            message += `Completati: ${subject.homeworkDone ? 'Sì' : 'No'}\n`;
        }
        if (subject.note && subject.note.trim() !== '') {
            message += `Note: ${subject.note}\n`;
        }
        if (subject.grades && subject.grades.length > 0) {
            message += `Voti: ${subject.grades.map(g => `${g.value} (Q${g.quarter})`).join(', ')}\n`;
        }
    });
    
    alert(message);
}

function showHomeworkDetails(subjects) {
    const t = translations[currentLanguage];
    let message = `Compiti per ${subjects[0].name}:\n\n`;
    
    const homeworkSubjects = subjects.filter(s => s.homework && s.homework.trim() !== '');
    
    if (homeworkSubjects.length === 0) {
        message += 'Nessun compito assegnato';
    } else {
        homeworkSubjects.forEach((subject, index) => {
            if (index > 0) message += '\n';
            message += `• ${subject.homework}\n`;
            if (subject.homeworkDeadline) {
                const deadline = new Date(subject.homeworkDeadline);
                message += `  Scadenza: ${deadline.toLocaleDateString()}\n`;
            }
            message += `  Priorità: ${t.priority[subject.homeworkPriority]}\n`;
            message += `  Completati: ${subject.homeworkDone ? 'Sì' : 'No'}\n`;
        });
    }
    
    alert(message);
}

function toggleHomework(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
        subject.homeworkDone = !subject.homeworkDone;
        saveSubjects();
        renderDailyView();
        renderWeeklyView();
        renderMonthlyView();
    }
}

function addGradeInput(grade = { value: '', quarter: 1 }) {
    const gradeList = document.getElementById('grade-list');
    const gradeItem = document.createElement('div');
    gradeItem.className = 'grade-item';
    const t = translations[currentLanguage];
    gradeItem.innerHTML = `
        <input type="number" class="form-control grade-value" step="0.25" min="0" max="10" value="${grade.value}" placeholder="${t.grade}">
        <button type="button" class="btn btn-danger remove-grade">${t.remove}</button>
    `;
    gradeList.appendChild(gradeItem);
    
    gradeItem.querySelector('.remove-grade').addEventListener('click', function() {
        gradeItem.remove();
    });
}

function openSubjectModal(day = null) {
    editingSubjectId = null;
    const t = translations[currentLanguage];
    document.getElementById('modal-title').textContent = t.addSubject;
    document.getElementById('subject-form').reset();
    document.getElementById('grade-list').innerHTML = '';
    const subjectSelect = document.getElementById('subject-name');
    const customSubjectInput = document.getElementById('custom-subject');
    subjectSelect.value = '';
    customSubjectInput.style.display = 'none';
    customSubjectInput.value = '';
    
    if (day !== null) {
        document.getElementById('subject-day').value = day;
    }
    
    document.getElementById('subject-modal').classList.add('active');
}

function closeSubjectModal() {
    document.getElementById('subject-modal').classList.remove('active');
    editingSubjectId = null;
}

function editSubject(id) {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;
    
    editingSubjectId = id;
    const t = translations[currentLanguage];
    document.getElementById('modal-title').textContent = t.editSubject;
    document.getElementById('subject-id').value = subject.id;
    const subjectSelect = document.getElementById('subject-name');
    const customSubjectInput = document.getElementById('custom-subject');
    if (['Italiano', 'Storia', 'Geografia', 'Chimica', 'Diritto', 'Fisica', 'Educazione Fisica', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo', 'Musica', 'Arte', 'Religione', 'Civica', 'Tecnologia'].includes(subject.name)) {
        subjectSelect.value = subject.name;
        customSubjectInput.style.display = 'none';
        customSubjectInput.value = '';
    } else {
        subjectSelect.value = 'custom';
        customSubjectInput.style.display = 'block';
        customSubjectInput.value = subject.name;
    }
    document.getElementById('subject-day').value = subject.day;
    document.getElementById('homework-desc').value = subject.homework || '';
    document.getElementById('homework-deadline').value = subject.homeworkDeadline || '';
    document.getElementById('homework-priority').value = subject.homeworkPriority || 'medium';
    document.getElementById('homework-done').checked = subject.homeworkDone || false;
    document.getElementById('subject-note').value = subject.note || '';
    
    document.getElementById('grade-list').innerHTML = '';
    if (subject.grades && subject.grades.length > 0) {
        subject.grades.forEach(grade => addGradeInput(grade));
    }
    
    document.getElementById('subject-modal').classList.add('active');
}

function saveSubject() {
    const id = editingSubjectId || generateId();
    const subjectSelect = document.getElementById('subject-name');
    const customSubjectInput = document.getElementById('custom-subject');
    const name = subjectSelect.value === 'custom' ? customSubjectInput.value : subjectSelect.value;
    const day = parseInt(document.getElementById('subject-day').value);
    const homework = document.getElementById('homework-desc').value;
    const homeworkDeadline = document.getElementById('homework-deadline').value;
    const homeworkPriority = document.getElementById('homework-priority').value;
    const homeworkDone = document.getElementById('homework-done').checked;
    const note = document.getElementById('subject-note').value;
    const gradeQuarter = parseInt(document.getElementById('grade-quarter').value);
    const grades = Array.from(document.querySelectorAll('.grade-item')).map(item => ({
        value: item.querySelector('.grade-value').value,
        quarter: gradeQuarter
    })).filter(grade => grade.value);
    
    if (!name) {
        alert('Devi selezionare o inserire una materia!');
        return;
    }
    
    if (editingSubjectId) {
        const index = subjects.findIndex(s => s.id === editingSubjectId);
        if (index !== -1) {
            subjects[index] = { 
                id, name, day, 
                homework, homeworkDeadline, homeworkPriority, homeworkDone, 
                note, grades 
            };
        }
    } else {
        subjects.push({ 
            id, name, day, 
            homework, homeworkDeadline, homeworkPriority, homeworkDone, 
            note, grades 
        });
    }
    
    saveSubjects();
    closeSubjectModal();
    renderWeeklyView();
    renderDailyView();
    renderMonthlyView();
    renderStatsView();
}

function deleteSubject(id) {
    const t = translations[currentLanguage];
    const confirmMessage = t.save === "Salva Materia" 
        ? "Sei sicuro di voler eliminare questa materia?" 
        : "Are you sure you want to delete this subject?";
        
    if (confirm(confirmMessage)) {
        subjects = subjects.filter(s => s.id !== id);
        saveSubjects();
        renderWeeklyView();
        renderDailyView();
        renderMonthlyView();
        renderStatsView();
    }
}

function saveSubjects() {
    localStorage.setItem('schoolSubjects', JSON.stringify(subjects));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function getDateString(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}
