const clientKey = JSON.parse(document.getElementById('client-key').innerHTML);
const request = JSON.parse(document.getElementById('integration-type').innerHTML);

// Used to finalize a checkout call in case of redirect
const urlParams = new URLSearchParams(window.location.search);
console.log(urlParams)
const sessionId = urlParams.get('sessionId'); // Unique identifier for the payment session
const redirectResult = urlParams.get('redirectResult');
console.log(redirectResult)
// Start the Checkout workflow
async function startCheckout() {
	    // Init Sessions ("/api/sessions?type=") and get json request from session.py (request)
		const checkoutSessionResponse = await callServer("/api/sessions?type=" + request);
        const checkout = await createAdyenCheckout(checkoutSessionResponse)

		// Create an instance of Drop-in and mount it to the container you created.
		const dropinComponent = checkout.create(request).mount("#dropin");  // pass DIV id where component must be rendered
}

// Some payment methods use redirects. This is where we finalize the operation
async function finalizeCheckout() {
        // Create AdyenCheckout re-using existing Session
        const checkout = await createAdyenCheckout({id: sessionId});

        // Submit the extracted redirectResult for onPaymentCompleted as the result
        checkout.submitDetails({details: {redirectResult}});

}

async function createAdyenCheckout(session) {

    const configuration = {
        clientKey,
        locale: "en_US",
        environment: "test",  // change to live for production
        showPayButton: true,
        session: session,
        paymentMethodsConfiguration: {
            ideal: {
                showImage: true
            },
            card: {
                hasHolderName: true,
                holderNameRequired: true,
                name: "Credit or debit card",
                amount: {
                    value: 10000,
                    currency: "EUR"
                }
            },
            alipay: {
                amount: {
                    currency: "CNY",
                    value: 10000 // 100€ in minor units
                },
                environment: "test",
                countryCode: "CH"
            }
        },
        onPaymentCompleted: (result) => {
            handleServerResponse(result);
        },
        onError: (error) => {
            console.error(error.name, error.message, error.stack);
        }
    };

    return new AdyenCheckout(configuration);
}

// Calls your server endpoints
async function callServer(url, data) {
	const res = await fetch(url, {
		method: "POST",
		body: data ? JSON.stringify(data) : "",
		headers: {
			"Content-Type": "application/json"
		}
	});

	return await res.json();
}

// if get response finished, decide what to do, if not handle the action
function handleServerResponse(res) {
    switch (res.resultCode) {
        case "Authorised":
            window.location.href = "/result/success";
            break;
        case "Refused":
            window.location.href = "/result/failed";
            break;
        default:
            window.location.href = "/result/failed";
            break;
    }

}

if (!sessionId) {
    startCheckout();
}
else {
    finalizeCheckout();
}