export let dbLocker: any = {
  dev_user: ['token.$eq', ['username.$eq', 'password.$eq']],
};

// interface ILocker {
//   [key: string]: string[];
// }

// export const setDbLocker = (locker: ILocker) => {
//   Object.keys(locker).forEach(key => {
//     dbLocker[key] = locker[key];
//   });
// };
