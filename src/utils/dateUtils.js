/**
 * Utilitaires pour la gestion des dates et calcul de jours ouvrables
 */

/**
 * Vérifie si une date est un weekend (samedi ou dimanche)
 * @param {Date} date - La date à vérifier
 * @returns {boolean}
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Dimanche, 6 = Samedi
};

/**
 * Vérifie si une date est un jour férié
 * @param {Date} date - La date à vérifier
 * @param {Array} holidays - Liste des jours fériés (format: YYYY-MM-DD)
 * @returns {boolean}
 */
export const isHoliday = (date, holidays = []) => {
  const dateString = formatDateToISO(date);
  return holidays.some(holiday => {
    const holidayDate = typeof holiday === 'string' ? holiday : holiday.date;
    return holidayDate === dateString;
  });
};

/**
 * Calcule le nombre de jours ouvrables entre deux dates
 * Exclut les weekends et les jours fériés
 * @param {Date|string} startDate - Date de début
 * @param {Date|string} endDate - Date de fin
 * @param {Array} holidays - Liste des jours fériés (optionnel)
 * @returns {number}
 */
export const calculateWorkingDays = (startDate, endDate, holidays = []) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Normaliser les dates à minuit
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return 0;
  }

  let workingDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    if (!isWeekend(currentDate) && !isHoliday(currentDate, holidays)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

/**
 * Formate une date en ISO (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
export const formatDateToISO = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formate une date en format français (DD/MM/YYYY)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateToFrench = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formate une date avec l'heure en français
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateTimeToFrench = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtient la liste des mois pour une année donnée
 * @param {number} year
 * @returns {Array}
 */
export const getMonthsForYear = (year) => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return {
      index: i,
      name: date.toLocaleDateString('fr-FR', { month: 'long' }),
      shortName: date.toLocaleDateString('fr-FR', { month: 'short' }),
      year: year
    };
  });
};

/**
 * Obtient tous les jours d'un mois
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {Array}
 */
export const getDaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      date: date,
      day: i + 1,
      isWeekend: isWeekend(date),
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' })
    };
  });
};

/**
 * Vérifie si deux périodes se chevauchent
 * @param {Date} start1
 * @param {Date} end1
 * @param {Date} start2
 * @param {Date} end2
 * @returns {boolean}
 */
export const periodsOverlap = (start1, end1, start2, end2) => {
  return start1 <= end2 && start2 <= end1;
};

/**
 * Ajoute des jours à une date
 * @param {Date|string} date
 * @param {number} days
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calcule la différence en jours entre deux dates
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
export const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Obtient le début et la fin de l'année
 * @param {number} year
 * @returns {Object}
 */
export const getYearBounds = (year) => {
  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31)
  };
};

/**
 * Obtient l'année fiscale actuelle
 * @returns {number}
 */
export const getCurrentFiscalYear = () => {
  return new Date().getFullYear();
};

/**
 * Parse une date en format ISO vers Date
 * @param {string} dateString (YYYY-MM-DD)
 * @returns {Date}
 */
export const parseISODate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Vérifie si une date est dans le passé
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

/**
 * Obtient la date d'aujourd'hui au format ISO
 * @returns {string}
 */
export const getTodayISO = () => {
  return formatDateToISO(new Date());
};
