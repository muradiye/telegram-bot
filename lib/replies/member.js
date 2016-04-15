import { InCharge, Member } from '../models'

export async function getInCharge() {
  let d = new Date()
  let dateStr = ('0' + d.getDate()).slice(-2) + '.'
             + ('0' + (d.getMonth()+1)).slice(-2) + '.'
             + d.getFullYear();
  try {
    let result = await InCharge.findOne({date: dateStr}).populate('member');
    if(result) {
      console.log(result);
      return result.member;
    }
    else {
      return 'Bu gün için nöbetçi kaydı bulunamadı.';
    }
  }
  catch(e) {
    console.error(e.stack);
  }
}

export async function getMembers() {
  try {
    let result = await Member.find({});
    if(result) {
      return result;
    }
    else {
      return [];
    }
  }
  catch(e) {
    console.error(e.stack);
  }
}

export default {
  getInCharge,
  getMembers
}