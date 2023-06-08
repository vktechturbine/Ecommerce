const deleteFunction = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const jwtToken = btn.parentNode.querySelector('[name=jsonToken]').value;

    console.log(productId);
    console.log(jwtToken);
    
    fetch('/admin/products/'+productId,{
        method:'POST',
        headers:{
            'jwt-token':jwtToken
        }
    }).then(result => {
        console.log(result);
    }).catch(error => {
        console.log(error);
    })
}