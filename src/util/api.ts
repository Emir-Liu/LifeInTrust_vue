import { get } from "./http"

const api_request = {
    TaskBlueprint:{
        add(data: any) {
            return get('/task/add/',data)
        },
        list(data: any) {
            return get('/task/list/',data)
        },
        delete(data: any) {
            return get('/task/delete/',data)
        },
        update(data: any) {
            return get('/task/update/',data)
        },
    }
}

export default api_request