import { get } from 'lodash';

export function checkFilter(obj: any, matchs: string[]) {
  let isMatch = true;

  for (let i = 0; i < matchs.length; i++) {
    const match = matchs[i];
    const list = match.split('||');
    let subMatch = false;
    list.forEach(m => {
      const txt = m.trim();

      if (get(obj, txt)) {
        subMatch = true;
      }
    });
    if (!subMatch) {
      isMatch = false;
      break;
    }
  }

  return isMatch;
}
