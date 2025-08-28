import axios from "axios"
import { BASE_URL } from "../constants"
import { CloseCircleOutlined } from "@ant-design/icons"
import { Modal, notification } from "antd"
const baseUrl = BASE_URL + '/api'

class AjaxService {

    getUrl = (url) => baseUrl + url

    async get(url) {

        const token = localStorage.getItem('token');

        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }

        let options = { method: 'GET', headers: headers }

        return fetch(this.getUrl(url), options)
            .then(async (response) => {

                const pathname = new URL(response.url).pathname;
                if (pathname === '/login') {
                    return Modal.warning({
                        title: 'Token Expired',
                        content: 'Your token has expired. Please log in again.',
                        onOk: () => {
                            localStorage.clear();
                            window.location.reload(false);
                        },
                    });
                }

                if (response.ok) {
                    return response.json()
                } else {
                    const result = await response.json();
                    if (result.message) {
                        notification.open({ message: result.message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
                    }

                    return result;
                }
            })
            .then(data => {
                return data;
            })
            .catch(async error => {
                console.error("error get data:", error)
            })
    }

    async delete(url, id) {

        const token = localStorage.getItem('token');

        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }

        let options = { method: 'DELETE', headers: headers }

        return fetch(this.getUrl(url) + id, options)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(data => {
                return data;
            })
            .catch(error => {
                console.error("error deleting data:", error)
            })
    }

    async post(url, data = null) {

        const token = localStorage.getItem('token');
        const isFormData = data instanceof FormData;

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        if (isFormData) {
            delete headers['Content-Type'];
        }

        return fetch(this.getUrl(url), {
            method: 'POST',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data)
        })
            .then(async (response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    const result = await response.json();
                    // if (result.message) {
                    //     notification.open({ message: result.message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
                    // }
                    return result;
                }
                // throw response
            })
            .then((result) => {
                return result
            })
            .catch(error => {
                console.error("error post data:", error)
            })
    }

    async put(url, id, data) {

     
        const token = localStorage.getItem('token');
        const isFormData = data instanceof FormData;

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        if (isFormData) {
            delete headers['Content-Type'];
        }

        return fetch(this.getUrl(url) + id, {
            method: 'PUT',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data)
        })
            .then(async (response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    const result = await response.json();
                    return result;
                }
            })
            .then(result => {
                return result
            }).catch(error => {
                console.error("error put data:", error)
            })
    }

    async getAccessToken(email, password) {

        let data = {
            email: email,
            password: password,
            grant_type: 'password'
        };

        const uri = `${baseUrl}/login`;
        let headers = {
            'Accept': 'application/json',
        };
        let options = {
            method: 'POST',
            headers: headers,
            url: uri,
            data: data,
        }

        return axios(options).then(response => {

            if (!response.status) {
                return response;
            } else {
                return response.data;
            }
        }).catch(function (error) {
            console.error("error fetchinng data:", error)
            return error.response.data
        });
    }
}

const ajaxService = new AjaxService()

export default ajaxService