import { useEffect, useState } from "react";
import axios from "axios";

const useAxios = (url, credentials) => {

    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!url.includes("null") && !url.includes("undefined")) {
            credentials ? 
            axios
            .get(url, {withCredentials: true})
            .then((response) => {
                setData(response.data)
                setIsPending(false)
            }).catch((error) => {
                setIsPending(false)
                setError(error.message)
            }) :
            axios
            .get(url)
            .then((response) => {
                setData(response.data)
                setIsPending(false)
            }).catch((error) => {
                setIsPending(false)
                setError(error.message)
            })
        }
    }, [url, credentials])

    return {data, isPending, error}

}

export default useAxios
