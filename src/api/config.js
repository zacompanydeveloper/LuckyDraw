export default {
    header: () => ({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-TOKEN': import.meta.env.VITE_X_API_KEY,
      'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
    }),
    fileHeader: () => ({
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      'X-API-TOKEN': import.meta.env.VITE_X_API_KEY,
      'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
    })
  };