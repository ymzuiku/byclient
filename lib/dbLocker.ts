interface IDbLocker {
  [key: string]: {
    /** 操作时必须设置的filter */
    filter: any[];
    /** 返回时默认修剪的对象 */
    trim: string[];
  };
}

export let dbLocker: IDbLocker = {};

// interface ILocker {
//   [key: string]: string[];
// }

// export const setDbLocker = (locker: ILocker) => {
//   Object.keys(locker).forEach(key => {
//     dbLocker[key] = locker[key];
//   });
// };
