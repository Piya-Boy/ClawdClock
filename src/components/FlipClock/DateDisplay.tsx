import type { Theme } from '../../themes';
import type { DateEra } from '../../types';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

const CE_DAYS_SHORT  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const CE_DAYS_LONG   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const CE_MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const CE_MONTHS_LONG  = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

const BE_DAYS_SHORT  = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
const BE_DAYS_LONG   = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
const BE_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const BE_MONTHS_LONG  = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function formatDate(date: Date, format: 'short' | 'long', era: DateEra): string {
  const d = date.getDay();
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.getMonth();
  const ceYear = date.getFullYear();
  const beYear = ceYear + 543;

  if (era === 'CE') {
    const shortYear = String(ceYear).slice(-2);
    const longYear = String(ceYear);
    if (format === 'short') {
      return `${CE_DAYS_SHORT[d]} ${day} ${CE_MONTHS_SHORT[month]} ${shortYear}`;
    }
    return `${CE_DAYS_LONG[d]}, ${CE_MONTHS_LONG[month]} ${day}, ${longYear}`;
  } else {
    const shortYear = String(beYear).slice(-2);
    const longYear = String(beYear);
    if (format === 'short') {
      return `${BE_DAYS_SHORT[d]} ${day} ${BE_MONTHS_SHORT[month]} ${shortYear}`;
    }
    return `${BE_DAYS_LONG[d]}, ${day} ${BE_MONTHS_LONG[month]} ${longYear}`;
  }
}

interface Props {
  date: Date;
  format: 'short' | 'long';
  era: DateEra;
  theme: Theme;
}

export function DateDisplay({ date, format, era, theme }: Props) {
  const text = formatDate(date, format, era);
  return (
    <div style={{
      fontSize: format === 'short' ? 52 : 38,
      fontWeight: 800,
      color: theme.digitColorBot,
      fontFamily: FF,
      letterSpacing: format === 'short' ? '0.08em' : '0.04em',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      marginBottom: 24,
    }}>
      {text}
    </div>
  );
}
