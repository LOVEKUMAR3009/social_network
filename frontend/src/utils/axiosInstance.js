import axios  from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE_API
const axiosInstance = axios.create({
    baseURL  :baseURL,
    headers: {
        
    }
})


// request intercepter

axiosInstance.interceptors.request.use(
    function(config){
        console.log('request =>',config)
        const accessToken = localStorage.getItem("accessToken")
        if(accessToken){
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config
    },function(error){
        return Promise.reject(error)
    }
)

// response intercepter
axiosInstance.interceptors.response.use(function(response){
    return response
}, async function(error){
    const originalRequest = error.config;
    // console.log(originalRequest)
    if(error.response?.status=== 401 && !originalRequest.retry){
        // console.log(error)
        originalRequest.retry = true
        const refreshToken = localStorage.getItem("refreshToken")
        try{
            const response =  await axios.post(`${baseURL}token/refresh/`,{refresh:refreshToken})
            localStorage.setItem("accessToken",response.data.access)
            // localStorage.setItem("refreshToken",response.data.refresh)
            // console.log("intercepters" ,response.data.access)
            // console.log("response =>", response)
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`
            return axiosInstance(originalRequest)
        }catch(error){
            // console.log("intercepter error")
           localStorage.removeItem("accessToken")

           localStorage.removeItem("refreshToken")
        //    window.location.href = "/login";
        }
         return Promise.reject(error);
    }
    return Promise.reject(error);
})

export default axiosInstance