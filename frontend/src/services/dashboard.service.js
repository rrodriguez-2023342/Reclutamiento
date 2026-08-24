import api from './api.js'

export const getDashboardSummary = async () => {
  const { data } = await api.get('/dashboard')
  return data.data
}
