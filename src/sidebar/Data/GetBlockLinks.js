const GetBlockLinks = () => {
    
    console.log(crbTextarea);
    crbTextarea.addEventListener("change", () => {
        console.log(`Changed`);
        console.log(getBlockLinks());
    })



}

export default GetBlockLinks;