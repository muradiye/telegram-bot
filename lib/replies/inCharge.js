import InCharge from '../models/InCharge'

export async function getInCharge() {
  let d = new Date()
  let dateStr = ('0' + d.getDate()).slice(-2) + '.'
             + ('0' + (d.getMonth()+1)).slice(-2) + '.'
             + d.getFullYear();
  try {
    let result = await InCharge.findOne({date: dateStr});
    if(result) {
      return `${result.date} günü nöbetçi personeli: \n` + result.member;
    }
    else {
      return 'Bu gün için nöbetçi kaydı bulunamadı.';
    }
  }
  catch(e) {
    console.error(e.stack);
  }
}