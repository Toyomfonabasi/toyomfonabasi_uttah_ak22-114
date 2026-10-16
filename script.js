
const commentForm = document.getElementById("commentForm");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");

/*
  IMPORTANT:
  Replace the URL below with your existing Formspree endpoint.
  It usually looks like: https://formspree.io/f/xxxxxxxx
*/
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykryyla";

commentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (
        !FORMSPREE_ENDPOINT ||
        FORMSPREE_ENDPOINT.includes("https://formspree.io/f/xykryyla")
    ) {
        formStatus.textContent =
            "The comment form needs its Formspree endpoint configured.";
        formStatus.style.color = "#a13d32";
        return;
    }

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    formStatus.textContent = "";

    const formData = new FormData(commentForm);

    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            formStatus.textContent = "Thank you! Your comment has been sent.";
            formStatus.style.color = "#34734a";

            commentForm.reset();
        } else {
            formStatus.textContent =
                "Your comment could not be sent. Please try again.";
            formStatus.style.color = "#a13d32";
        }
    } catch (error) {
        formStatus.textContent =
            "A connection error occurred. Please check your internet and try again.";
        formStatus.style.color = "#a13d32";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});
