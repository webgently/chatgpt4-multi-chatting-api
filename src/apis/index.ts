import AUTH from './auth';
import History from './history';
import Admin from './admin';

const API = (router: any) => {
  // APIs for Auth
  router.post('/register', AUTH.register);
  router.post('/login', AUTH.login);
  // APIs for Admin
  router.post('/getAllUsers', Admin.getUsers);
  router.post('/clearHistory', History.removeHistory);
  router.post('/updateStatus', AUTH.updateStatus);
};

export default API;
