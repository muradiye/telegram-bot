import MealMenu from '../models/MealMenu'

export async function mealMenuList() {
  let d = new Date();
  let dateStr = ('0' + d.getDate()).slice(-2) + '.'
             + ('0' + (d.getMonth()+1)).slice(-2) + '.'
             + d.getFullYear();
  try {
    let result = await MealMenu.findOne({date: dateStr});
    if(result) {
      return `${result.date} günü yemekleri: \n` + result.content.map(c => `  · ${c}\n`).join('');
    }
    else {
      return 'Bu gün için yemek listesi bulunamadı.';
    }
  }
  catch(e) {
    console.error(e.stack);
  }
}

export async function saveMenuList(list) {
  try {
    let d = new Date();
    let dateStr = ('0' + d.getDate()).slice(-2) + '.'
               + ('0' + (d.getMonth()+1)).slice(-2) + '.'
               + d.getFullYear();
    let result = await MealMenu.remove({date: dateStr});
    let menu = new MealMenu({date: dateStr, content: list});
    await menu.save();
    return true;
  }
  catch(e) {
    console.error(e.stack);
    return false;
  }
}

export default {
  mealMenuList, saveMenuList
}