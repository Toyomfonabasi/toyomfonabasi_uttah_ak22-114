document.getElementById("commentForm").addEventListener("submit", function(event){

    event.preventDefault();


    let form = this;


    let formData = new FormData(form);


    fetch("https://formspree.io/f/xykryyla", {

        method: "POST",

        body: formData,

        headers: {
            "Accept": "application/json"
        }

    })


    .then(response => {

        if(response.ok){

            alert("Comment sent successfully!");

            form.reset();

        }

        else{

            alert("Message could not be sent.");

        }

    })


    .catch(error => {

        alert("An error occurred.");

    });


});