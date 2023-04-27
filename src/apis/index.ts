import AUTH from './auth';

const API = (router: any) => {
  // APIs for Auth
  router.post('/register', AUTH.register);
};

export default API;
