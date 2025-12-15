
function convertDate(data){
    const date = new Date(data);

    const readable = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
    });
    return readable
}

export default convertDate