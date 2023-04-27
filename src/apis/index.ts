import AUTH from './auth';

const API = (router: any) => {
  // APIs for Auth
  router.post('/register', AUTH.register);
  router.post("/login", AUTH.login);
};

export default API;
