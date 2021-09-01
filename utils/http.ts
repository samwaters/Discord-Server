import axios from 'axios'

export class HttpUtils {
  static async authenticatedGet (path: string, authorization: string) {
    const response = await axios.get(path, {
      headers: {
        Authorization: authorization,
      },
    })
    if (response.status !== 200) throw new Error(response.data)
    return response.data
  }

  static async post (url: string, body: string) {
    const response = await axios.post(url, body)
    if (response.status !== 200) throw new Error(response.data)
    return response.data
  }
}
