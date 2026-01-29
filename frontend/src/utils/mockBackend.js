// Mock backend for testing until real backend is ready
export const mockBackend = {
  login: async (employeeId, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (employeeId === 'SAY001' && password === 'Admin@123') {
      return {
        data: {
          status: 'success',
          data: {
            user: {
              id: '1',
              employeeId: 'SAY001',
              fullNameAm: 'የአስተዳዳሪ ስም',
              fullNameEn: 'Administrator',
              email: 'admin@sayintworeda.gov.et',
              role: 'super_admin',
              department: 'Administration'
            },
            token: 'mock-jwt-token'
          }
        }
      };
    }
    
    throw new Error('Invalid employee ID or password');
  },
  
  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        status: 'success',
        data: {
          user: {
            id: '1',
            employeeId: 'SAY001',
            fullNameAm: 'የአስተዳዳሪ ስም',
            fullNameEn: 'Administrator',
            email: 'admin@sayintworeda.gov.et',
            role: 'super_admin',
            department: 'Administration'
          }
        }
      }
    };
  }
};